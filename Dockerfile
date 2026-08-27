# ── Stage 1: Build React frontend ──────────────────────────────────────
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY tripl-frontend/package.json tripl-frontend/package-lock.json* ./
RUN npm install
COPY tripl-frontend/ ./
RUN npm run build

# ── Stage 2: Python backend + built frontend ──────────────────────────
FROM python:3.11-slim
WORKDIR /app

# Install Python dependencies
COPY tripl-backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY tripl-backend/ ./

# Copy built frontend into static/ folder
COPY --from=frontend /app/frontend/dist ./static

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
