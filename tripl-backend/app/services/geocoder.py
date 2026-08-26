import httpx
from typing import Any, Optional, Tuple

NOMINATIM_URL = "https://nominatim.openstreetmap.org"
OPEN_METEO_GEOCODER_URL = "https://geocoding-api.open-meteo.com/v1/search"


async def geocode_city(city: str) -> Optional[Tuple[float, float]]:
    """Return Indian city coordinates, with a reliable public fallback."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(
                f"{NOMINATIM_URL}/search",
                # Restricting the lookup at the API level prevents an ambiguous
                # search (for example, "London") from resolving outside India.
                params={"q": city, "format": "json", "limit": 10, "addressdetails": 1, "countrycodes": "in"},
                headers={"User-Agent": "TripL-App/1.0 (tripl@example.com)"},
            )
            resp.raise_for_status()
            data = resp.json()
            if data:
                # Nominatim's first textual match can be a small village with the
                # same name as the requested city. Prefer an actual settlement or
                # administrative city/town before accepting a generic result.
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
            # Nominatim can reject generic app user agents. Continue to a
            # dedicated geocoding endpoint rather than misreporting the city.
            pass
        try:
            resp = await client.get(
                OPEN_METEO_GEOCODER_URL,
                params={"name": city, "count": 1, "language": "en", "format": "json", "countryCode": "IN"},
            )
            resp.raise_for_status()
            results = resp.json().get("results", [])
            if results:
                return float(results[0]["latitude"]), float(results[0]["longitude"])
        except Exception:
            pass
    return None
