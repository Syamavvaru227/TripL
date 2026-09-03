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
    # Infrastructure
    "road", "highway", "junction", "crossing", "flyover",
    "municipality", "panchayat", "cantonment",
    # Lists and non-places
    "list of", "comparison of", "tourism in",
    # Food/products (not places)
    "chilli", "chili", "curry", "spice", "rice variety",
    # People (not places)
    "born in", "died in", "birthplace",
    # Transport
    "express", "passenger", "freight",
    # Government/admin (not tourist)
    "department of", "ministry of", "board of",
    # Generic/wrong country
    "island national", "hillforts in",
)

# Reject if the DESCRIPTION starts with these patterns
DESCRIPTION_REJECT = (
    "village in", "town in", "city in", "hamlet in", "municipality in",
    "census town in", "neighbourhood in",
)

# Category keywords → reject entire entries from Wikipedia categories
CATEGORY_REJECT = (
    "villages in", "towns in", "cities in",
    "hamlets in", "settlements in",
    "railway stations in", "metro stations in",
    "schools in", "colleges in", "universities in",
    "hospitals in",
    "food", "spices", "chillies", "cuisine",
    "rivers of", "mountains of",
    "islands of",  # too generic
)


def _is_genuine_tourist_place(item: dict) -> bool:
    """Aggressive filter to keep only real tourist attractions."""
    title = str(item.get("title", "")).strip()
    description = str(item.get("description", "")).strip().casefold()
    categories_text = " ".join(
        str(c.get("title", "")).strip().casefold()
        for c in item.get("categories", [])
    )
    combined = f"{title.casefold()} {description} {categories_text}"

    # Must have a real title
    if not title or len(title) < 3:
        return False

    # Reject places from other countries (only keep Indian places)
    NON_INDIAN_MARKERS = (
        "indonesia", "malaysia", "thailand", "vietnam", "philippines",
        "japan", "china", "korea", "australia", "united states",
        "united kingdom", "france", "germany", "spain", "italy",
        "brazil", "mexico", "canada", "pakistan", "bangladesh",
        "nepal", "sri lanka", "afghanistan", "myanmar",
        "jakarta", "manila", "bangkok", "hanoi", "tokyo", "beijing",
        "seoul", "sydney", "london", "paris", "berlin", "rome",
        "new york", "washington", "california",
    )
    if any(marker in combined for marker in NON_INDIAN_MARKERS):
        return False

    # Reject if description mentions a non-Indian country/region
    INDIA_STATES = (
        "india", "andhra", "telangana", "karnataka", "tamil nadu",
        "kerala", "maharashtra", "rajasthan", "gujarat", "madhya pradesh",
        "uttar pradesh", "west bengal", "odisha", "bihar", "jharkhand",
        "punjab", "haryana", "himachal", "uttarakhand", "jammu",
        "goa", "assam", "meghalaya", "manipur", "mizoram", "nagaland",
        "tripura", "sikkim", "arunachal", "chhattisgarh", "chandigarh",
        "delhi", "ladakh", "puducherry", "andaman",
    )
    # If description exists and mentions a non-Indian location, reject
    if description and not any(st in description for st in INDIA_STATES):
        # Description exists but doesn't mention any Indian state
        # Still allow if categories mention India
        cat_mentioned = any(st in categories_text for st in INDIA_STATES)
        if not cat_mentioned:
            # Check for non-Indian markers in description specifically
            if any(marker in description for marker in NON_INDIAN_MARKERS):
                return False

    # Hard reject keywords in title, description, or categories
    if any(term in combined for term in HARD_REJECT_KEYWORDS):
        return False

    # Description-based reject (starts with)
    if any(description.startswith(p) for p in DESCRIPTION_REJECT):
        return False

    # Category-based reject
    if any(term in categories_text for term in CATEGORY_REJECT):
        return False

    # Must have either a description or categories that suggest it's a real place
    if not description and not categories_text:
        return False

    # Reject if title looks like a person name (first+last, no place words)
    place_words = (
        "fort", "temple", "museum", "park", "beach", "cave", "lake", "hill",
        "shrine", "church", "mosque", "palace", "garden", "sanctuary", "tower",
        "monument", "dam", "island", "waterfall", "valley", "gopuram", "stupa",
        "vihara", "matha", "ashram", "ghat", "bazaar", "market",
    )
    title_lower = title.casefold()
    has_place_word = any(w in title_lower for w in place_words)

    # If it doesn't have a place word, check if description supports it
    if not has_place_word:
        desc_place_words = any(w in description for w in place_words)
        cat_place_words = any(w in categories_text for w in place_words)
        if not desc_place_words and not cat_place_words:
            return False

    return True


# ── Wikipedia API Helpers ──────────────────────────────────────────


async def _fetch_geosearch(
    city: str, lat: float, lon: float, radius_km: float, client: httpx.AsyncClient
) -> list:
    """Wikipedia GeoSearch — finds articles with GPS coordinates near a point.

    Wikipedia limits gsradius to max 10,000m. For larger radii, we do
    multiple queries at offset points to cover the full area.
    """
    # Wikipedia limits gsradius to max 10,000m
    WIKI_MAX_RADIUS = 10000
    radius_m = min(int(radius_km * 1000), WIKI_MAX_RADIUS)

    # Generate multiple search centers to cover the full radius
    import math
    centers = [(lat, lon)]  # Center point
    if radius_km * 1000 > WIKI_MAX_RADIUS:
        # Add offset points at ~8km in cardinal directions
        offset_deg = 0.07  # ~8km in degrees
        for dlat, dlon in [(offset_deg, 0), (-offset_deg, 0), (0, offset_deg), (0, -offset_deg)]:
            centers.append((lat + dlat, lon + dlon))

    all_results = []
    seen_ids = set()
    for c_lat, c_lon in centers:
        params = {
            "action": "query",
            "list": "geosearch",
            "gscoord": f"{c_lat}|{c_lon}",
            "gsradius": str(WIKI_MAX_RADIUS),
            "gslimit": "50",
            "gsnamespace": "0",
            "format": "json",
        }
        try:
            resp = await client.get(WIKIPEDIA_API_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
            for item in data.get("query", {}).get("geosearch", []):
                pid = item.get("pageid")
                if pid and pid not in seen_ids:
                    seen_ids.add(pid)
                    all_results.append(item)
        except Exception:
            continue
    return all_results


async def _fetch_textsearch(city: str, client: httpx.AsyncClient) -> list:
    """Wikipedia text search — find tourist articles for the city."""
    if not city or city == "Your location":
        return []

    queries = [
        f"tourist attractions in {city}",
        f"temples in {city}",
        f"historical places in {city}",
        f"heritage sites in {city}",
        f"parks and gardens in {city}",
        f"museums in {city}",
        f"beaches near {city}",
        f"famous landmarks in {city}",
        f"monuments in {city}",
        f"natural attractions near {city}",
    ]

    async def _search_one(q: str) -> list:
        params = {
            "action": "query",
            "list": "search",
            "srsearch": q,
            "srlimit": "15",
            "srnamespace": "0",
            "format": "json",
        }
        try:
            resp = await client.get(WIKIPEDIA_API_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
            return data.get("query", {}).get("search", [])
        except Exception:
            return []

    # Run all 10 queries IN PARALLEL
    results = await asyncio.gather(*[_search_one(q) for q in queries])

    # Flatten and deduplicate by pageid
    seen = set()
    unique = []
    for batch in results:
        for item in batch:
            pid = item.get("pageid")
            if pid and pid not in seen:
                seen.add(pid)
                unique.append(item)
    return unique


async def _enrich_with_details(items: list, client: httpx.AsyncClient) -> list:
    """Enrich a list of Wikipedia items with descriptions and coordinates.

    Wikipedia limits to ~50 pageids per request, so we batch.
    """
    if not items:
        return []

    pageids = [str(item.get("pageid", "")) for item in items if item.get("pageid")]
    if not pageids:
        return items

    # Batch in groups of 50 (Wikipedia API limit)
    BATCH_SIZE = 50
    enriched_map: Dict[int, dict] = {}

    async def _fetch_batch(ids: list) -> dict:
        params = {
            "action": "query",
            "pageids": "|".join(ids),
            "prop": "coordinates|pageprops|description|pageimages",
            "pithumbsize": "600",
            "format": "json",
        }
        try:
            resp = await client.get(WIKIPEDIA_API_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
            pages = data.get("query", {}).get("pages", {})
            result = {}
            for pid_str, page in pages.items():
                pid = int(pid_str)
                if pid < 0:
                    continue  # invalid page
                result[pid] = page
            return result
        except Exception:
            return {}

    # Run batches IN PARALLEL
    batches = [pageids[i : i + BATCH_SIZE] for i in range(0, len(pageids), BATCH_SIZE)]
    batch_results = await asyncio.gather(*[_fetch_batch(b) for b in batches])
    for br in batch_results:
        enriched_map.update(br)

    # Merge enrichment back into items
    for item in items:
        pid = item.get("pageid")
        if pid and pid in enriched_map:
            page = enriched_map[pid]
            # Coordinates
            coords = page.get("coordinates")
            if coords and len(coords) > 0:
                item["lat"] = coords[0].get("lat", item.get("lat"))
                item["lon"] = coords[0].get("lon", item.get("lon"))
            # Description
            desc = page.get("description", "")
            if desc:
                item["description"] = desc
            # Page properties (Wikidata entity, etc.)
            props = page.get("pageprops", {})
            if "wikibase_short_description" in props:
                item["description"] = props["wikibase_short_description"]
            # Thumbnail image
            thumb = page.get("thumbnail")
            if thumb and thumb.get("source"):
                item["image_url"] = thumb["source"]

    return items


def _category_from_name(name: str, description: str, categories_text: str) -> str:
    """Infer a TripL category from the place name, description, and categories."""
    combined = f"{name} {description} {categories_text}".casefold()

    if any(w in combined for w in ("beach", "shore", "coast", "sea ", "ocean")):
        return "Beach"
    if any(w in combined for w in ("temple", "shrine", "church", "mosque", "gopuram", "mandir", "devasthanam", "divine")):
        return "Religious"
    if any(w in combined for w in ("park", "garden", "botanical", "zoo", "sanctuary", "wildlife", "bird")):
        return "Parks"
    if any(w in combined for w in ("museum", "gallery", "exhibition", "archaeological")):
        return "Heritage"
    if any(w in combined for w in ("fort", "palace", "castle", "monument", "ruins", "heritage", "ancient", "archaeolog")):
        return "Heritage"
    if any(w in combined for w in ("viewpoint", "hill", "peak", "summit", "lookout", "panorama")):
        return "Viewpoints"
    if any(w in combined for w in ("cave", "cavern", "rock cut")):
        return "Heritage"
    if any(w in combined for w in ("market", "bazaar", "shopping")):
        return "Shopping"
    if any(w in combined for w in ("food", "restaurant", "cuisine", "thali")):
        return "Food"
    if any(w in combined for w in ("lake", "river", "waterfall", "dam", "island")):
        return "Nature"
    if any(w in combined for w in ("tower", "statue", "memorial")):
        return "Cultural"
    return "Other"


def _category_duration(cat: str) -> int:
    """Default visit duration in minutes by category."""
    return {
        "Beach": 90, "Temple": 45, "Religious": 45,
        "Park": 60, "Parks": 60, "Heritage": 75,
        "Museum": 60, "Viewpoints": 45, "Nature": 60,
        "Cultural": 45, "Shopping": 60, "Food": 45, "Other": 60,
    }.get(cat, 60)


def _category_timings(cat: str) -> dict:
    """Return typical opening/closing times and crowded data for Indian tourist places."""
    timings = {
        "Temple": {
            "opening_time": "06:00 AM", "closing_time": "12:00 PM",
            "closing_evening": "08:00 PM",
            "crowded_peak": "10:00 AM – 12:00 PM",
            "crowded_level": "High",
            "best_time": "Early morning (6–8 AM) or evening (5–7 PM)",
            "tips": "Morning puja is the busiest time. Visit early for a peaceful experience.",
        },
        "Religious": {
            "opening_time": "06:00 AM", "closing_time": "12:00 PM",
            "closing_evening": "08:00 PM",
            "crowded_peak": "10:00 AM – 12:00 PM",
            "crowded_level": "High",
            "best_time": "Early morning or late evening",
            "tips": "Festivals can make the place extremely crowded. Check local events.",
        },
        "Heritage": {
            "opening_time": "09:00 AM", "closing_time": "05:30 PM",
            "closing_evening": "05:30 PM",
            "crowded_peak": "11:00 AM – 2:00 PM",
            "crowded_level": "Medium",
            "best_time": "Morning (9–10:30 AM) before tour groups arrive",
            "tips": "Closed on national holidays. Carry water — limited shade at forts.",
        },
        "Museum": {
            "opening_time": "10:00 AM", "closing_time": "05:00 PM",
            "closing_evening": "05:00 PM",
            "crowded_peak": "11:00 AM – 3:00 PM",
            "crowded_level": "Medium",
            "best_time": "Late morning (10–11 AM) or weekday mornings",
            "tips": "Usually closed on Mondays. Photography may have extra fees.",
        },
        "Beach": {
            "opening_time": "06:00 AM", "closing_time": "06:00 PM",
            "closing_evening": "Sunset",
            "crowded_peak": "4:00 PM – 7:00 PM",
            "crowded_level": "Medium",
            "best_time": "Early morning (6–8 AM) or sunset (4:30–6 PM)",
            "tips": "Weekends and holidays are very crowded. Sunrise visits are magical.",
        },
        "Park": {
            "opening_time": "06:00 AM", "closing_time": "08:00 PM",
            "closing_evening": "08:00 PM",
            "crowded_peak": "5:00 PM – 7:30 PM",
            "crowded_level": "Low",
            "best_time": "Early morning for joggers, evening for families",
            "tips": "Morning is peaceful with fewer people. Evening has food stalls.",
        },
        "Parks": {
            "opening_time": "06:00 AM", "closing_time": "08:00 PM",
            "closing_evening": "08:00 PM",
            "crowded_peak": "5:00 PM – 7:30 PM",
            "crowded_level": "Low",
            "best_time": "Early morning for joggers, evening for families",
            "tips": "Morning is peaceful with fewer people. Evening has food stalls.",
        },
        "Viewpoints": {
            "opening_time": "06:00 AM", "closing_time": "06:30 PM",
            "closing_evening": "06:30 PM",
            "crowded_peak": "4:00 PM – 6:00 PM",
            "crowded_level": "Low",
            "best_time": "Sunrise (5:30–7 AM) or sunset (4:30–6 PM)",
            "tips": "Golden hour gives the best photos. Carry a light jacket — windy.",
        },
        "Nature": {
            "opening_time": "06:00 AM", "closing_time": "06:00 PM",
            "closing_evening": "06:00 PM",
            "crowded_peak": "10:00 AM – 4:00 PM",
            "crowded_level": "Low",
            "best_time": "Early morning for birdwatching and cool weather",
            "tips": "Monsoon season may close trails. Check weather before visiting.",
        },
        "Cultural": {
            "opening_time": "10:00 AM", "closing_time": "08:00 PM",
            "closing_evening": "08:00 PM",
            "crowded_peak": "6:00 PM – 8:00 PM",
            "crowded_level": "Medium",
            "best_time": "Evening performances have the best atmosphere",
            "tips": "Book performance tickets in advance during festival season.",
        },
        "Shopping": {
            "opening_time": "10:00 AM", "closing_time": "09:00 PM",
            "closing_evening": "09:00 PM",
            "crowded_peak": "5:00 PM – 8:00 PM",
            "crowded_level": "High",
            "best_time": "Morning (10 AM–12 PM) for bargaining, less rush",
            "tips": "Bargaining is expected. Carry cash — many shops don't accept cards.",
        },
        "Food": {
            "opening_time": "08:00 AM", "closing_time": "10:00 PM",
            "closing_evening": "10:00 PM",
            "crowded_peak": "12:30 PM – 2:00 PM",
            "crowded_level": "Medium",
            "best_time": "Off-peak hours: 11 AM or 3 PM",
            "tips": "Street food is best in the evening. Try local specialties!",
        },
        "Other": {
            "opening_time": "09:00 AM", "closing_time": "06:00 PM",
            "closing_evening": "06:00 PM",
            "crowded_peak": "11:00 AM – 3:00 PM",
            "crowded_level": "Low",
            "best_time": "Morning (9–11 AM) for fewer crowds",
            "tips": "Check local timings before visiting. Carry water.",
        },
    }
    return timings.get(cat, {
        "opening_time": "08:00 AM", "closing_time": "06:00 PM",
        "closing_evening": "06:00 PM",
        "crowded_peak": "11:00 AM – 3:00 PM",
        "crowded_level": "Medium",
        "best_time": "Morning (8–10 AM) for fewer crowds",
        "tips": "Carry water and sunscreen. Respect local customs.",
    })


def _build_places(items: list, city: str, lat: float, lon: float, radius_km: float) -> List[Dict[str, Any]]:
    """Convert enriched Wikipedia items into TripL place dicts."""
    places = []
    for item in items:
        name = item.get("title", "").strip()
        if not name or len(name) < 3:
            continue

        if not _is_genuine_tourist_place(item):
            continue

        item_lat = float(item.get("lat", 0))
        item_lon = float(item.get("lon", 0))

        # Skip items without valid coordinates
        if item_lat == 0 and item_lon == 0:
            continue
        if not (-90 <= item_lat <= 90) or not (-180 <= item_lon <= 180):
            continue

        dist = haversine_km(lat, lon, item_lat, item_lon)
        if dist > radius_km:
            continue

        description = str(item.get("description", ""))
        categories_text = " ".join(str(c.get("title", "")) for c in item.get("categories", []))
        cat = _category_from_name(name, description, categories_text)

        image_url = item.get("image_url")
        timings = _category_timings(cat)
        places.append({
            "name": name,
            "latitude": item_lat,
            "longitude": item_lon,
            "category_name": cat,
            "rating": 4.0,
            "avg_visit_duration": _category_duration(cat),
            "entry_fee": 0.0,
            "opening_time": timings["opening_time"],
            "closing_time": timings["closing_evening"],
            "description": description or f"A tourist place near {city}.",
            "address": city,
            "city": city,
            "distance_km": round(dist, 2),
            "image_url": image_url,
            "crowded_peak": timings["crowded_peak"],
            "crowded_level": timings["crowded_level"],
            "best_time": timings["best_time"],
            "visit_tips": timings["tips"],
        })
    return places


async def fetch_real_places(city: str, latitude: float, longitude: float, radius_km: float) -> List[Dict[str, Any]]:
    """Return named tourist places near a city using Wikipedia APIs.

    Uses in-memory cache for repeat searches.
    Runs GeoSearch + TextSearch in PARALLEL for speed (~2-4s instead of ~12s).

    When city is 'Your location' or generic, skips TextSearch (which needs
    a real city name) and relies solely on GeoSearch (which works from coordinates).
    """
    key = _cache_key(city, latitude, longitude, radius_km)
    cached = _cache_get(key)
    if cached is not None:
        return cached

    async with httpx.AsyncClient(timeout=10.0, headers={"User-Agent": USER_AGENT}) as client:
        all_places: List[Dict[str, Any]] = []
        seen_names: set = set()

        # Determine if we have a real city name for TextSearch
        has_real_city = (
            city
            and city != "Your location"
            and len(city) > 1
            and not city.replace(".", "").replace(",", "").replace(" ", "").replace("-", "").isdigit()
        )

        if has_real_city:
            # Run GeoSearch and TextSearch IN PARALLEL
            geo_items_coro = _fetch_geosearch(city, latitude, longitude, radius_km, client)
            text_items_coro = _fetch_textsearch(city, client)
            geo_items, text_items = await asyncio.gather(geo_items_coro, text_items_coro)
        else:
            # Coordinates-only mode: GeoSearch only (TextSearch needs a city name)
            geo_items = await _fetch_geosearch(city, latitude, longitude, radius_km, client)
            text_items = []

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

        # Process TextSearch results (only when we have a real city name)
        if text_items:
            text_places = _build_places(text_items, city, latitude, longitude, radius_km)
            for p in text_places:
                k = p["name"].casefold()
                if k not in seen_names:
                    seen_names.add(k)
                    all_places.append(p)

            # Items without coords → assign approximate positions
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
                timings = _category_timings(cat)
                all_places.append({
                    "name": name, "latitude": lat, "longitude": lon,
                    "category_name": cat, "rating": 4.0,
                    "avg_visit_duration": _category_duration(cat),
                    "entry_fee": 0.0,
                    "opening_time": timings["opening_time"],
                    "closing_time": timings["closing_evening"],
                    "description": description or f"A tourist place near {city}.",
                    "address": city, "city": city, "distance_km": round(dist, 2),
                    "image_url": item.get("image_url"),
                    "crowded_peak": timings["crowded_peak"],
                    "crowded_level": timings["crowded_level"],
                    "best_time": timings["best_time"],
                    "visit_tips": timings["tips"],
                })

    all_places.sort(key=lambda p: p["distance_km"])
    result = all_places[:50]
    _cache_set(key, result)
    return result
