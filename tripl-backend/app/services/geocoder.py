import httpx
from typing import Any, Optional, Tuple

NOMINATIM_URL = "https://nominatim.openstreetmap.org"
OPEN_METEO_GEOCODER_URL = "https://geocoding-api.open-meteo.com/v1/search"

# Use a browser-like User-Agent to avoid Nominatim 403 blocks
_BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"


async def geocode_city(city: str) -> Optional[Tuple[float, float]]:
    """Return Indian city coordinates, with a reliable public fallback."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(
                f"{NOMINATIM_URL}/search",
                params={"q": city, "format": "json", "limit": 10, "addressdetails": 1, "countrycodes": "in"},
                headers={"User-Agent": _BROWSER_UA},
            )
            resp.raise_for_status()
            data = resp.json()
            if data:
                def result_rank(item: dict[str, Any]) -> tuple[int, int]:
                    kind = str(item.get("type", "")).casefold()
                    category = str(item.get("category", "")).casefold()
                    address = item.get("address") or {}
                    if kind in {"city", "town"}:
                        priority = 0
                    elif kind == "village":
                        priority = 2
                    elif category == "boundary" and address.get("city"):
                        priority = 1
                    else:
                        priority = 3
                    return priority, -int(float(item.get("importance") or 0) * 1_000_000)

                best = min(data, key=result_rank)
                return float(best["lat"]), float(best["lon"])
        except Exception:
            pass
        try:
            resp = await client.get(
                OPEN_METEO_GEOCODER_URL,
                params={"name": city, "count": 1, "language": "en", "format": "json", "countryCode": "IN"},
            )
            resp.raise_for_status()
            data = resp.json()
            if data.get("results"):
                r = data["results"][0]
                return float(r["latitude"]), float(r["longitude"])
        except Exception:
            pass
    return None


async def reverse_geocode(lat: float, lng: float) -> Optional[str]:
    """Given coordinates, return the nearest Indian city/town name."""
    async with httpx.AsyncClient(timeout=8.0) as client:
        # Try Nominatim reverse
        try:
            resp = await client.get(
                f"{NOMINATIM_URL}/reverse",
                params={"lat": lat, "lon": lng, "format": "json", "addressdetails": 1},
                headers={"User-Agent": _BROWSER_UA},
            )
            resp.raise_for_status()
            data = resp.json()
            addr = data.get("address", {})
            # Prefer city/town, then county/district, then village, then parse display_name
            for key in ("city", "town", "county", "state_district", "suburb", "village"):
                if addr.get(key):
                    return addr[key]
            # Last resort: extract from display_name (e.g. "...Guntur, Andhra Pradesh...")
            display = data.get("display_name", "")
            if display:
                # Find the most relevant part before the state
                parts = display.split(", ")
                state = addr.get("state", "")
                for part in parts:
                    part = part.strip()
                    if part and part != state and len(part) > 2 and not part[0].isdigit():
                        return part
        except Exception:
            pass

        # Fallback: search for nearby settlements
        try:
            resp = await client.get(
                f"{NOMINATIM_URL}/search",
                params={
                    "q": f"{lat},{lng}",
                    "format": "json",
                    "limit": 5,
                    "countrycodes": "in",
                    "addressdetails": 1,
                    "viewbox": f"{lng-0.3},{lat+0.3},{lng+0.3},{lat-0.3}",
                    "bounded": "1",
                },
                headers={"User-Agent": _BROWSER_UA},
            )
            resp.raise_for_status()
            data = resp.json()
            if data:
                addr = data[0].get("address", {})
                for key in ("city", "town", "village"):
                    if addr.get(key):
                        return addr[key]
                return data[0].get("display_name", "").split(",")[0]
        except Exception:
            pass
    return None
