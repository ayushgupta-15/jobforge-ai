# 🚀 JobForge AI

> **AI-Powered Job Application Management Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://www.python.org/)

## 📋 Overview

JobForge AI helps job seekers optimize their application process using artificial intelligence:

- 📄 **Resume Optimization** - AI-powered ATS scoring and suggestions
- 🎯 **Smart Job Matching** - Vector-based semantic job search
- 💼 **Application Tracking** - Complete lifecycle management
- 🎤 **Interview Preparation** - AI-generated questions and mock interviews
- 📊 **Analytics Dashboard** - Track your job search performance
- 📧 **Email Automation** - Automated follow-ups and outreach
- 🔌 **Chrome Extension** - One-click job capture from any site

## 🏗️ Architecture

```
jobforge-ai/
├── frontend/           # Next.js 15 (TypeScript, Tailwind CSS, shadcn/ui)
├── backend-python/     # FastAPI (AI/ML, Business Logic)
├── backend-go/         # Go (High-performance services) [Planned]
├── chrome-extension/   # Browser extension [Planned]
└── infrastructure/     # Docker, K8s, Terraform
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+
- **Python** 3.11+
- **PostgreSQL** 16
- **Redis** 7
- **Docker** (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jobforge-ai.git
   cd jobforge-ai
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start Backend**
   ```bash
   cd backend-python
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
   API: http://localhost:8000  
   Docs: http://localhost:8000/docs

4. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   App: http://localhost:3000

### Docker Compose (Recommended)

```bash
docker-compose up -d
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand
- **Forms:** React Hook Form + Zod

### Backend
- **Framework:** FastAPI
- **Database:** PostgreSQL + SQLAlchemy
- **Cache:** Redis
- **Vector DB:** Qdrant
- **AI/ML:** OpenAI GPT-4, Anthropic Claude
- **Auth:** JWT

### Infrastructure
- **Containers:** Docker + Docker Compose
- **Orchestration:** Kubernetes
- **IaC:** Terraform
- **CI/CD:** GitHub Actions

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing Guidelines](./docs/CONTRIBUTING.md)

## 🧪 Testing

```bash
# Backend tests
cd backend-python
pytest

# Frontend tests
cd frontend
npm test
```

## 🌐 Deployment

### Frontend (Vercel)
```bash
vercel deploy
```

### Backend (Railway)
```bash
railway up
```

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./docs/CONTRIBUTING.md).

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

## 👨‍💻 Author

Built with ❤️ by [Your Name]

## 🙏 Acknowledgments

- OpenAI & Anthropic for AI APIs
- Next.js & FastAPI teams
- Open source community

## 📞 Support

- 🐛 [Report Issues](https://github.com/yourusername/jobforge-ai/issues)
- 💬 [Discussions](https://github.com/yourusername/jobforge-ai/discussions)
- 📧 Email: support@jobforge.ai

---

⭐ **Star this repo if you find it helpful!**
