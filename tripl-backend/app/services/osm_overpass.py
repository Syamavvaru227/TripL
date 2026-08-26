"""OSM Overpass API — secondary source for tourist places (may be blocked in some networks)."""

from typing import Any, Dict, List, Optional
import httpx
from app.services.geo_utils import haversine_km

OVERPASS_URLS = (
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
)
USER_AGENT = "TripL-App/1.0 (tripl@example.com)"


def _category(tags: Dict[str, str]) -> str:
    if tags.get("amenity") == "place_of_worship" or tags.get("religion"):
        return "Temple"
    if tags.get("natural") == "beach":
        return "Beach"
    if tags.get("tourism") in {"museum", "gallery"} or tags.get("historic"):
        return "Museum"
    if tags.get("leisure") in {"park", "garden", "nature_reserve"} or tags.get("tourism") in {"zoo", "theme_park"}:
        return "Park"
    return "Viewpoint"


def _duration(category: str) -> int:
    return {"Beach": 120, "Temple": 60, "Park": 90, "Museum": 90, "Viewpoint": 60}.get(category, 60)


def _coordinates(element: Dict[str, Any]) -> Optional[tuple]:
    if "lat" in element and "lon" in element:
        return float(element["lat"]), float(element["lon"])
    center = element.get("center")
    if center and "lat" in center and "lon" in center:
        return float(center["lat"]), float(center["lon"])
    return None


async def fetch_overpass_places(city: str, latitude: float, longitude: float, radius_km: float) -> List[Dict[str, Any]]:
    """Fetch places from OSM Overpass API — may be blocked in some networks."""
    radius_m = max(1_000, min(int(radius_km * 1_000), 50_000))
    query = f"""
    [out:json][timeout:10];
    (
      nwr["tourism"~"attraction|museum|gallery|viewpoint|zoo|theme_park"](around:{radius_m},{latitude},{longitude});
      nwr["historic"](around:{radius_m},{latitude},{longitude});
      nwr["leisure"~"park|garden|nature_reserve"](around:{radius_m},{latitude},{longitude});
      nwr["amenity"="place_of_worship"](around:{radius_m},{latitude},{longitude});
      nwr["natural"="beach"](around:{radius_m},{latitude},{longitude});
    );
    out center tags;
    """
    elements = []
    async with httpx.AsyncClient(timeout=8.0, headers={"User-Agent": USER_AGENT}) as client:
        for endpoint in OVERPASS_URLS:
            try:
                response = await client.post(endpoint, data={"data": query})
                response.raise_for_status()
                elements = response.json().get("elements", [])
                if elements:
                    break
            except (httpx.HTTPError, ValueError):
                continue

    places: List[Dict[str, Any]] = []
    seen = set()
    for element in elements:
        tags = element.get("tags") or {}
        name = tags.get("name") or tags.get("name:en")
        coords = _coordinates(element)
        if not name or not coords:
            continue
        place_lat, place_lon = coords
        distance = haversine_km(latitude, longitude, place_lat, place_lon)
        if distance > radius_km:
            continue
        key = (name.casefold(), round(place_lat, 4), round(place_lon, 4))
        if key in seen:
            continue
        seen.add(key)
        category = _category(tags)
        kind = tags.get("tourism") or tags.get("historic") or tags.get("leisure") or tags.get("natural") or "attraction"
        address_parts = [tags.get("addr:street"), tags.get("addr:suburb"), city]
        places.append({
            "name": name,
            "latitude": place_lat,
            "longitude": place_lon,
            "category_name": category,
            "rating": 4.0,
            "avg_visit_duration": _duration(category),
            "entry_fee": 0.0,
            "opening_time": None,
            "closing_time": None,
            "description": f"{kind.replace('_', ' ').title()} in {city}, sourced from OpenStreetMap.",
            "address": ", ".join(part for part in address_parts if part),
            "city": city,
            "distance_km": round(distance, 2),
        })

    if places:
        places.sort(key=lambda place: place["distance_km"])
        return places[:100]
    return []
