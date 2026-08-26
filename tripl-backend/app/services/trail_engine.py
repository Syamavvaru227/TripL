"""
Smart Trail Generator — Core Algorithm
---------------------------------------
Weighted scoring + Constrained Greedy Scheduling

Weights:
  - Interest match    35%
  - Rating            25%
  - Proximity score   20%  (closer = higher score)
  - Cost fit          10%  (cheaper = higher score)
  - Time fit          10%  (shorter visit if time is tight = higher)
"""

import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from app.services.geo_utils import haversine_km


# Transport speeds and costs (fallback table)
TRANSPORT_TABLE = {
    "walk":  {"speed": 5,  "cost_per_km": 0.0,  "icon": "🚶"},
    "bike":  {"speed": 40, "cost_per_km": 2.5,  "icon": "🏍️"},
    "auto":  {"speed": 30, "cost_per_km": 12.0, "icon": "🛺"},
    "car":   {"speed": 50, "cost_per_km": 14.0, "icon": "🚗"},
    "bus":   {"speed": 25, "cost_per_km": 5.0,  "icon": "🚌"},
}

CATEGORY_INTEREST_MAP = {
    "beach":     ["Beach"],
    "temple":    ["Temple"],
    "park":      ["Park"],
    "museum":    ["Museum"],
    "viewpoint": ["Viewpoint"],
    "market":    ["Market"],
    "fort":      ["Fort"],
    "waterfall": ["Waterfall"],
    "lake":      ["Lake"],
    "wildlife":  ["Wildlife"],
    "history":   ["Fort", "Museum", "Temple"],
    "nature":    ["Park", "Waterfall", "Lake", "Wildlife", "Beach"],
    "adventure": ["Waterfall", "Wildlife", "Viewpoint", "Beach"],
    "spiritual": ["Temple"],
    "shopping":  ["Market"],
}


def normalize(value: float, min_val: float, max_val: float) -> float:
    if max_val == min_val:
        return 0.5
    return max(0.0, min(1.0, (value - min_val) / (max_val - min_val)))


def interest_match_score(category_name: str, interests: List[str]) -> float:
    if not interests or not category_name:
        return 0.3
    matched_categories = set()
    for interest in interests:
        interest_lower = interest.lower()
        for key, cats in CATEGORY_INTEREST_MAP.items():
            if key in interest_lower or interest_lower in key:
                matched_categories.update([c.lower() for c in cats])
        matched_categories.add(interest_lower)

    if category_name.lower() in matched_categories:
        return 1.0
    return 0.2


def time_to_minutes(t_str: str) -> int:
    """Convert 'HH:MM' string to minutes since midnight."""
    parts = str(t_str).split(":")
    return int(parts[0]) * 60 + int(parts[1])


def minutes_to_hhmm(minutes_since_midnight: int) -> str:
    h = (minutes_since_midnight // 60) % 24
    m = minutes_since_midnight % 60
    return f"{h:02d}:{m:02d}"


def is_place_open(place: Any, current_minutes: int, stay_minutes: int) -> bool:
    try:
        open_str = str(place.opening_time)
        close_str = str(place.closing_time)
        open_min = time_to_minutes(open_str)
        close_min = time_to_minutes(close_str)
        return open_min <= current_minutes and (current_minutes + stay_minutes) <= close_min
    except Exception:
        return True  # If we can't parse, assume open


def calculate_travel(
    lat1: float, lon1: float,
    lat2: float, lon2: float,
    mode: str,
    transport_modes_db: Optional[List] = None,
) -> Dict[str, float]:
    distance_km = haversine_km(lat1, lon1, lat2, lon2)
    # Road factor (straight-line ≈ 70% of road distance)
    road_km = distance_km * 1.4

    t = TRANSPORT_TABLE.get(mode, TRANSPORT_TABLE["car"])
    # Override from DB transport modes if provided
    if transport_modes_db:
        for tm in transport_modes_db:
            if tm.mode == mode:
                t = {"speed": tm.avg_speed_kmph, "cost_per_km": float(tm.cost_per_km), "icon": tm.icon}
                break

    duration_min = int((road_km / t["speed"]) * 60)
    cost = round(road_km * t["cost_per_km"], 2)
    return {"distance_km": round(distance_km, 2), "duration_min": duration_min, "cost": cost, "icon": t["icon"]}


def generate_trail(
    places: List[Any],
    categories: Dict[int, Any],
    transport_modes_db: List[Any],
    city: str,
    available_hours: float,
    budget_inr: float,
    interests: List[str],
    transport_mode: str,
    start_time: str = "09:00",
    origin_lat: Optional[float] = None,
    origin_lon: Optional[float] = None,
) -> Dict:
    if not places:
        return {"stops": [], "total_cost_inr": 0, "total_duration_minutes": 0}

    available_minutes = int(available_hours * 60)
    start_min = time_to_minutes(start_time)
    end_min = start_min + available_minutes

    # Use first place as origin if no coords given
    if origin_lat is None:
        origin_lat = float(places[0].latitude)
        origin_lon = float(places[0].longitude)

    # ── 1. Score all places ──────────────────────────────────────────────────
    max_dist = max((float(p.distance_km) for p in places if hasattr(p, "distance_km")), default=30)
    max_fee  = max((float(p.entry_fee) for p in places), default=500)

    scored = []
    for p in places:
        dist_km = getattr(p, "distance_km", 15.0)
        cat_name = categories.get(p.category_id, {}).get("name", "") if p.category_id else ""

        s_interest  = interest_match_score(cat_name, interests) * 0.35
        s_rating    = normalize(float(p.rating), 0, 5) * 0.25
        s_proximity = (1 - normalize(float(dist_km), 0, max_dist)) * 0.20
        s_cost      = (1 - normalize(float(p.entry_fee), 0, max_fee)) * 0.10
        s_time      = (1 - normalize(p.avg_visit_duration, 30, 360)) * 0.10

        score = s_interest + s_rating + s_proximity + s_cost + s_time
        scored.append((score, p))

    scored.sort(key=lambda x: x[0], reverse=True)

    # ── 2. Greedy schedule with constraints ──────────────────────────────────
    stops = []
    remaining_budget = budget_inr
    current_time_min = start_min
    current_lat, current_lon = origin_lat, origin_lon
    cumulative_cost = 0.0
    cumulative_min = 0

    for score, place in scored:
        travel = calculate_travel(
            current_lat, current_lon,
            float(place.latitude), float(place.longitude),
            transport_mode, transport_modes_db,
        )
        travel_cost = travel["cost"]
        travel_min  = travel["duration_min"]
        stay_min    = place.avg_visit_duration
        entry_fee   = float(place.entry_fee)
        total_cost_stop = travel_cost + entry_fee

        arrival_min   = current_time_min + travel_min
        departure_min = arrival_min + stay_min

        # Constraints check
        if arrival_min >= end_min:
            continue
        if (cumulative_min + travel_min + stay_min) > available_minutes:
            continue
        if remaining_budget < total_cost_stop:
            continue
        if not is_place_open(place, arrival_min, stay_min):
            continue

        cumulative_cost += total_cost_stop
        cumulative_min  += travel_min + stay_min
        remaining_budget -= total_cost_stop
        current_time_min = departure_min
        current_lat      = float(place.latitude)
        current_lon      = float(place.longitude)

        cat = categories.get(place.category_id, {}) if place.category_id else {}
        stops.append({
            "order": len(stops) + 1,
            "place": place,
            "category": cat,
            "arrival_time":   minutes_to_hhmm(arrival_min),
            "departure_time": minutes_to_hhmm(departure_min),
            "stay_minutes":   stay_min,
            "travel_from_prev_minutes": travel_min,
            "travel_cost_inr": travel_cost,
            "entry_fee":       entry_fee,
            "cumulative_cost": round(cumulative_cost, 2),
            "cumulative_minutes": cumulative_min,
            "transport_mode": transport_mode,
            "transport_icon": travel["icon"],
            "distance_from_prev_km": travel["distance_km"],
        })

        if len(stops) >= 8:  # cap trail at 8 stops
            break

    return {
        "stops": stops,
        "total_cost_inr": round(cumulative_cost, 2),
        "total_duration_minutes": cumulative_min,
        "start_time": start_time,
        "end_time": minutes_to_hhmm(start_min + cumulative_min),
    }
