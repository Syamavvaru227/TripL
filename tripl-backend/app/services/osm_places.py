"""Fetch real visitor places around an Indian city from Wikipedia.

Uses Wikipedia GeoSearch + Text Search APIs.
For text search results that lack coordinates, uses city center as approximate location.
"""

from typing import Any, Dict, List
import asyncio
import httpx
from app.services.geo_utils import haversine_km

WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php"
USER_AGENT = "TripL/1.0 (https://tripl.example.com; tripl@example.com)"

# Hard reject — these are NEVER tourist places
HARD_REJECT_KEYWORDS = (
    "village", "neighbourhood", "neighborhood", "locality", "ward",
    "mandal", "mandals", "constituency", "assembly constituency",
    "lok sabha", "division",
    "railway station", "metro station", "bus station", "bus stop",
    "school", "college", "university", "academy", "medical college",
    "hospital", "dispensary",
    "road", "highway", "junction", "crossing",
    "municipality", "panchayat",
    "airport", "airbase", "naval", "dockyard", "shipyard",
    "port", "harbour", "harbor",
    "power plant", "factory", "mill",
    "township", "colony", "nagar",
    "cantonment",
    "stadium", "cricket ground",
    "reservoir", "canal",
    "gas leak", "incident",
    "technology park", "industrial",
    "assembly", "lok sabha",
    # Wikipedia article type rejects
    "list of", "timeline of", "express",
    "regency", "district",
    "kingdom", "dynasty", "emperor", "king",
    "river", "flyover",
    # Biological / generic
    "flabellifer", "cattle in religion",
    "department of",
)

# Soft accept — descriptions containing these are likely tourist-relevant
SOFT_ACCEPT_KEYWORDS = (
    "historic site", "heritage", "tourist", "attraction",
    "landmark", "monument", "memorial", "sacred",
    "religious", "place of worship", "temple",
    "archaeological", "ancient", "fort", "palace",
    "museum", "cave", "sanctuary", "beach",
    "garden", "park", "dam", "barrage",
    "shrine", "church", "mosque",
)

CATEGORY_TOURIST = (
    "tourist attractions", "heritage", "monuments", "temples",
    "museums", "forts", "beaches", "parks", "gardens",
    "archaeological", "landmarks", "sacred", "religious",
    "protected monuments", "unesco", "world heritage",
)

CATEGORY_REJECT = (
    "settlements in", "villages in", "localities in",
    "neighborhoods in", "neighbourhoods in",
    "mandals of", "constituencies in",
    "railway stations in", "educational institutions",
)


def _is_genuine_tourist_place(item: Dict[str, Any]) -> bool:
    """Strict filter: only keep actual tourist/visitor places."""
    name = str(item.get("title", "")).strip()
    if not name or len(name) < 3:
        return False

    description = str(item.get("description", "")).casefold()
    categories_text = " ".join(
        str(c.get("title", "")) for c in item.get("categories", [])
    ).casefold()
    combined = f"{name.casefold()} {description} {categories_text}"

    # Hard reject
    for term in HARD_REJECT_KEYWORDS:
        if term in combined:
            return False
    for cat_reject in CATEGORY_REJECT:
        if cat_reject in categories_text:
            return False

    # Strong accept via categories
    for cat_match in CATEGORY_TOURIST:
        if cat_match in categories_text:
            return True

    # Soft accept via description keywords
    for term in SOFT_ACCEPT_KEYWORDS:
        if term in description or term in name.casefold():
            return True

    return False


def _category_from_name(name: str, description: str = "", categories: str = "") -> str:
    text = f"{name} {description} {categories}".casefold()
    if any(w in text for w in ("temple", "church", "mosque", "masjid", "gurudwara", "shrine", "mandir")):
        return "Temple"
    if any(w in text for w in ("museum", "gallery", "fort", "palace", "heritage", "monument", "archaeological", "tower")):
        return "Museum"
    if any(w in text for w in ("beach", "shore", "coast")):
        return "Beach"
    if any(w in text for w in ("park", "garden", "zoo", "sanctuary", "wildlife", "national park", "bird")):
        return "Park"
    if any(w in text for w in ("waterfall", "lake", "dam", "hill", "viewpoint", "cave", "falls", "barrage")):
        return "Viewpoint"
    if any(w in text for w in ("tower", "historic", "landmark", "site", "stupa")):
        return "Heritage"
    return "Heritage"


def _category_duration(cat: str) -> int:
    return {"Beach": 120, "Temple": 60, "Park": 90, "Museum": 90, "Viewpoint": 60, "Heritage": 60}.get(cat, 60)


async def _fetch_geosearch(city: str, latitude: float, longitude: float, radius_km: float, client: httpx.AsyncClient) -> List[Dict[str, Any]]:
    """Fetch places from Wikipedia GeoSearch."""
    all_results: List[Dict[str, Any]] = []
    radii_to_try = [10000]
    if radius_km > 10:
        radii_to_try = [10000, min(30000, int(radius_km * 1000))]

    for gsrad in radii_to_try:
        try:
            response = await client.get(
                WIKIPEDIA_API_URL,
                params={
                    "action": "query", "list": "geosearch", "format": "json",
                    "gscoord": f"{latitude}|{longitude}",
                    "gsradius": gsrad, "gslimit": 50,
                },
            )
            response.raise_for_status()
            results = response.json().get("query", {}).get("geosearch", [])
            all_results.extend(results)
        except Exception:
            continue

    return all_results


async def _fetch_textsearch(city: str, client: httpx.AsyncClient) -> List[Dict[str, Any]]:
    """Fetch places from Wikipedia text search — queries about tourist places in/around city."""
    queries = [
        f"tourist attractions in {city}",
        f"famous temples in {city}",
        f"historical monuments in {city}",
        f"museums in {city}",
        f"beaches near {city}",
        f"famous places near {city}",
        f"sacred places in {city}",
        f"parks and gardens in {city}",
        f"forts near {city}",
        f"heritage sites in {city}",
    ]
    results: List[Dict[str, Any]] = []
    seen_ids: set = set()

    for query in queries:
        try:
            resp = await client.get(
                WIKIPEDIA_API_URL,
                params={
                    "action": "query", "list": "search", "format": "json",
                    "srsearch": query, "srlimit": 15,
                },
            )
            resp.raise_for_status()
            search_results = resp.json().get("query", {}).get("search", [])
            for sr in search_results:
                pid = sr.get("pageid")
                if pid and pid not in seen_ids:
                    seen_ids.add(pid)
                    # Text search gives snippet, not description
                    sr["description"] = sr.get("snippet", "").replace('<span class="searchmatch">', '').replace('</span>', '')
                    results.append(sr)
        except Exception:
            continue
        await asyncio.sleep(0.3)

    return results


async def _enrich_with_details(items: List[Dict[str, Any]], client: httpx.AsyncClient) -> List[Dict[str, Any]]:
    """Fetch categories, descriptions, and coordinates for a batch of Wikipedia results."""
    page_ids = "|".join(str(item["pageid"]) for item in items if item.get("pageid"))
    if not page_ids:
        return items
    try:
        details_resp = await client.get(
            WIKIPEDIA_API_URL,
            params={
                "action": "query", "format": "json", "pageids": page_ids,
                "prop": "categories|description|coordinates", "cllimit": 20, "clshow": "!hidden",
            },
        )
        details_resp.raise_for_status()
        details = details_resp.json().get("query", {}).get("pages", {})
        enriched = []
        for item in items:
            pid = str(item.get("pageid", ""))
            detail = details.get(pid, {})
            merged = {**item, **detail}
            # Add coordinates from the coordinates property
            coords = detail.get("coordinates", [])
            if coords and isinstance(coords, list) and coords[0].get("lat"):
                merged["lat"] = coords[0]["lat"]
                merged["lon"] = coords[0]["lon"]
            enriched.append(merged)
        return enriched
    except Exception:
        return items


async def _build_places(
    items: List[Dict[str, Any]],
    city: str,
    latitude: float,
    longitude: float,
    radius_km: float,
    use_city_coords: bool = False,
) -> List[Dict[str, Any]]:
    """Convert raw Wikipedia results into our place format.

    If use_city_coords=True, items without their own coordinates get the city center
    as approximate location (useful for text search results).
    """
    places: List[Dict[str, Any]] = []
    seen: set = set()
    skip_names = {city.casefold(), f"{city} district".casefold(), f"{city} mandal".casefold()}

    for item in items:
        name = item.get("title", "")
        if not name or name.casefold() in skip_names:
            continue
        if not _is_genuine_tourist_place(item):
            continue

        lat = float(item.get("lat", 0))
        lon = float(item.get("lon", 0))

        if (lat == 0 or lon == 0):
            if use_city_coords:
                # Use city center as approximate location with small random offset
                import hashlib
                h = int(hashlib.md5(name.encode()).hexdigest()[:8], 16)
                lat = latitude + ((h % 100) - 50) * 0.001  # ±0.05 degree offset
                lon = longitude + (((h >> 8) % 100) - 50) * 0.001
            else:
                continue

        dist = haversine_km(latitude, longitude, lat, lon)
        if dist > radius_km:
            continue

        key = (name.casefold(), round(lat, 4), round(lon, 4))
        if key in seen:
            continue
        seen.add(key)

        description = str(item.get("description", ""))
        categories_text = " ".join(str(c.get("title", "")) for c in item.get("categories", []))
        cat = _category_from_name(name, description, categories_text)

        places.append({
            "name": name,
            "latitude": lat,
            "longitude": lon,
            "category_name": cat,
            "rating": 4.0,
            "avg_visit_duration": _category_duration(cat),
            "entry_fee": 0.0,
            "opening_time": None,
            "closing_time": None,
            "description": description or f"A tourist place near {city}.",
            "address": city,
            "city": city,
            "distance_km": round(dist, 2),
        })

    return places


async def fetch_real_places(city: str, latitude: float, longitude: float, radius_km: float) -> List[Dict[str, Any]]:
    """Return named tourist places near a city using Wikipedia APIs.

    Strategy:
    1. Wikipedia GeoSearch (works for big cities with geotagged articles)
    2. Wikipedia Text Search with coordinate enrichment (works for all cities)
    3. Text Search fallback with city-center approximation (for articles without coordinates)
    """
    async with httpx.AsyncClient(timeout=8.0, headers={"User-Agent": USER_AGENT}) as client:
        all_places: List[Dict[str, Any]] = []
        seen_names: set = set()

        # 1. Try GeoSearch (best quality — real coordinates)
        geo_items = await _fetch_geosearch(city, latitude, longitude, radius_km, client)
        if geo_items:
            geo_items = await _enrich_with_details(geo_items, client)
            geo_places = await _build_places(geo_items, city, latitude, longitude, radius_km)
            for p in geo_places:
                key = p["name"].casefold()
                if key not in seen_names:
                    seen_names.add(key)
                    all_places.append(p)

        # 2. Always try Text Search for more places
        text_items = await _fetch_textsearch(city, client)
        if text_items:
            text_items = await _enrich_with_details(text_items, client)
            # First try with real coordinates
            text_places = await _build_places(text_items, city, latitude, longitude, radius_km)
            for p in text_places:
                key = p["name"].casefold()
                if key not in seen_names:
                    seen_names.add(key)
                    all_places.append(p)

            # Then fill gaps with city-center approximation for places lacking coords
            text_places_approx = await _build_places(
                text_items, city, latitude, longitude, radius_km,
                use_city_coords=True,
            )
            for p in text_places_approx:
                key = p["name"].casefold()
                if key not in seen_names:
                    seen_names.add(key)
                    all_places.append(p)

    all_places.sort(key=lambda p: p["distance_km"])
    return all_places[:50]
