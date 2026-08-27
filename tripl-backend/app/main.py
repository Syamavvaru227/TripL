from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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


@app.get("/api/health")
def health():
    return {"status": "ok"}


# ─── Serve React frontend in production ───────────────────────────────
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "static")

if os.path.isdir(STATIC_DIR):
    # Serve built React assets (JS, CSS, images, etc.)
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve React SPA — any non-API route returns index.html."""
        # If the file exists on disk, serve it (favicons, manifest, etc.)
        file_path = os.path.join(STATIC_DIR, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        # Otherwise serve index.html for client-side routing
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
