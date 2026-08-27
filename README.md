# 🇮🇳 TripL — Smart Indian Tourism & AI Travel Planning

**One Location In. A Complete Indian Journey Out.**

An AI-powered Indian travel companion that discovers real tourist places within 30 km of any location, compares travel options, and generates smart personalized itineraries.

![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![React](https://img.shields.io/badge/react-18-61dafb)
![FastAPI](https://img.shields.io/badge/fastapi-0.115-009688)

---

## 🌟 Features

- **Real-Time Tourist Discovery** — Find tourist places for ANY Indian city using Wikipedia APIs
- **Interactive Map** — Leaflet-powered map with category markers and clustering
- **Smart AI Itinerary** — Personalized journey planning based on budget, time, interests, and transport
- **Travel Comparison** — Compare car, bike, bus, auto, and walking options with cost estimates
- **Cultural Discovery** — "Know India" feature with historical and cultural context for each place
- **Responsible Tourism** — Eco-friendly badges and community-supported tourism highlights
- **Mobile-First Design** — Fully responsive with bottom navigation and touch-friendly controls
- **Indian-Inspired UI** — Premium contemporary design blending modern aesthetics with Indian heritage

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Syamavvaru227/TripL.git
cd TripL
```

### 2. Backend Setup

```bash
cd tripl-backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**
API docs at: **http://localhost:8000/docs**

### 3. Frontend Setup

```bash
cd tripl-frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

### 4. Quick Start (Windows)

Double-click `start-servers.bat` to start both servers automatically.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              Frontend (React + Vite)         │
│  Tailwind CSS · Leaflet · Framer Motion      │
│  Zustand · React Router v6 · Axios          │
└──────────────────┬──────────────────────────┘
                   │ /api proxy
┌──────────────────▼──────────────────────────┐
│              Backend (FastAPI)               │
│  SQLAlchemy · JWT Auth · httpx (async)       │
└──────┬──────────┬───────────────┬───────────┘
       │          │               │
  Wikipedia   Nominatim     OpenStreetMap
   GeoSearch   Geocoder       Tiles
   TextSearch
```

### How It Works

1. User searches any Indian city (e.g., "Guntur")
2. Backend geocodes the city via Nominatim
3. Wikipedia GeoSearch + TextSearch find tourist articles near those coordinates
4. Smart filtering removes villages, railways, schools, food items
5. Places are enriched with descriptions, categories, and coordinates
6. AI planner generates personalized itineraries using weighted scoring

### AI Itinerary Algorithm

```
Weighted scoring for each candidate place:
  Interest match:  35%  (matches user's selected interests)
  Rating:          25%  (higher rated places preferred)
  Proximity:       20%  (closer places scored higher)
  Cost fit:        10%  (fits within budget)
  Time fit:        10%  (fits within available time)
```

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Leaflet, Framer Motion |
| **State** | Zustand |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy, Pydantic |
| **Database** | SQLite (local) / MySQL (production) |
| **Auth** | JWT tokens, PBKDF2-SHA256 password hashing |
| **Maps** | OpenStreetMap + Leaflet |
| **Data** | Wikipedia GeoSearch/TextSearch API (free) |
| **Geocoding** | Nominatim API (free) |

---

## 📦 Deployment

### Option 1: Render (Recommended — Free)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Select `Syamavvaru227/TripL`
4. Set **Runtime** to Docker, **Dockerfile** to `./Dockerfile`
5. Click Deploy

Your app will be live at `https://tripl.onrender.com`

### Option 2: Railway

1. Go to [railway.app](https://railway.app) → New Project
2. Deploy from GitHub repo
3. Add MySQL plugin
4. Set environment variables:
   - `DATABASE_URL` = your MySQL connection string
   - `JWT_SECRET_KEY` = random secret string

### Option 3: Docker

```bash
docker build -t tripl .
docker run -p 8000:8000 tripl
```

---

## 📁 Project Structure

```
TripL/
├── Dockerfile                    # Multi-stage Docker build
├── render.yaml                   # Render deployment config
├── start-servers.bat             # Windows quick-start script
├── tripl-backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + static file serving
│   │   ├── database.py          # SQLAlchemy setup (SQLite/MySQL)
│   │   ├── models.py            # Database models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── routers/
│   │   │   ├── auth.py          # Login/Register/JWT
│   │   │   ├── places.py        # Tourist place discovery
│   │   │   ├── transport.py     # Travel mode comparison
│   │   │   ├── trail.py         # AI itinerary generation
│   │   │   └── categories.py    # Place categories
│   │   └── services/
│   │       ├── osm_places.py    # Wikipedia + Nominatim API
│   │       └── nominatim_places.py
│   ├── requirements.txt
│   └── static/                  # Built React frontend (auto-generated)
├── tripl-frontend/
│   ├── src/
│   │   ├── pages/               # Landing, Explore, Planner, Itinerary, etc.
│   │   ├── components/          # Map, Cards, Filters, Navigation
│   │   ├── api/                 # Axios client with JWT interceptors
│   │   ├── store/               # Zustand state management
│   │   └── App.jsx              # Routes and layout
│   ├── package.json
│   └── vite.config.js           # Builds to tripl-backend/static/
└── .gitignore
```

---

## 🔑 Environment Variables

### Backend (`.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `sqlite:///./tripl.db` |
| `JWT_SECRET_KEY` | Secret for JWT tokens | (auto-generated) |
| `APP_ENV` | `development` or `production` | `development` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173` |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user profile |
| GET | `/api/places/nearby?city=X&radius=30` | Find tourist places |
| GET | `/api/places/{id}` | Get place details |
| POST | `/api/places/{id}/bookmark` | Bookmark a place |
| GET | `/api/categories` | Get all categories |
| POST | `/api/transport/compare` | Compare travel options |
| POST | `/api/trail/generate` | Generate AI itinerary |
| GET | `/api/health` | Health check |

---

## 👥 Team

Built for Smart India Hackathon (SIH)

| Role | Responsibility |
|------|---------------|
| **Backend Lead** | FastAPI, Wikipedia APIs, AI itinerary algorithm, auth system |
| **Frontend Lead** | React pages, Leaflet maps, animations, responsive design |
| **Demo Lead** | Presentation flow, judge Q&A, live demo |
| **Documentation** | README, architecture docs, deployment setup |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Wikipedia API](https://www.mediawiki.org/wiki/API:Main_page) — Free tourist place data
- [Nominatim](https://nominatim.openstreetmap.org/) — Free geocoding
- [OpenStreetMap](https://www.openstreetmap.org/) — Free map tiles
- [Leaflet](https://leafletjs.com/) — Interactive maps
- [FastAPI](https://fastapi.tiangolo.com/) — Modern Python API framework

---

**"Explore India. Understand India. Experience India."** 🇮🇳
