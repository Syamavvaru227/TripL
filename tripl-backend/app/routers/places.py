from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Place, Category
from app.schemas import PlaceWithDistance
from app.services.geo_utils import haversine_km
from app.services.geocoder import geocode_city

router = APIRouter(prefix="/api/places", tags=["places"])


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

    Priority order:
    1. Database (seeded data — fast, reliable, rich data)
    2. Wikipedia GeoSearch (real-time, decent quality)
    Never use Nominatim (returns neighborhoods, not tourist places).
    """
    if (latitude is None) != (longitude is None):
        raise HTTPException(status_code=422, detail="Send both latitude and longitude for a live-location search.")

    # 1. Resolve coordinates
    if latitude is not None:
        coords = (latitude, longitude)
        city = city or "Your location"
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

    # 2. Try database first (seeded data has rich info: ratings, fees, hours, descriptions)
    db_places = db.query(Place).filter(
        Place.is_active == True,
        Place.city.ilike(f"%{city}%"),
    ).all()

    if db_places:
        result = []
        for place in db_places:
            dist = haversine_km(origin_lat, origin_lon, float(place.latitude), float(place.longitude))
            if dist > radius:
                continue
            if category:
                if not place.category or category.casefold() not in place.category.name.casefold():
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
        result.sort(key=lambda x: x["distance_km"])
        if result:
            return result

    # 3. Real-time fallback: Wikipedia GeoSearch (the only free API that returns actual tourist places)
    live_places = []
    try:
        import asyncio
        from app.services.osm_places import fetch_real_places
        live_places = await asyncio.wait_for(
            fetch_real_places(city, origin_lat, origin_lon, radius),
            timeout=25.0,
        )
    except Exception:
        pass

    if live_places:
        result = []
        for place in live_places:
            cat_name = place.pop("category_name", None)
            category_obj = categories.get(cat_name) if cat_name else None
            if category and (not category_obj or category.casefold() not in category_obj.name.casefold()):
                continue
            place["id"] = -(len(result) + 1)
            place["category_id"] = category_obj.id if category_obj else None
            place["image_url"] = None
            place["category"] = (
                {"id": category_obj.id, "name": category_obj.name, "icon": category_obj.icon, "color": category_obj.color}
                if category_obj else {"id": None, "name": cat_name or "Heritage", "icon": "🏛️", "color": "#C2410C"}
            )
            result.append(place)
        return result

    # 4. Nothing found
    return []


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
