from sqlalchemy import Column, Integer, String, Float, Text, Time, Boolean, JSON, TIMESTAMP, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    icon = Column(String(100), default="🏛️")
    color = Column(String(20), default="#6366f1")
    created_at = Column(TIMESTAMP, server_default=func.now())

    places = relationship("Place", back_populates="category")


class Place(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    latitude = Column(DECIMAL(10, 7), nullable=False)
    longitude = Column(DECIMAL(10, 7), nullable=False)
    rating = Column(DECIMAL(3, 1), default=4.0)
    avg_visit_duration = Column(Integer, default=60)  # minutes
    opening_time = Column(Time, default="06:00:00")
    closing_time = Column(Time, default="20:00:00")
    entry_fee = Column(DECIMAL(10, 2), default=0.00)
    description = Column(Text)
    image_url = Column(String(512))
    address = Column(String(512))
    city = Column(String(100), nullable=False)
    state = Column(String(100), default="India")
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    category = relationship("Category", back_populates="places")


class TransportMode(Base):
    __tablename__ = "transport_modes"

    id = Column(Integer, primary_key=True, index=True)
    mode = Column(String(50), nullable=False)
    display_name = Column(String(100))
    cost_per_km = Column(DECIMAL(6, 2), nullable=False)
    avg_speed_kmph = Column(Integer, nullable=False)
    icon = Column(String(10), default="🚗")
    color = Column(String(20), default="#3b82f6")
    is_active = Column(Boolean, default=True)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(512), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())


class UserTrail(Base):
    __tablename__ = "user_trails"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), nullable=False)
    origin_city = Column(String(100))
    preferences = Column(JSON)
    trail_data = Column(JSON)
    total_cost = Column(DECIMAL(10, 2))
    total_duration = Column(Integer)  # minutes
    place_count = Column(Integer)
    created_at = Column(TIMESTAMP, server_default=func.now())
