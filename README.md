# 🌱 Agrivo — AI & IoT Agriculture Platform

![License](https://img.shields.io/badge/license-MIT-green)
![Stack](https://img.shields.io/badge/stack-FastAPI%20%7C%20React%20%7C%20Supabase-blue)
![Docker](https://img.shields.io/badge/docker-ready-2496ED?logo=docker&logoColor=white)

**Agrivo** is a smart agriculture platform that empowers Indonesian farmers with AI-driven crop recommendations, IoT-simulated precision monitoring, and a marketplace to connect directly with consumers — all in one app.

---

## 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [Quick Start — Docker (Recommended)](#-quick-start--docker-recommended)
- [Quick Start — Local Development](#-quick-start--local-development)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Contributing](#-contributing)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Assistant** | Personalized crop & fertilizer recommendations powered by Groq LLMs |
| 🌡️ **Digital Twin IoT** | Simulated real-time sensor data (temperature, humidity, soil pH, NPK) |
| 🌤️ **Live Weather** | Geolocation-based weather integration with drought/flood alerts |
| 🛒 **Marketplace** | Consumers post food needs; farmers submit offers with price negotiation |
| 💬 **WhatsApp Integration** | Auto-generated negotiation links between buyers and farmers |
| ⭐ **Review System** | Post-transaction ratings visible on farmer profiles |
| 🔒 **Auth & Role Guard** | JWT-based auth with `petani` and `konsumen` roles; route protection |

---

## 🛠 Tech Stack

### Frontend
- **React 19** + **Vite 8**
- **Tailwind CSS v4** (utility classes + custom theme tokens)
- **Poppins / Outfit** fonts via `@fontsource`
- **Lucide React** icons
- **React Router v7** with `GuestRoute` / `PrivateRoute` guards

### Backend
- **FastAPI** (Python 3.11)
- **Uvicorn** ASGI server
- **Pydantic v2** + **pydantic-settings** for config
- **Supabase** (PostgreSQL + Auth + Storage + Realtime)
- **Groq API** for AI inference (LLM recommendations & reasoning)
- **httpx** for async weather API calls

### Infrastructure
- **Docker** + **Docker Compose**
- **Nginx** (Alpine) for serving the production React build
- **Supabase** hosted cloud database (no self-hosted DB required)

---

## 📁 Project Structure

```
TaniTech/
├── backend/                    # FastAPI application
│   ├── routers/
│   │   ├── auth.py             # Registration & login endpoints
│   │   ├── ai.py               # AI recommendation & IoT simulation
│   │   ├── marketplace.py      # Posts, offers, transactions, reviews
│   │   ├── weather.py          # Weather data & cron alerts
│   │   └── content.py          # Static content (FAQs, articles, categories)
│   ├── config.py               # Pydantic settings (reads .env)
│   ├── deps.py                 # Auth/JWT dependencies
│   ├── main.py                 # App factory, middleware, router registration
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── .dockerignore
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/         # Navbar, Hero, Footer, etc.
│   │   ├── pages/              # LandingPage, Login, Register, Dashboard
│   │   └── utils/api.js        # All fetch helpers (uses VITE_API_BASE_URL)
│   ├── public/img/             # Static images & logo
│   ├── nginx.conf              # SPA-aware Nginx config
│   ├── Dockerfile              # Multi-stage: Node build → Nginx serve
│   └── .dockerignore
│
├── docker-compose.yml          # Orchestrates backend + frontend
└── README.md
```

---

## ✅ Prerequisites

| Tool | Minimum Version |
|---|---|
| Docker | 24+ |
| Docker Compose | v2 (bundled with Docker Desktop) |
| Node.js *(local dev only)* | 20+ |
| Python *(local dev only)* | 3.11+ |

---

## 🔑 Environment Variables

Copy the example file and fill in your credentials:

```bash
cp backend/.env.example backend/.env
```

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | ✅ | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | ✅ | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (bypasses RLS for admin ops) |
| `GROQ_API_KEY` | ⚠️ optional | Groq API key — app falls back to mocked AI responses if empty |
| `GROQ_DEFAULT_MODEL` | ⚠️ optional | Default chat model (default: `openai/gpt-oss-20b`) |
| `GROQ_REASONING_MODEL` | ⚠️ optional | Reasoning model for IoT sim (default: `qwen/qwen3.6-27b`) |
| `INTERNAL_CRON_SECRET` | ⚠️ optional | Secret for manual cron endpoint auth |

For **Docker** deployments, also set:

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Public URL of the backend, baked into the frontend build |

---

## 🐳 Quick Start — Docker (Recommended)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/agrivo.git
cd agrivo
```

### 2. Set up environment variables

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and fill in SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

### 3. Build and start all services

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend (React) | http://localhost |
| Backend (FastAPI) | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

### 4. Stop services

```bash
docker compose down
```

### 🌐 Deploying to a remote server

If your backend is hosted at a public URL (e.g. `https://api.yourapp.com`), pass it as a build arg:

```bash
VITE_API_BASE_URL=https://api.yourapp.com docker compose up --build
```

Or set it in a root-level `.env` file:

```dotenv
# .env  (at project root, next to docker-compose.yml)
VITE_API_BASE_URL=https://api.yourapp.com
```

---

## 💻 Quick Start — Local Development

### Backend

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # then fill in credentials

uvicorn main:app --reload
# → http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

> **Note:** The frontend reads `VITE_API_BASE_URL` from `frontend/.env.local`. Create that file if you need to override the default `http://localhost:8000`.

---

## 📖 API Documentation

Interactive Swagger UI is auto-generated by FastAPI and available at:

```
http://localhost:8000/docs
```

ReDoc alternative:

```
http://localhost:8000/redoc
```

### Key Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/posts` | List all marketplace food posts |
| `POST` | `/api/posts` | Create a new food post (konsumen only) |
| `POST` | `/api/posts/{id}/offers` | Submit a price offer (petani only) |
| `PATCH` | `/api/offers/{id}/accept` | Accept a farmer's offer |
| `GET` | `/api/transactions/mine` | List transactions for current user |
| `PATCH` | `/api/transactions/{id}/status` | Update transaction status |
| `POST` | `/api/reviews` | Submit a review for a completed transaction |
| `GET` | `/api/reviews/user/{user_id}` | Get all reviews received by a user |
| `POST` | `/api/ai/recommend` | Get AI crop recommendation |
| `POST` | `/api/ai/simulate/{id}` | Run IoT digital twin simulation |
| `GET` | `/api/weather/current` | Get live weather for lat/lng |

---

## 🗄 Database Schema

Agrivo uses **Supabase (PostgreSQL)** with Row Level Security. The full migration SQL is at [`backend/database/migrations.sql`](backend/database/migrations.sql).

**Core Tables:**

```
profiles          — Extended user data (role: petani | konsumen)
food_posts        — Consumer demand posts
categories        — Food/crop categories
offers            — Farmer offers on a food post
transactions      — Created when an offer is accepted
reviews           — Post-transaction ratings & comments
ai_recommendations— History of AI model outputs per user
articles          — Static how-to content
faqs              — Static FAQ content
```

**Notable Triggers:**
- `update_profile_rating` — auto-updates `profiles.average_rating` whenever a review is inserted or deleted.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feat/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT © 2026 Agrivo Team
