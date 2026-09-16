import asyncio

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Place, Category
from app.schemas import PlaceWithDistance
from app.services.geo_utils import haversine_km
from app.services.geocoder import geocode_city, reverse_geocode

import httpx

router = APIRouter(prefix="/api/places", tags=["places"])


def _category_term(value: str) -> str:
    normalized = value.casefold().strip()
    return {"beaches": "beach", "parks": "park"}.get(normalized, normalized.rstrip("s"))


def _category_for_name(categories: dict[str, Category], name: Optional[str]) -> Optional[Category]:
    """Find a seeded category while accepting singular/plural source labels."""
    if not name:
        return None
    wanted = _category_term(name)
    return next(
        (category for category_name, category in categories.items()
         if _category_term(category_name) == wanted),
        None,
    )


def _category_payload(category: Optional[Category], fallback_name: str = "Heritage") -> dict:
    if category:
        return {"id": category.id, "name": category.name, "icon": category.icon, "color": category.color}
    return {"id": None, "name": fallback_name, "icon": "🏛️", "color": "#C2410C"}


def _place_key(place: dict) -> str:
    """Deduplicate sources by their public place name, preferring richer records first."""
    return str(place.get("name", "")).strip().casefold()


@router.get("/nearby")
async def get_nearby_places(
    city: Optional[str] = Query(None, description="City name"),
    latitude: Optional[float] = Query(None, ge=-90, le=90),
    longitude: Optional[float] = Query(None, ge=-180, le=180),
    radius: float = Query(30.0, description="Search radius in km"),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Return all tourist places within `radius` km of the given city.

    Combine seeded records with live, free sources. A seeded match is useful but
    must not hide nearby attractions that have not been added to our database.
    """
    if (latitude is None) != (longitude is None):
        raise HTTPException(status_code=422, detail="Send both latitude and longitude for a live-location search.")

    # 1. Resolve coordinates
    if latitude is not None:
        coords = (latitude, longitude)
        # Reverse-geocode to get the actual city name (not "Your location")
        if not city or city == "Your location":
            resolved = await reverse_geocode(latitude, longitude)
            if resolved:
                city = resolved
            else:
                city = "Your location"
    elif not city:
        raise HTTPException(status_code=422, detail="Enter a city or use your live location.")
    else:
        coords = await geocode_city(city)

    if not coords:
        sample = db.query(Place).filter(Place.city.ilike(f"%{city}%"), Place.is_active == True).first()
        if sample:
            coords = (float(sample.latitude), float(sample.longitude))
        else:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found.")

    origin_lat, origin_lon = coords
    categories = {item.name: item for item in db.query(Category).all()}

    # 2. Start with database records: they contain the richest curated details.
    db_places = db.query(Place).filter(
        Place.is_active == True,
        Place.city.ilike(f"%{city}%"),
    ).all()

    result = []
    if db_places:
        for place in db_places:
            dist = haversine_km(origin_lat, origin_lon, float(place.latitude), float(place.longitude))
            if dist > radius:
                continue
            if category:
                if not place.category or _category_term(category) not in _category_term(place.category.name):
                    continue
            cat = place.category
            result.append({
                "id": place.id,
                "name": place.name,
                "category_id": place.category_id,
                "latitude": float(place.latitude),
                "longitude": float(place.longitude),
                "rating": float(place.rating),
                "avg_visit_duration": place.avg_visit_duration,
                "opening_time": str(place.opening_time) if place.opening_time else None,
                "closing_time": str(place.closing_time) if place.closing_time else None,
                "entry_fee": float(place.entry_fee),
                "description": place.description,
                "image_url": place.image_url,
                "address": place.address,
                "city": place.city,
                "distance_km": round(dist, 2),
                "category": {"id": cat.id, "name": cat.name, "icon": cat.icon, "color": cat.color} if cat else None,
            })
    # 3. Enrich results with real-time sources in parallel. Overpass is especially
    # useful for local beaches, parks, and temples that Wikipedia does not list.
    from app.services.google_places import fetch_google_tourist_places
    from app.services.osm_overpass import fetch_overpass_places
    from app.services.osm_places import fetch_real_places

    source_results = await asyncio.gather(
        fetch_google_tourist_places(city, origin_lat, origin_lon, radius),
        asyncio.wait_for(fetch_overpass_places(city, origin_lat, origin_lon, radius), timeout=12.0),
        asyncio.wait_for(fetch_real_places(city, origin_lat, origin_lon, radius), timeout=25.0),
        return_exceptions=True,
    )

    seen_names = {_place_key(place) for place in result if _place_key(place)}
    next_live_id = -1
    for source in source_results:
        if isinstance(source, Exception):
            continue
        for raw_place in source:
            # Source results may come from the in-memory Wikipedia cache; do not
            # mutate those cached dictionaries while adding UI-specific fields.
            place = dict(raw_place)
            key = _place_key(place)
            if not key or key in seen_names:
                continue
            cat_name = place.pop("category_name", None)
            category_obj = _category_for_name(categories, cat_name)
            if category and (not category_obj or _category_term(category) not in _category_term(category_obj.name)):
                continue
            seen_names.add(key)
            place["id"] = next_live_id
            next_live_id -= 1
            place["category_id"] = category_obj.id if category_obj else None
            place.setdefault("image_url", None)
            place["category"] = _category_payload(category_obj, cat_name or "Heritage")
            result.append(place)

    result.sort(key=lambda place: place["distance_km"])
    return result


@router.get("/wiki-history")
async def get_wiki_history(name: str = Query(..., description="Place name to look up")):
    """Fetch Wikipedia summary/history for a tourist place."""
    try:
        headers = {"User-Agent": "TripL/1.0 (https://tripl.example.com; tripl@example.com)"}
        async with httpx.AsyncClient(timeout=10.0, headers=headers) as client:
            # First search for the Wikipedia article
            search_resp = await client.get(
                "https://en.wikipedia.org/w/api.php",
                params={
                    "action": "query",
                    "list": "search",
                    "srsearch": name,
                    "srlimit": "1",
                    "srnamespace": "0",
                    "format": "json",
                }
            )
            search_data = search_resp.json()
            results = search_data.get("query", {}).get("search", [])
            if not results:
                return {"summary": "", "history": "", "famous_for": "", "facts": [], "sections": []}

            page_title = results[0]["title"]
            page_id = results[0]["pageid"]

            # Get full article extract and sections
            detail_resp = await client.get(
                "https://en.wikipedia.org/w/api.php",
                params={
                    "action": "query",
                    "pageids": str(page_id),
                    "prop": "extracts|pageimages|categories",
                    "exintro": "true",
                    "explaintext": "true",
                    "pithumbsize": "800",
                    "format": "json",
                }
            )
            detail_data = detail_resp.json()
            pages = detail_data.get("query", {}).get("pages", {})
            page = pages.get(str(page_id), {})

            extract = page.get("extract", "")
            thumb = page.get("thumbnail", {})
            image_url = thumb.get("source") if thumb else None

            # Split extract into sections
            paragraphs = [p.strip() for p in extract.split("\n\n") if p.strip()]
            summary = paragraphs[0] if paragraphs else ""
            history = "\n\n".join(paragraphs[1:4]) if len(paragraphs) > 1 else ""
            famous_for = paragraphs[4] if len(paragraphs) > 4 else ""

            # Extract interesting facts
            facts = []
            for p in paragraphs:
                lower = p.lower()
                if any(kw in lower for kw in ("built", "constructed", "founded", "built in", "established", "century", "ancient")):
                    facts.append(p[:200])
                    if len(facts) >= 3:
                        break

            return {
                "summary": summary,
                "history": history,
                "famous_for": famous_for,
                "facts": facts,
                "image_url": image_url,
                "article_title": page_title,
            }
    except Exception:
        return {"summary": "", "history": "", "famous_for": "", "facts": [], "image_url": None, "article_title": ""}


@router.get("/{place_id}")
def get_place(place_id: int, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    cat = db.query(Category).filter(Category.id == place.category_id).first()
    return {
        **{c.name: getattr(place, c.name) for c in place.__table__.columns},
        "latitude": float(place.latitude),
        "longitude": float(place.longitude),
        "rating": float(place.rating),
        "entry_fee": float(place.entry_fee),
        "opening_time": str(place.opening_time),
        "closing_time": str(place.closing_time),
        "category": {"id": cat.id, "name": cat.name, "icon": cat.icon, "color": cat.color} if cat else None,
    }
