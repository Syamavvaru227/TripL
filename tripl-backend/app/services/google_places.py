"""Optional high-accuracy tourist-place search using Google Places API (New)."""

import os
from typing import Any, Dict, List

import httpx

from app.services.geo_utils import haversine_km

GOOGLE_PLACES_URL = "https://places.googleapis.com/v1/places:searchNearby"


def _category(types: List[str]) -> str:
    values = set(types)
    if values & {"hindu_temple", "church", "mosque", "place_of_worship"}:
        return "Temple"
    if "beach" in values:
        return "Beach"
    if values & {"museum", "art_gallery", "historical_landmark", "cultural_center"}:
        return "Museum"
    if values & {"park", "national_park", "zoo", "amusement_park", "aquarium"}:
        return "Park"
    return "Viewpoint"


async def fetch_google_tourist_places(city: str, latitude: float, longitude: float, radius_km: float) -> List[Dict[str, Any]]:
    """Return well-classified nearby attractions when GOOGLE_MAPS_API_KEY is set."""
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not api_key:
        return []
    radius_m = max(1_000, min(int(radius_km * 1_000), 50_000))
    payload = {
        "includedTypes": ["tourist_attraction", "museum", "park", "hindu_temple", "historical_landmark", "art_gallery"],
        "maxResultCount": 20,
        "rankPreference": "POPULARITY",
        "locationRestriction": {"circle": {"center": {"latitude": latitude, "longitude": longitude}, "radius": radius_m}},
    }
    headers = {
        "Content-Type": "application/json", "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.rating,places.types,places.primaryType,places.regularOpeningHours",
    }
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.post(GOOGLE_PLACES_URL, json=payload, headers=headers)
            response.raise_for_status()
            raw_places = response.json().get("places", [])
    except (httpx.HTTPError, ValueError):
        return []

    places = []
    for raw in raw_places:
        location = raw.get("location") or {}
        name = (raw.get("displayName") or {}).get("text")
        if not name or "latitude" not in location or "longitude" not in location:
            continue
        types = raw.get("types") or []
        category = _category(types)
        place_lat, place_lon = float(location["latitude"]), float(location["longitude"])
        places.append({
            "name": name, "latitude": place_lat, "longitude": place_lon,
            "category_name": category, "rating": float(raw.get("rating") or 0),
            "avg_visit_duration": {"Beach": 120, "Temple": 60, "Park": 90, "Museum": 90, "Viewpoint": 60}[category],
            "entry_fee": 0.0, "opening_time": None, "closing_time": None,
            "description": f"{raw.get('primaryType', 'Tourist attraction').replace('_', ' ').title()} in {city}.",
            "address": raw.get("formattedAddress") or city, "city": city,
            "distance_km": round(haversine_km(latitude, longitude, place_lat, place_lon), 2),
        })
    return sorted(places, key=lambda place: place["distance_km"])
