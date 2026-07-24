# 🚀 JobForge AI

> **AI-Powered Job Application Management Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688)](https://fastapi.tiangolo.com/)
[![Go](https://img.shields.io/badge/Go-1.26-00ADD8)](https://go.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://www.python.org/)

## 🌐 Live

- **App**: [jobforge-ai.vercel.app](https://jobforge-ai.vercel.app/)
- **Python API**: [jobforge-ai-backend.onrender.com](https://jobforge-ai-backend.onrender.com/health)
- **Go scraper API**: [jobforge-go-scraper.onrender.com](https://jobforge-go-scraper.onrender.com/health)

All three are genuinely deployed and talking to each other — the Jobs page is served by the Go
service, everything else by the Python API, both against the same Postgres database. Free-tier
Render services spin down when idle, so the first request after a while can take 30–60s.

## 📋 Overview

JobForge AI helps job seekers optimize their application process using AI:

- 📄 **Resume ATS Scoring** — a real LLM call (via OpenRouter) scores a resume against a job
  description and returns strengths/weaknesses/missing keywords as structured, validated JSON.
- 🎯 **Semantic Job Matching** — resumes are embedded and matched against job postings by vector
  similarity in Qdrant, with an automatic keyword-overlap fallback if Qdrant or the embedding
  provider is unavailable (see [Known Limitations](#-known-limitations) — this fallback is what's
  actually active in production right now).
- 💼 **Application Tracking** — full lifecycle management for job applications.
- 🎤 **AI Interview Prep** — interview questions generated per job posting (grounded in that job's
  actual title/description/seniority), not a static question bank.
- 📊 **Analytics Dashboard** — job search progress and application stats.
- 📧 **Email Automation** — schedule a follow-up email for a future send time; a background loop
  polls for due sends and delivers them via SMTP. This is user-initiated scheduled sending, not
  automatic sending triggered by application status changes.
- 🔍 **Job Scraping** — a dedicated Go service scrapes RemoteOK and WeWorkRemotely on a schedule
  and serves job search/listing directly.

## 🏗️ Architecture

```
jobforge-ai/
├── frontend/           # Next.js 15 (TypeScript, Tailwind CSS, shadcn/ui) — deployed on Vercel
├── backend-python/     # FastAPI — auth, resumes, applications, interviews, AI, email — on Render
├── backend-go/         # Go — job scraping (RemoteOK, WeWorkRemotely) + job search — on Render
├── infrastructure/     # Local Docker Compose (Postgres, Redis, Qdrant) for development
└── docs/               # API, architecture, and setup docs
```

Go and Python are independently deployed services that both read/write the same `jobs` table in
Postgres — Go owns scraping and job search/listing, Python owns everything else. The frontend
calls each directly (`NEXT_PUBLIC_GO_API_URL` for jobs, `NEXT_PUBLIC_API_URL` for everything else).

There's no Kubernetes or Terraform in this project — "infrastructure" here means Dockerized
services deployed to Render (Python + Go) and Vercel (frontend), plus a `docker-compose.yml` for
local development against Postgres, Redis, and Qdrant.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+
- **Python** 3.11+
- **Go** 1.21+
- **PostgreSQL** 16
- **Redis** 7 (optional locally — see [Known Limitations](#-known-limitations))
- **Qdrant** (optional locally — same)
- **Docker** (optional, for `docker-compose up`)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/ayushgupta-15/jobforge-ai.git
   cd jobforge-ai
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and OpenRouter API key
   ```

3. **Start the Python backend**
   ```bash
   cd backend-python
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
   API: http://localhost:8000
   Docs: http://localhost:8000/docs

4. **Start the Go job-search service**
   ```bash
   cd backend-go
   go run ./cmd/server
   ```
   API: http://localhost:8080

5. **Start the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   App: http://localhost:3000

### Docker Compose

```bash
docker-compose up -d
```
Starts local Postgres, Redis, and Qdrant containers for development (see
[Known Limitations](#-known-limitations) for why these aren't set up in production yet).

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand
- **Forms:** React Hook Form + Zod

### Backend
- **Framework:** FastAPI (Python) + Gin (Go)
- **Database:** PostgreSQL + SQLAlchemy (Python) / `lib/pq` (Go), shared `jobs` table
- **Cache / rate limiting:** Redis (built and tested, not yet provisioned in production)
- **Vector DB:** Qdrant (built and tested, not yet provisioned in production)
- **AI/LLM:** [OpenRouter](https://openrouter.ai/), default model `meta-llama/llama-3.1-8b-instruct`
  — configurable via `OPENAI_MODEL`, not tied to OpenAI specifically
- **Auth:** JWT

### Infrastructure
- **Containers:** Docker (each service has its own Dockerfile)
- **Hosting:** Render (Python + Go services) + Vercel (frontend)
- **CI/CD:** GitHub Actions — runs the real backend test suite and frontend lint/build on every
  push and PR (no bypass flags; a failing test or lint error actually fails the pipeline)

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Setup Guide](./docs/SETUP.md)
- [Interview Prep Guide](./docs/INTERVIEW_GUIDE.md)
- [Contributing Guidelines](./docs/CONTRIBUTING.md)

`planning/` contains early scaffolding documents from the project's first days — each is now
clearly date-stamped as historical and doesn't reflect the current state.

## 🧪 Testing

```bash
# Backend tests (real Postgres/Redis/Qdrant in CI; see backend-python/tests/)
cd backend-python
pytest

# Frontend
cd frontend
npm run lint && npm run build
```

Backend test coverage focuses on the highest-value logic: `test_job_matching.py` (semantic
matching + per-job keyword fallback, embedding/Qdrant failures mocked at the boundary),
`test_rate_limit.py` (the Nth-call-succeeds/N+1th-rejected boundary, fail-open when Redis is
down), `test_cache.py`, and `test_vector_store.py` (a real Qdrant round-trip in CI, no embedding
API cost). Frontend has no automated test suite yet — see
[Known Limitations](#-known-limitations).

## 🌐 Deployment

- **Frontend:** Vercel, auto-deploys on push to `main`.
- **Python API:** Render web service, auto-deploys on push to `main`.
- **Go API:** Render web service, auto-deploys on push to `main`.

See [SETUP.md](./docs/SETUP.md) for environment variable details.

## ⚠️ Known Limitations

Being upfront about what's still incomplete, rather than let it be found later:

- **Qdrant isn't provisioned in production yet.** The real semantic-matching code path (embed the
  resume, query Qdrant for nearest neighbors) is built and tested, but `QDRANT_URL` isn't set to a
  live instance in Render. Right now, live job matching runs entirely on the keyword-overlap
  fallback path. Provisioning a Qdrant instance (Qdrant Cloud's free tier works) and setting
  `QDRANT_URL` will activate real semantic matching with no code changes.
- **Redis isn't provisioned in production yet**, for the same reason. Job-search caching and
  per-user AI rate limiting are both built and tested against a real Redis in CI, but fail open
  (allow the request through) when Redis is unreachable — so right now neither is actually
  enforced live. Provisioning Redis (Render's Redis add-on, or any managed Redis) and setting
  `REDIS_URL` will activate both.
- **Email automation is scheduled/delayed send, not event-triggered.** A background loop polls for
  emails a user has scheduled and sends them via SMTP when due. Nothing sends automatically when
  an application's status changes — that would need to be built separately.
- **No frontend test coverage.** The backend has a real, CI-enforced test suite; the frontend
  doesn't have automated tests yet.

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./docs/CONTRIBUTING.md).

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

## 👨‍💻 Author

[ayushgupta-15](https://github.com/ayushgupta-15)

## 📞 Support

- 🐛 [Report Issues](https://github.com/ayushgupta-15/jobforge-ai/issues)
- 💬 [Discussions](https://github.com/ayushgupta-15/jobforge-ai/discussions)

---

⭐ **Star this repo if you find it helpful!**
