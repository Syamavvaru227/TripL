from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
from datetime import time
import re


# ── Authentication ────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: str = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = value.strip().casefold()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", normalized):
            raise ValueError("Enter a valid email address.")
        return normalized


class LoginRequest(BaseModel):
    email: str = Field(max_length=255)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = value.strip().casefold()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", normalized):
            raise ValueError("Enter a valid email address.")
        return normalized


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class SendOtpRequest(BaseModel):
    phone: str = Field(min_length=10, max_length=15)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        cleaned = re.sub(r"[^\d+]", "", value.strip())
        if len(cleaned) < 10:
            raise ValueError("Enter a valid phone number.")
        return cleaned


class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str = Field(min_length=6, max_length=6)
    full_name: str = Field(min_length=2, max_length=100)


class PhoneRegisterRequest(BaseModel):
    phone: str
    otp: str = Field(min_length=6, max_length=6)
    full_name: str = Field(min_length=2, max_length=100)
    email: str = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = value.strip().casefold()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", normalized):
            raise ValueError("Enter a valid email address.")
        return normalized


class PhoneLoginRequest(BaseModel):
    phone: str
    password: str = Field(min_length=1, max_length=128)


class CheckPhoneRequest(BaseModel):
    phone: str
    otp: str = Field(min_length=6, max_length=6)


class ForgotPasswordRequest(BaseModel):
    phone: str
    otp: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=8, max_length=128)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
    welcome_email_sent: bool = False


# ── Category ──────────────────────────────────────────────────────────────────
class CategoryOut(BaseModel):
    id: int
    name: str
    icon: str
    color: str

    class Config:
        from_attributes = True


# ── Transport Mode ─────────────────────────────────────────────────────────────
class TransportModeOut(BaseModel):
    id: int
    mode: str
    display_name: str
    cost_per_km: float
    avg_speed_kmph: int
    icon: str
    color: str

    class Config:
        from_attributes = True


# ── Place ──────────────────────────────────────────────────────────────────────
class PlaceBase(BaseModel):
    id: int
    name: str
    category_id: Optional[int] = None
    latitude: float
    longitude: float
    rating: float
    avg_visit_duration: int
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    entry_fee: float
    description: Optional[str] = None
    image_url: Optional[str] = None
    address: Optional[str] = None
    city: str

    class Config:
        from_attributes = True


class PlaceWithDistance(PlaceBase):
    distance_km: float
    category: Optional[CategoryOut] = None


# ── Transport Options ──────────────────────────────────────────────────────────
class TransportOption(BaseModel):
    mode: str
    display_name: str
    icon: str
    color: str
    distance_km: float
    duration_minutes: int
    cost_inr: float


class TransportOptionsResponse(BaseModel):
    from_place: str
    to_place: str
    options: List[TransportOption]


# ── Trail Generator ────────────────────────────────────────────────────────────
class TrailRequest(BaseModel):
    city: str
    available_hours: float
    budget_inr: float
    interests: List[str]
    place_types: List[str] = []
    transport_mode: str
    start_time: str = "09:00"


class TrailStop(BaseModel):
    order: int
    place: PlaceBase
    category: Optional[CategoryOut] = None
    arrival_time: str
    departure_time: str
    stay_minutes: int
    travel_from_prev_minutes: int
    travel_cost_inr: float
    entry_fee: float
    cumulative_cost: float
    cumulative_minutes: int
    transport_mode: str
    transport_icon: str
    distance_from_prev_km: float


class TrailResponse(BaseModel):
    city: str
    total_places: int
    total_duration_minutes: int
    total_cost_inr: float
    start_time: str
    end_time: str
    transport_mode: str
    stops: List[TrailStop]


# ── Save Trail ─────────────────────────────────────────────────────────────────
class SaveTrailRequest(BaseModel):
    session_id: str
    city: str
    preferences: dict
    trail: Any
