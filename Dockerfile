# ── Stage 1: Build React frontend ──────────────────────────────────────
FROM node:22-alpine AS frontend
WORKDIR /app/frontend

COPY tripl-frontend/package.json tripl-frontend/package-lock.json* ./
RUN npm ci

COPY tripl-frontend/ ./
# vite.config.js points outDir at ../tripl-backend/static (convenient for local
# dev, where FastAPI serves the SPA). Inside this stage that path is outside the
# project root, so override it to a local dist/ that stage 2 can copy.
RUN npm run build -- --outDir dist

# ── Stage 2: Python backend + built frontend ──────────────────────────
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Install Python dependencies
COPY tripl-backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY tripl-backend/ ./

# Copy built frontend into static/ (app/main.py serves it from here)
COPY --from=frontend /app/frontend/dist ./static

EXPOSE 8000

# Render injects PORT (default 10000) and requires the service to bind it;
# locally PORT is unset so this falls back to 8000.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
