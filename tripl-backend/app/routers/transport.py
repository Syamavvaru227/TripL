from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import TransportMode
from app.schemas import TransportOption, TransportOptionsResponse
from app.services.geo_utils import haversine_km

router = APIRouter(prefix="/api/transport", tags=["transport"])


@router.get("/options", response_model=TransportOptionsResponse)
def get_transport_options(
    from_lat: float = Query(...),
    from_lng: float = Query(...),
    to_lat: float = Query(...),
    to_lng: float = Query(...),
    from_name: str = Query("Origin"),
    to_name: str = Query("Destination"),
    db: Session = Depends(get_db),
):
    """Return cost, time, and distance for all transport modes between two coordinates."""
    distance_km = haversine_km(from_lat, from_lng, to_lat, to_lng)
    road_km = distance_km * 1.4  # road factor

    modes = db.query(TransportMode).filter(TransportMode.is_active == True).all()
    options = []
    for m in modes:
        duration_min = int((road_km / m.avg_speed_kmph) * 60)
        cost = round(road_km * float(m.cost_per_km), 2)
        options.append(TransportOption(
            mode=m.mode,
            display_name=m.display_name,
            icon=m.icon,
            color=m.color,
            distance_km=round(distance_km, 2),
            duration_minutes=duration_min,
            cost_inr=cost,
        ))

    options.sort(key=lambda x: x.cost_inr)
    return TransportOptionsResponse(from_place=from_name, to_place=to_name, options=options)


@router.get("/modes", response_model=List[dict])
def get_modes(db: Session = Depends(get_db)):
    modes = db.query(TransportMode).filter(TransportMode.is_active == True).all()
    return [{"mode": m.mode, "display_name": m.display_name, "icon": m.icon, "color": m.color,
             "cost_per_km": float(m.cost_per_km), "avg_speed_kmph": m.avg_speed_kmph} for m in modes]
