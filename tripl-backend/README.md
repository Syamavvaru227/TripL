# TripL — Smart Tourism & AI Trail Platform

> Discover tourist attractions within 30 km, compare transport costs, and generate an optimized travel trail — all in one click.

## Project Structure

```
tripl-frontend/   ← React 18 + Vite + Zustand + Leaflet
tripl-backend/    ← Python FastAPI + MySQL + SQLAlchemy
```

---

## Quick Start

### 1. Setup MySQL Database

```sql
-- In MySQL Workbench or CLI:
SOURCE tripl-backend/schema.sql;
```

### 2. Backend Setup

```bash
cd tripl-backend

# Optional: copy env file and configure MySQL credentials.
# Without DATABASE_URL, the backend starts with a seeded local SQLite database.
copy .env.example .env
# Edit .env → set DATABASE_URL with your MySQL password

# Create virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --port 8000
```

📡 API docs: http://localhost:8000/docs

Set `JWT_SECRET_KEY` in `.env` to a long random value before deploying. The
backend creates an ephemeral key for local development, so local login tokens
are invalidated whenever the server restarts.

To send the registration confirmation email, configure the `SMTP_*` values in
`.env`. A successful registration returns `welcome_email_sent: true` when the
message was handed to your SMTP provider; authentication still succeeds if the
mail provider is temporarily unavailable.

### 3. Frontend Setup

```bash
cd tripl-frontend
npm install
npm run dev
```

🌐 App: http://localhost:5173

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/places/nearby?city=Visakhapatnam&radius=30` | Places within radius |
| GET | `/api/places/{id}` | Single place details |
| GET | `/api/transport/options?from_lat=&from_lng=&to_lat=&to_lng=` | Transport cost matrix |
| POST | `/api/trail/generate` | Generate Smart Trail |
| GET | `/api/categories` | All categories |
| POST | `/api/auth/register` | Create an account and receive a bearer token |
| POST | `/api/auth/login` | Sign in and receive a bearer token |
| GET | `/api/auth/me` | Retrieve the authenticated user (`Authorization: Bearer <token>`) |
| POST | `/api/trail/save` | Save trail to DB |

---

## Trail Generate Payload

```json
{
  "city": "Visakhapatnam",
  "available_hours": 6,
  "budget_inr": 800,
  "interests": ["beach", "park"],
  "transport_mode": "bike",
  "start_time": "09:00"
}
```

---

## Smart Trail Algorithm

**Weighted Scoring** (per place):
- 35% — Interest match
- 25% — Rating
- 20% — Proximity (closer = higher)
- 10% — Cost fit (cheaper = higher)
- 10% — Time fit

**Greedy Scheduling** — sorts scored places, then greedily picks next best that fits within budget, time, and opening hours.

---

## Seeded Cities

| City | Places |
|------|--------|
| Visakhapatnam | 15 places |
| Hyderabad | 15 places |
| Goa | 15 places |
| Jaipur | 15 places |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Zustand, React Router, Leaflet |
| Backend | Python FastAPI, SQLAlchemy, Pydantic |
| Database | MySQL |
| Maps | OpenStreetMap (Leaflet) |
| Geocoding | Nominatim (free) |
| Transport | Fixed rate table (₹/km) |

---

## Example Use Case

> User enters "Visakhapatnam", sets 6h / ₹800 / beaches / bike / 9:00 AM  
> → Returns: RK Beach (9:15–10:45), Rushikonda Beach (11:05–12:35), Yarada Beach (13:10–14:40)  
> → With departure times, travel costs between each, and running total
