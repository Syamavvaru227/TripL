"""Fetch real visitor places around an Indian city from Wikipedia.

Uses Wikipedia GeoSearch + Text Search APIs (parallelized for speed).
In-memory cache avoids re-fetching for repeat searches.
"""

from typing import Any, Dict, List
import asyncio
import time
import httpx
from app.services.geo_utils import haversine_km

WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php"
USER_AGENT = "TripL/1.0 (https://tripl.example.com; tripl@example.com)"

# ── In-memory cache (TTL 10 minutes) ──────────────────────────────
_CACHE: Dict[str, tuple] = {}
_CACHE_TTL = 600


def _cache_key(city: str, lat: float, lon: float, radius_km: float) -> str:
    return f"{city.casefold().strip()}|{round(lat, 4)}|{round(lon, 4)}|{radius_km}"


def _cache_get(key: str):
    entry = _CACHE.get(key)
    if entry and (time.time() - entry[0]) < _CACHE_TTL:
        return entry[1]
    return None


def _cache_set(key: str, data):
    _CACHE[key] = (time.time(), data)
    if len(_CACHE) > 200:
        now = time.time()
        expired = [k for k, v in _CACHE.items() if (now - v[0]) > _CACHE_TTL]
        for k in expired:
            del _CACHE[k]


# ── Strict Filters ─────────────────────────────────────────────────
# Reject these keywords anywhere in name OR description
HARD_REJECT_KEYWORDS = (
    # Geographic/administrative (NOT tourist)
    "village", "town in", "city in", "neighbourhood", "neighborhood", "locality", "ward",
    "mandal", "mandals", "constituency", "assembly constituency",
    "lok sabha", "division", "hamlet", "census town",
    "railway station", "metro station", "bus station", "bus stop",
    "school", "college", "university", "academy", "medical college",
    "hospital", "dispensary", "nursing",
    "road", "highway", "junction", "crossing", "flyover",
    "municipality", "panchayat", "township", "colony", "nagar",
    "cantonment", "industrial area", "technology park",
    "airport", "airbase", "naval", "dockyard", "shipyard",
    "port", "harbour", "harbor",
    "power plant", "factory", "mill", "industrial",
    "stadium", "cricket ground",
    "reservoir", "canal", "barrage",
    "gas leak", "incident", "accident",
    "assembly", "parliament",
    # Wikipedia article types (NOT places)
    "list of", "timeline of", "express", "regency", "district",
    "kingdom", "dynasty", "emperor", "king", "queen",
    "river", "suburban", "subdivision",
    "flabellifer", "cattle in religion", "department of",
    # People / biographies (NOT places)
    "biography", "born in", "died in", "was an indian",
    "she joined", "he joined", "arrived in", "was a ",
    "missionary", "saint", "guru",
    # Books / publications
    "publishers", "archived from", "retrieved from",
    "doi:", "isbn", "oclc",
    # Generic / non-place
    "suburban", "urban", "rural",
    # Food, flora, fauna (NOT tourist places)
    "chilli", "chili", "pepper", "spice", "cultivar",
    "breed", "species", "genus", "plant",
    "cuisine", "recipe", "dish", "food product",
)

# Reject these ONLY in article categories (not in title/description)
CATEGORY_REJECT = (
    "settlements in", "villages in", "localities in",
    "neighborhoods in", "neighbourhoods in",
    "mandals of", "constituencies in",
    "railway stations in", "educational institutions",
    "biographies", "indian people", "people from",
    "articles", "stub", "coord", "wikidata",
    "chili peppers", "capsicum", "spices", "cuisine",
    "food items", "cultivars", "flora", "fauna",
    "stubs", "orphan", "disambiguation",
)

# Strong accept — these category matches mean it's genuinely a tourist place
CATEGORY_TOURIST = (
    "tourist attractions", "monuments", "museums", "forts",
    "beaches", "archaeological", "unesco", "world heritage",
    "protected monuments", "national parks", "wildlife sanctuaries",
)

# Accept if the NAME itself matches these (strong signal)
NAME_ACCEPT = (
    "fort", "temple", "church", "mosque", "museum", "palace",
    "beach", "park", "garden", "cave", "sanctuary", "zoo",
    "shrine", "gurudwara", "stupa", "tower", "dam",
    "waterfall", "lake", "hill", "viewpoint",
    "heritage", "monument", "memorial",
    "barrage", "reservoir",
)

# Accept via description keywords (weaker signal)
DESC_ACCEPT = (
    "historic site", "heritage site", "tourist attraction",
    "landmark", "monument", "memorial", "sacred place",
    "religious site", "place of worship", "temple",
    "archaeological", "ancient", "historic fort", "palace",
    "museum", "cave", "sanctuary", "beach",
    "garden", "national park", "wildlife",
    "shrine", "church", "mosque",
    "tourist spot", "popular destination",
)


def _is_genuine_tourist_place(item: Dict[str, Any]) -> bool:
    """Very strict filter: only keep actual tourist/visitor places."""
    name = str(item.get("title", "")).strip()
    if not name or len(name) < 4:
        return False

    description = str(item.get("description", "")).casefold()
    categories_text = " ".join(
        str(c.get("title", "")) for c in item.get("categories", [])
    ).casefold()
    combined = f"{name.casefold()} {description} {categories_text}"

    # 1. Hard reject — name or description matches banned keywords
    for term in HARD_REJECT_KEYWORDS:
        if term in combined:
            return False

    # 1b. Reject if description says it's a town/city/village (Wikipedia uses this pattern)
    desc_lower = description
    if any(phrase in desc_lower for phrase in ("town in", "city in", "village in", "village near", "town near", "city near")):
        return False

    # 2. Category reject
    for cat_reject in CATEGORY_REJECT:
        if cat_reject in categories_text:
            return False

    # 3. Name is too short or looks like a person name (has titlecase + surname)
    name_words = name.split()
    if len(name_words) == 2 and all(w[0].isupper() for w in name_words if w):
        # Could be a person name — only accept if it has a known place keyword
        has_place_keyword = any(kw in name.casefold() for kw in NAME_ACCEPT)
        if not has_place_keyword and not any(kw in categories_text for kw in CATEGORY_TOURIST):
            return False

    # 4. Strong accept via Wikipedia categories
    for cat_match in CATEGORY_TOURIST:
        if cat_match in categories_text:
            return True

    # 5. Accept via name containing known place keywords
    name_lower = name.casefold()
    for keyword in NAME_ACCEPT:
        if keyword in name_lower:
            return True

    # 6. Accept via description keywords
    for term in DESC_ACCEPT:
        if term in description:
            return True

    # 7. If name is just a place name with no tourist keyword — reject.
    #    Names like 'Markapuram', 'Vinukonda', 'Obulavaripalle' are towns,
    #    not tourist destinations, unless they matched earlier checks.
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


# ── Parallel API helpers ───────────────────────────────────────────

async def _fetch_geosearch(city: str, latitude: float, longitude: float, radius_km: float, client: httpx.AsyncClient) -> List[Dict[str, Any]]:
    all_results: List[Dict[str, Any]] = []
    radii_to_try = [10000]
    if radius_km > 10:
        radii_to_try = [10000, min(30000, int(radius_km * 1000))]

    async def _one_query(gsrad):
        try:
            resp = await client.get(WIKIPEDIA_API_URL, params={
                "action": "query", "list": "geosearch", "format": "json",
                "gscoord": f"{latitude}|{longitude}", "gsradius": gsrad, "gslimit": 50,
            })
            resp.raise_for_status()
            return resp.json().get("query", {}).get("geosearch", [])
        except Exception:
            return []

    results = await asyncio.gather(*[_one_query(r) for r in radii_to_try])
    for r in results:
        all_results.extend(r)
    return all_results


async def _fetch_textsearch(city: str, client: httpx.AsyncClient) -> List[Dict[str, Any]]:
    """Fetch places from Wikipedia text search — ALL queries run in parallel."""
    queries = [
        f"tourist attractions in {city}",
        f"famous temples in {city}",
        f"historical monuments in {city}",
        f"museums in {city}",
        f"beaches near {city}",
        f"famous places in {city}",
        f"sacred places in {city}",
        f"parks and gardens in {city}",
        f"forts near {city}",
        f"heritage sites in {city}",
    ]

    async def _one_search(query):
        try:
            resp = await client.get(WIKIPEDIA_API_URL, params={
                "action": "query", "list": "search", "format": "json",
                "srsearch": query, "srlimit": 15,
            })
            resp.raise_for_status()
            return resp.json().get("query", {}).get("search", [])
        except Exception:
            return []

    all_results = await asyncio.gather(*[_one_search(q) for q in queries])

    results: List[Dict[str, Any]] = []
    seen_ids: set = set()
    for search_results in all_results:
        for sr in search_results:
            pid = sr.get("pageid")
            if pid and pid not in seen_ids:
                seen_ids.add(pid)
                sr["description"] = sr.get("snippet", "").replace('<span class="searchmatch">', '').replace('</span>', '')
                results.append(sr)
    return results


async def _enrich_with_details(items: List[Dict[str, Any]], client: httpx.AsyncClient) -> List[Dict[str, Any]]:
    """Fetch categories, descriptions, and coordinates for Wikipedia results.
    
    Wikipedia API silently returns 0 pages when >50 pageids are sent at once.
    We batch in chunks of 40 to be safe.
    """
    pids_with_items = [(str(item["pageid"]), item) for item in items if item.get("pageid")]
    if not pids_with_items:
        return items
    
    all_details: Dict[str, Any] = {}
    
    # Batch in chunks of 40 pageids
    BATCH_SIZE = 40
    for i in range(0, len(pids_with_items), BATCH_SIZE):
        batch = pids_with_items[i:i + BATCH_SIZE]
        page_ids_str = "|".join(pid for pid, _ in batch)
        try:
            details_resp = await client.get(WIKIPEDIA_API_URL, params={
                "action": "query", "format": "json", "pageids": page_ids_str,
                "prop": "categories|description|coordinates", "cllimit": 20, "clshow": "!hidden",
            })
            details_resp.raise_for_status()
            batch_details = details_resp.json().get("query", {}).get("pages", {})
            all_details.update(batch_details)
        except Exception:
            continue
    
    enriched = []
    for item in items:
        pid = str(item.get("pageid", ""))
        detail = all_details.get(pid, {})
        merged = {**item, **detail}
        coords = detail.get("coordinates", [])
        if coords and isinstance(coords, list) and coords[0].get("lat"):
            merged["lat"] = coords[0]["lat"]
            merged["lon"] = coords[0]["lon"]
        enriched.append(merged)
    return enriched


def _build_places(
    items: List[Dict[str, Any]],
    city: str,
    latitude: float,
    longitude: float,
    radius_km: float,
) -> List[Dict[str, Any]]:
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

        if lat == 0 or lon == 0:
            continue  # Only keep places with real coordinates

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

    Uses in-memory cache for repeat searches.
    Runs GeoSearch + TextSearch in PARALLEL for speed (~2-4s instead of ~12s).
    """
    key = _cache_key(city, latitude, longitude, radius_km)
    cached = _cache_get(key)
    if cached is not None:
        return cached

    async with httpx.AsyncClient(timeout=10.0, headers={"User-Agent": USER_AGENT}) as client:
        all_places: List[Dict[str, Any]] = []
        seen_names: set = set()

        # Run GeoSearch and TextSearch IN PARALLEL
        geo_items_coro = _fetch_geosearch(city, latitude, longitude, radius_km, client)
        text_items_coro = _fetch_textsearch(city, client)
        geo_items, text_items = await asyncio.gather(geo_items_coro, text_items_coro)

        # Enrich both sets IN PARALLEL
        if geo_items and text_items:
            geo_items, text_items = await asyncio.gather(
                _enrich_with_details(geo_items, client),
                _enrich_with_details(text_items, client),
            )
        elif geo_items:
            geo_items = await _enrich_with_details(geo_items, client)
        elif text_items:
            text_items = await _enrich_with_details(text_items, client)

        # Process GeoSearch results
        if geo_items:
            geo_places = _build_places(geo_items, city, latitude, longitude, radius_km)
            for p in geo_places:
                k = p["name"].casefold()
                if k not in seen_names:
                    seen_names.add(k)
                    all_places.append(p)

        # Process TextSearch results
        # Many TextSearch results lack coordinates. Since our strict filter
        # already ensures they're genuine tourist places, we assign approximate
        # city-centered coordinates so they still appear on the map.
        if text_items:
            # First pass: places with real coordinates
            text_places = _build_places(text_items, city, latitude, longitude, radius_km)
            for p in text_places:
                k = p["name"].casefold()
                if k not in seen_names:
                    seen_names.add(k)
                    all_places.append(p)

            # Second pass: filtered items without coords → assign approximate positions
            # The strict _is_genuine_tourist_place filter already ran, so these are all real
            import hashlib as _hl
            for item in text_items:
                name = item.get("title", "")
                if not name or name.casefold() in seen_names:
                    continue
                if not _is_genuine_tourist_place(item):
                    continue
                lat = float(item.get("lat", 0))
                lon = float(item.get("lon", 0))
                if lat != 0 and lon != 0:
                    continue  # already handled above
                # Assign approximate position within 30km of city center
                h = int(_hl.md5(name.encode()).hexdigest()[:8], 16)
                lat = latitude + ((h % 100) - 50) * 0.0015
                lon = longitude + (((h >> 8) % 100) - 50) * 0.0015
                dist = haversine_km(latitude, longitude, lat, lon)
                if dist > radius_km:
                    continue
                seen_names.add(name.casefold())
                description = str(item.get("description", ""))
                categories_text = " ".join(str(c.get("title", "")) for c in item.get("categories", []))
                cat = _category_from_name(name, description, categories_text)
                all_places.append({
                    "name": name, "latitude": lat, "longitude": lon,
                    "category_name": cat, "rating": 4.0,
                    "avg_visit_duration": _category_duration(cat),
                    "entry_fee": 0.0, "opening_time": None, "closing_time": None,
                    "description": description or f"A tourist place near {city}.",
                    "address": city, "city": city, "distance_km": round(dist, 2),
                })

    all_places.sort(key=lambda p: p["distance_km"])
    result = all_places[:50]
    _cache_set(key, result)
    return result
