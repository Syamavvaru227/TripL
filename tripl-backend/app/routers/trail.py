from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from types import SimpleNamespace

from app.database import get_db
from app.models import Place, Category, TransportMode, UserTrail
from app.schemas import TrailRequest, TrailResponse, TrailStop, PlaceBase, CategoryOut, SaveTrailRequest
from app.services.trail_engine import generate_trail
from app.services.geocoder import geocode_city
from app.services.geo_utils import haversine_km
from app.services.osm_places import fetch_real_places

router = APIRouter(prefix="/api/trail", tags=["trail"])


@router.post("/generate", response_model=TrailResponse)
async def generate_trail_endpoint(req: TrailRequest, db: Session = Depends(get_db)):
    """Generate a Smart Trail based on user preferences."""

    # 1. Geocode city
    coords = await geocode_city(req.city)
    if not coords:
        sample = db.query(Place).filter(Place.city.ilike(f"%{req.city}%")).first()
        if sample:
            coords = (float(sample.latitude), float(sample.longitude))
        else:
            raise HTTPException(status_code=404, detail=f"City '{req.city}' not found.")

    origin_lat, origin_lon = coords

    # 2. Build category lookup, then load the real places for this city.
    cats = db.query(Category).all()
    cat_map = {c.id: {"id": c.id, "name": c.name, "icon": c.icon, "color": c.color} for c in cats}
    category_ids = {c.name: c.id for c in cats}
    live_places = []
    try:
        import asyncio
        live_places = await asyncio.wait_for(fetch_real_places(req.city, origin_lat, origin_lon, 30), timeout=8.0)
    except Exception:
        pass
    if live_places:
        all_places = [
            SimpleNamespace(
                id=-(index + 1),
                name=place["name"],
                category_id=category_ids.get(place["category_name"]),
                latitude=place["latitude"], longitude=place["longitude"],
                rating=place["rating"], avg_visit_duration=place["avg_visit_duration"],
                # Opening-hours tags can be complex. Unverified entries are treated
                # as open so the planner does not reject valid places incorrectly.
                opening_time=None, closing_time=None,
                entry_fee=place["entry_fee"], description=place["description"],
                image_url=None, address=place["address"], city=req.city,
                distance_km=place["distance_km"],
            )
            for index, place in enumerate(live_places)
        ]
    else:
        # Offline fallback remains limited to the matching city; it never returns
        # attractions from another city simply because they are in the seed data.
        all_places = db.query(Place).filter(
            Place.city.ilike(f"%{req.city}%"), Place.is_active == True
        ).all()
        for p in all_places:
            p.distance_km = haversine_km(origin_lat, origin_lon, float(p.latitude), float(p.longitude))

    if not all_places:
        raise HTTPException(status_code=404, detail=f"No attractions were found for '{req.city}'.")

    # 3. Get transport modes
    transport_modes_db = db.query(TransportMode).filter(TransportMode.is_active == True).all()

    # 4. Run trail generator
    result = generate_trail(
        places=all_places,
        categories=cat_map,
        transport_modes_db=transport_modes_db,
        city=req.city,
        available_hours=req.available_hours,
        budget_inr=req.budget_inr,
        interests=req.interests,
        transport_mode=req.transport_mode,
        start_time=req.start_time,
        origin_lat=origin_lat,
        origin_lon=origin_lon,
    )

    if not result["stops"]:
        raise HTTPException(status_code=400, detail="Could not generate trail. Try adjusting budget or time.")

    # 5. Build response
    stops_out = []
    for s in result["stops"]:
        p = s["place"]
        cat = s["category"]
        stops_out.append(TrailStop(
            order=s["order"],
            place=PlaceBase(
                id=p.id, name=p.name, category_id=p.category_id,
                latitude=float(p.latitude), longitude=float(p.longitude),
                rating=float(p.rating), avg_visit_duration=p.avg_visit_duration,
                opening_time=str(p.opening_time) if p.opening_time else None,
                closing_time=str(p.closing_time) if p.closing_time else None,
                entry_fee=float(p.entry_fee), description=p.description,
                image_url=p.image_url, address=p.address, city=p.city,
            ),
            category=CategoryOut(**cat) if cat else None,
            arrival_time=s["arrival_time"],
            departure_time=s["departure_time"],
            stay_minutes=s["stay_minutes"],
            travel_from_prev_minutes=s["travel_from_prev_minutes"],
            travel_cost_inr=s["travel_cost_inr"],
            entry_fee=s["entry_fee"],
            cumulative_cost=s["cumulative_cost"],
            cumulative_minutes=s["cumulative_minutes"],
            transport_mode=s["transport_mode"],
            transport_icon=s["transport_icon"],
            distance_from_prev_km=s["distance_from_prev_km"],
        ))

    return TrailResponse(
        city=req.city,
        total_places=len(stops_out),
        total_duration_minutes=result["total_duration_minutes"],
        total_cost_inr=result["total_cost_inr"],
        start_time=result["start_time"],
        end_time=result["end_time"],
        transport_mode=req.transport_mode,
        stops=stops_out,
    )


@router.post("/save")
async def save_trail(req: SaveTrailRequest, db: Session = Depends(get_db)):
    """Save a generated trail to the database."""
    trail = UserTrail(
        session_id=req.session_id or str(uuid.uuid4()),
        origin_city=req.city,
        preferences=req.preferences,
        trail_data=req.trail,
        total_cost=req.trail.get("total_cost_inr", 0) if isinstance(req.trail, dict) else 0,
        total_duration=req.trail.get("total_duration_minutes", 0) if isinstance(req.trail, dict) else 0,
        place_count=req.trail.get("total_places", 0) if isinstance(req.trail, dict) else 0,
    )
    db.add(trail)
    db.commit()
    return {"message": "Trail saved", "trail_id": trail.id}
