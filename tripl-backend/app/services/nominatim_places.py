"""Search for tourist places using Nominatim search API."""

from typing import Any, Dict, List
import asyncio
import httpx
from app.services.geo_utils import haversine_km

NOMINATIM_URL = "https://nominatim.openstreetmap.org"
USER_AGENT = "TripL-App/1.0 (tripl@example.com)"

SEARCH_QUERIES = [
    ("temple in {city}", "Temple"),
    ("museum in {city}", "Museum"),
    ("park in {city}", "Park"),
    ("fort in {city}", "Museum"),
    ("monument in {city}", "Viewpoint"),
    ("shrine in {city}", "Temple"),
    ("garden in {city}", "Park"),
    ("cave in {city}", "Viewpoint"),
]

GENERIC_NAMES = {"temple", "mosque", "church", "museum", "park", "garden", "fort", "monument", "shrine", "cave", "beach"}


def _extract_name(display_name: str) -> str:
    parts = [p.strip() for p in display_name.split(",")]
    name = parts[0] if parts else ""
    if name.lower() in GENERIC_NAMES:
        for p in parts[1:4]:
            clean = p.strip()
            if len(clean) > 4 and clean.lower().split()[0] not in GENERIC_NAMES:
                return clean
    return name


async def search_nominatim_places(city: str, latitude: float, longitude: float, radius_km: float) -> List[Dict[str, Any]]:
    """Search for tourist places using Nominatim — sequential requests."""
    places = []
    seen = set()

    async with httpx.AsyncClient(timeout=6.0, headers={"User-Agent": USER_AGENT}) as client:
        for query_template, category in SEARCH_QUERIES:
            query = query_template.format(city=city)
            try:
                response = await client.get(
                    f"{NOMINATIM_URL}/search",
                    params={"q": query, "format": "json", "limit": 10, "countrycodes": "in"},
                )
                response.raise_for_status()
                results = response.json()

                for item in results:
                    name = _extract_name(item.get("display_name", ""))
                    if not name or len(name) < 3:
                        continue

                    lat = float(item.get("lat", 0))
                    lon = float(item.get("lon", 0))
                    if lat == 0 or lon == 0:
                        continue

                    dist = haversine_km(latitude, longitude, lat, lon)
                    if dist > radius_km:
                        continue

                    key = (name.casefold(), round(lat, 3), round(lon, 3))
                    if key in seen:
                        continue
                    seen.add(key)

                    places.append({
                        "name": name,
                        "latitude": lat,
                        "longitude": lon,
                        "category_name": category,
                        "rating": 4.0,
                        "avg_visit_duration": {"Temple": 60, "Museum": 90, "Park": 90, "Beach": 120, "Viewpoint": 60}.get(category, 60),
                        "entry_fee": 0.0,
                        "opening_time": None,
                        "closing_time": None,
                        "description": f"Point of interest near {city}.",
                        "address": item.get("display_name", city),
                        "city": city,
                        "distance_km": round(dist, 2),
                    })

            except Exception:
                pass

            await asyncio.sleep(0.6)

    places.sort(key=lambda p: p["distance_km"])
    return places[:100]
