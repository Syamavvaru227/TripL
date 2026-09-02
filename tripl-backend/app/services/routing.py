"""Real road routing using OSRM (Open Source Routing Machine) public demo server.

Falls back to haversine × 1.4 if OSRM is unavailable.
"""

import httpx
from app.services.geo_utils import haversine_km

OSRM_BASE = "https://router.project-osrm.org"
USER_AGENT = "TripL/1.0 (https://tripl.example.com)"


async def get_road_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> dict:
    """Get real road distance and duration between two points using OSRM.
    
    Returns dict with:
        - distance_km: real road distance
        - duration_min: estimated travel time
        - distance_method: "osrm" or "haversine_estimate"
    """
    try:
        async with httpx.AsyncClient(timeout=8.0, headers={"User-Agent": USER_AGENT}) as client:
            url = f"{OSRM_BASE}/route/v1/driving/{lon1},{lat1};{lon2},{lat2}"
            resp = await client.get(url, params={"overview": "false"})
            data = resp.json()

            if data.get("code") == "Ok" and data.get("routes"):
                route = data["routes"][0]
                return {
                    "distance_km": round(route["distance"] / 1000, 2),
                    "duration_min": round(route["duration"] / 60),
                    "distance_method": "osrm",
                }
    except Exception:
        pass

    # Fallback to haversine estimate
    straight_km = haversine_km(lat1, lon1, lat2, lon2)
    road_km = straight_km * 1.4
    return {
        "distance_km": round(road_km, 2),
        "duration_min": round((road_km / 30) * 60),  # ~30 km/h avg
        "distance_method": "haversine_estimate",
    }


async def get_multi_route(coordinates: list[tuple[float, float]]) -> dict:
    """Get total road distance for a sequence of coordinates.
    
    coordinates: list of (lat, lon) tuples in order
    Returns total distance_km and duration_min.
    """
    if len(coordinates) < 2:
        return {"distance_km": 0, "duration_min": 0, "distance_method": "none"}

    try:
        coords_str = ";".join(f"{lon},{lat}" for lat, lon in coordinates)
        async with httpx.AsyncClient(timeout=10.0, headers={"User-Agent": USER_AGENT}) as client:
            url = f"{OSRM_BASE}/route/v1/driving/{coords_str}"
            resp = await client.get(url, params={"overview": "false"})
            data = resp.json()

            if data.get("code") == "Ok" and data.get("routes"):
                route = data["routes"][0]
                return {
                    "distance_km": round(route["distance"] / 1000, 2),
                    "duration_min": round(route["duration"] / 60),
                    "distance_method": "osrm",
                }
    except Exception:
        pass

    # Fallback: sum haversine distances
    total = 0
    for i in range(len(coordinates) - 1):
        total += haversine_km(coordinates[i][0], coordinates[i][1],
                              coordinates[i + 1][0], coordinates[i + 1][1])
    road_total = total * 1.4
    return {
        "distance_km": round(road_total, 2),
        "duration_min": round((road_total / 30) * 60),
        "distance_method": "haversine_estimate",
    }
