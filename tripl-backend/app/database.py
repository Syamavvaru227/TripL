from sqlalchemy import create_engine, Column, Integer, String, Float, Text, Time, Boolean, JSON, TIMESTAMP, DECIMAL, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tripl.db")

engine_options = {"echo": False, "pool_pre_ping": True}
if DATABASE_URL.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def initialize_database():
    """Create required tables and the lookup data used by the live search API."""
    from app.models import Category, TransportMode

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        category_defaults = [
            Category(name="Beach", icon="🏖️", color="#06b6d4"),
            Category(name="Temple", icon="🛕", color="#f59e0b"),
            Category(name="Park", icon="🌿", color="#22c55e"),
            Category(name="Museum", icon="🏛️", color="#8b5cf6"),
            Category(name="Viewpoint", icon="⛰️", color="#ec4899"),
        ]
        existing_categories = {name for (name,) in db.query(Category.name).all()}
        db.add_all([category for category in category_defaults if category.name not in existing_categories])

        transport_defaults = [
            TransportMode(mode="walk", display_name="Walk", cost_per_km=0, avg_speed_kmph=5, icon="🚶", color="#22c55e"),
            TransportMode(mode="bike", display_name="Bike", cost_per_km=3, avg_speed_kmph=25, icon="🏍️", color="#f59e0b"),
            TransportMode(mode="auto", display_name="Auto Rickshaw", cost_per_km=15, avg_speed_kmph=22, icon="🛺", color="#f97316"),
            TransportMode(mode="car", display_name="Cab", cost_per_km=18, avg_speed_kmph=35, icon="🚗", color="#3b82f6"),
            TransportMode(mode="bus", display_name="Bus", cost_per_km=4, avg_speed_kmph=20, icon="🚌", color="#8b5cf6"),
        ]
        existing_modes = {mode for (mode,) in db.query(TransportMode.mode).all()}
        db.add_all([mode for mode in transport_defaults if mode.mode not in existing_modes])
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
