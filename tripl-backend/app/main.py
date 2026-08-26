from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

from app.routers import auth, places, transport, trail, categories
from app.database import initialize_database

app = FastAPI(
    title="TripL API",
    description="Smart Tourism & AI Trail Platform — Backend",
    version="1.0.0",
)

# CORS — allow the Vite/TanStack dev-server ports used by this project.
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:8080,http://localhost:3000",
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(places.router)
app.include_router(transport.router)
app.include_router(trail.router)
app.include_router(categories.router)


@app.on_event("startup")
def startup():
    initialize_database()


@app.get("/")
def root():
    return {"message": "TripL API is running 🗺️", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
