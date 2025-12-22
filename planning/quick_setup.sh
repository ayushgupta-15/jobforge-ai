#!/bin/bash
# JobForge AI - Quick GitHub Setup
# Run this from your project root: bash quick_setup.sh

set -e

echo "🚀 JobForge AI - Quick GitHub Setup"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend-python" ]; then
    echo -e "${RED}❌ Error: Run this from the jobforge-ai root directory${NC}"
    exit 1
fi

echo "📋 Step 1: Cleaning large files..."
echo ""

# Remove large files/folders
echo "  → Removing node_modules..."
rm -rf frontend/node_modules frontend/.next

echo "  → Removing Python virtual environments..."
rm -rf backend-python/venv backend-python/source

echo "  → Removing Python cache..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true

echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

# ============================================
# Create .gitignore
# ============================================

echo "📋 Step 2: Creating .gitignore..."

cat > .gitignore << 'EOF'
# ============================================
# JobForge AI - .gitignore
# ============================================

# Environment Variables (NEVER COMMIT!)
.env
.env.*
!.env.example
*.env
.secrets/

# Frontend (Next.js)
frontend/node_modules/
frontend/.next/
frontend/out/
frontend/build/
frontend/.turbo
frontend/.vercel

# Backend Python
backend-python/venv/
backend-python/env/
backend-python/.venv/
backend-python/source/
**/__pycache__/
*.pyc
*.pyo
*.pyd
.Python
*.egg-info/
.pytest_cache/
.coverage
htmlcov/
.mypy_cache/

# Backend Go
backend-go/vendor/
backend-go/bin/

# Databases
*.db
*.sqlite
*.sqlite3
postgres_data/
redis_data/
qdrant_data/

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Docker
docker-compose.override.yml

# Temporary
*.tmp
.cache/
temp/
EOF

echo -e "${GREEN}✅ .gitignore created${NC}"
echo ""

# ============================================
# Create .env.example
# ============================================

echo "📋 Step 3: Creating .env.example template..."

cat > .env.example << 'EOF'
# ============================================
# JobForge AI - Environment Variables Template
# ============================================
# Copy this to .env and fill in your values
# NEVER commit .env files to git!

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/jobforge_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key

# AI APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Authentication
SECRET_KEY=your-super-secret-key-min-32-characters-long
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (Frontend URL)
CORS_ORIGINS=http://localhost:3000,https://jobforge-ai.vercel.app

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF

echo -e "${GREEN}✅ .env.example created${NC}"
echo ""

# ============================================
# Create main README.md
# ============================================

echo "📋 Step 4: Creating README.md..."

cat > README.md << 'EOF'
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
EOF

echo -e "${GREEN}✅ README.md created${NC}"
echo ""

# ============================================
# Create GitHub Actions workflow
# ============================================

echo "📋 Step 5: Creating GitHub Actions CI/CD..."

mkdir -p .github/workflows

cat > .github/workflows/ci.yml << 'EOF'
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  frontend-lint:
    name: Frontend Lint & Build
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Run linter
        working-directory: ./frontend
        run: npm run lint
      
      - name: Build
        working-directory: ./frontend
        run: npm run build

  backend-test:
    name: Backend Tests
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
          cache-dependency-path: backend-python/requirements.txt
      
      - name: Install dependencies
        working-directory: ./backend-python
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      
      - name: Run tests
        working-directory: ./backend-python
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379/0
          SECRET_KEY: test_secret_key_for_ci
        run: pytest -v
EOF

echo -e "${GREEN}✅ GitHub Actions workflow created${NC}"
echo ""

# ============================================
# Create LICENSE
# ============================================

echo "📋 Step 6: Creating MIT LICENSE..."

cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2024 JobForge AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

echo -e "${GREEN}✅ LICENSE created${NC}"
echo ""

# ============================================
# Check Git status
# ============================================

echo "📋 Step 7: Checking Git status..."
echo ""

if [ -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Git repository already initialized${NC}"
else
    echo "  → Initializing Git repository..."
    git init
    git branch -M main
    echo -e "${GREEN}✅ Git initialized${NC}"
fi

echo ""

# ============================================
# Summary
# ============================================

echo "============================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "============================================"
echo ""
echo "📊 Project Size:"
du -sh . 2>/dev/null | cut -f1
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Review generated files:"
echo "   - .gitignore"
echo "   - .env.example"
echo "   - README.md"
echo "   - LICENSE"
echo "   - .github/workflows/ci.yml"
echo ""
echo "2. Create .env file from template:"
echo "   cp .env.example backend-python/.env"
echo "   cp .env.example frontend/.env.local"
echo "   # Then edit with your API keys"
echo ""
echo "3. Test that everything still works locally"
echo ""
echo "4. Commit to Git:"
echo "   git add ."
echo "   git status  # Review files to be committed"
echo "   git commit -m \"Initial commit: JobForge AI\""
echo ""
echo "5. Create GitHub repository:"
echo "   # Option A: Via GitHub CLI"
echo "   gh auth login"
echo "   gh repo create jobforge-ai --public --source=. --push"
echo ""
echo "   # Option B: Via website"
echo "   # Go to: https://github.com/new"
echo "   # Then run:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/jobforge-ai.git"
echo "   git push -u origin main"
echo ""
echo "6. Deploy (see DEPLOYMENT.md for details):"
echo "   - Frontend: Vercel (vercel.com)"
echo "   - Backend: Railway (railway.app)"
echo ""
echo -e "${GREEN}🚀 You're ready to push to GitHub!${NC}"
echo ""