#!/bin/bash
# JobForge AI - Project Initialization Script
# Run this after the WSL setup script

set -e  # Exit on error

echo "🚀 JobForge AI - Project Initialization"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ $1${NC}"; }
print_step() { echo -e "${BLUE}► $1${NC}"; }

# Verify we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend-python" ] || [ ! -d "backend-go" ]; then
    echo "Error: Not in jobforge-ai directory or directories not created"
    echo "Please run this script from the jobforge-ai directory"
    exit 1
fi

# ============================================
# Step 1: Create .gitignore
# ============================================
print_step "Creating .gitignore..."

cat > .gitignore << 'EOF'
# Environment variables
.env
.env.local
.env*.local
*.env

# Dependencies
node_modules/
venv/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python

# Build outputs
.next/
out/
dist/
build/
*.egg-info/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Database
*.db
*.sqlite

# Docker
docker-compose.override.yml

# Test coverage
.coverage
htmlcov/
.pytest_cache/
coverage/

# Go
*.exe
*.test
*.out
vendor/

# Misc
.cache/
temp/
tmp/
EOF

print_success ".gitignore created"

# ============================================
# Step 2: Create main README
# ============================================
print_step "Creating main README.md..."

cat > README.md << 'EOF'
# 🚀 JobForge AI

> AI-Powered Job Application Orchestrator for Landing Your Dream Tech Job

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## 🎯 What is JobForge AI?

JobForge AI is an intelligent job application management platform that uses AI agents to help you:

- 📄 **Optimize Resumes** - AI-powered resume analysis and optimization for each job
- 🎯 **Match Jobs** - Semantic job matching using vector embeddings
- 📧 **Automate Outreach** - Generate personalized emails and follow-ups
- 🎤 **Prep Interviews** - AI-generated interview questions and answers
- 📊 **Track Applications** - Comprehensive application tracking and analytics
- 🔌 **Browser Extension** - One-click job capture from LinkedIn, Indeed, and more

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Zustand** - State management

### Backend
- **Python (FastAPI)** - AI/ML services
- **Go (Fiber)** - High-performance services
- **PostgreSQL** - Primary database
- **Redis** - Caching & queues
- **Qdrant** - Vector database

### AI/ML
- **OpenAI API** - GPT-4 for text generation
- **Anthropic API** - Claude for analysis
- **LangChain** - Agent orchestration

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- Node.js 20+
- Python 3.11+
- Go 1.21+

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd jobforge-ai
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Python API: http://localhost:8000
   - Go API: http://localhost:8080
   - PgAdmin: http://localhost:5050

## 📁 Project Structure

```
jobforge-ai/
├── frontend/              # Next.js application
├── backend-python/        # FastAPI service (AI/ML)
├── backend-go/           # Go service (scraping, performance)
├── chrome-extension/     # Browser extension
├── infrastructure/       # Docker, Terraform
├── docs/                # Documentation
└── scripts/             # Utility scripts
```

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Python Backend Development
```bash
cd backend-python
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Go Backend Development
```bash
cd backend-go
go mod download
air  # Hot reload
```

## 📚 Documentation

- [Setup Guide](./docs/SETUP.md)
- [API Documentation](./docs/API.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Contributing](./docs/CONTRIBUTING.md)

## 🎓 Features

### Phase 1: Core Features ✅
- [x] User authentication
- [x] Resume upload and parsing
- [x] Application tracking
- [x] Job scraping

### Phase 2: AI Features 🚧
- [ ] AI resume optimizer
- [ ] Job matching algorithm
- [ ] Interview preparation
- [ ] Email automation

### Phase 3: Advanced 📋
- [ ] Chrome extension
- [ ] Portfolio generator
- [ ] Network intelligence
- [ ] Analytics dashboard

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Built with ❤️ by [Your Name]

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Anthropic for Claude API
- All open-source contributors

---

**Star ⭐ this repo if it helped you!**
EOF

print_success "README.md created"

# ============================================
# Step 3: Create environment variable templates
# ============================================
print_step "Creating .env.example..."

cat > .env.example << 'EOF'
# ============================================
# JobForge AI - Environment Variables
# ============================================

# Copy this file to .env and fill in your values
# NEVER commit .env to version control

# ============================================
# AI API Keys (REQUIRED)
# ============================================
OPENAI_API_KEY=sk-your-openai-api-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here

# ============================================
# Security
# ============================================
SECRET_KEY=your-super-secret-jwt-key-min-32-chars
NEXTAUTH_SECRET=your-nextauth-secret-key-min-32-chars

# ============================================
# Database (for production)
# ============================================
DATABASE_URL=postgresql://user:password@localhost:5432/jobforge_db

# ============================================
# OAuth (Optional)
# ============================================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# ============================================
# Storage (AWS S3 or Cloudflare R2)
# ============================================
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=jobforge-uploads
S3_REGION=us-east-1

# ============================================
# Email Service
# ============================================
SENDGRID_API_KEY=
# OR
RESEND_API_KEY=

# ============================================
# Redis & Qdrant (Local Development)
# ============================================
REDIS_URL=redis://localhost:6379/0
QDRANT_URL=http://localhost:6333

# ============================================
# Feature Flags
# ============================================
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_CHROME_EXTENSION=true
NEXT_PUBLIC_ENABLE_EMAIL_AUTOMATION=true

# ============================================
# Environment
# ============================================
NODE_ENV=development
ENVIRONMENT=development
DEBUG=true
EOF

print_success ".env.example created"

# ============================================
# Step 4: Create Docker Compose file
# ============================================
print_step "Creating docker-compose.yml..."

# This will be the complete Docker Compose file from the artifact
# For now, create a placeholder
cat > docker-compose.yml << 'EOF'
# Docker Compose configuration will be added here
# See infrastructure/docker/ for the complete setup
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: jobforge-postgres
    environment:
      POSTGRES_USER: jobforge
      POSTGRES_PASSWORD: jobforge_dev_password
      POSTGRES_DB: jobforge_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: jobforge-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  qdrant:
    image: qdrant/qdrant:latest
    container_name: jobforge-qdrant
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

volumes:
  postgres_data:
  redis_data:
  qdrant_data:
EOF

print_success "docker-compose.yml created (basic version)"

# ============================================
# Step 5: Create infrastructure directory structure
# ============================================
print_step "Creating infrastructure structure..."

mkdir -p infrastructure/docker/postgres
mkdir -p infrastructure/docker/nginx
mkdir -p infrastructure/terraform
mkdir -p infrastructure/kubernetes

# Create database init script
cat > infrastructure/docker/postgres/init.sql << 'EOF'
-- JobForge AI - Database Initialization
-- This file is automatically executed when PostgreSQL container starts

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search

-- Create initial database structure
-- (Full schema will be managed by Alembic migrations)
EOF

print_success "Infrastructure structure created"

# ============================================
# Step 6: Create scripts directory
# ============================================
print_step "Creating utility scripts..."

mkdir -p scripts

cat > scripts/setup.sh << 'SCRIPTEOF'
#!/bin/bash
# Quick setup script for new developers

echo "Setting up JobForge AI..."

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Python is required but not installed."; exit 1; }

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ Created .env file - please edit it with your API keys"
fi

# Start Docker services
echo "Starting Docker services..."
docker-compose up -d

echo "✓ Setup complete!"
echo "Access the app at http://localhost:3000"
SCRIPTEOF

chmod +x scripts/setup.sh

cat > scripts/clean.sh << 'SCRIPTEOF'
#!/bin/bash
# Clean up script - removes all containers, volumes, and build artifacts

echo "⚠️  This will remove all Docker containers and volumes!"
read -p "Are you sure? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down -v
    rm -rf frontend/node_modules frontend/.next
    rm -rf backend-python/venv backend-python/__pycache__
    rm -rf backend-go/vendor
    echo "✓ Cleanup complete"
fi
SCRIPTEOF

chmod +x scripts/clean.sh

print_success "Utility scripts created"

# ============================================
# Step 7: Create docs directory
# ============================================
print_step "Creating documentation structure..."

mkdir -p docs

cat > docs/SETUP.md << 'EOF'
# Setup Guide

Detailed setup instructions will be here.
EOF

cat > docs/API.md << 'EOF'
# API Documentation

API documentation will be here.
EOF

cat > docs/ARCHITECTURE.md << 'EOF'
# Architecture

System architecture documentation will be here.
EOF

cat > docs/CONTRIBUTING.md << 'EOF'
# Contributing Guide

Contributing guidelines will be here.
EOF

print_success "Documentation structure created"

# ============================================
# Step 8: Create LICENSE
# ============================================
print_step "Creating LICENSE..."

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

print_success "LICENSE created"

# ============================================
# Step 9: Initialize Git
# ============================================
print_step "Configuring Git..."

git config core.autocrlf input
git config core.fileMode false

# Create initial commit
git add .gitignore README.md LICENSE .env.example
git commit -m "Initial commit: Project structure" || true

print_success "Git configured"

# ============================================
# Summary
# ============================================

echo ""
echo "========================================"
echo "✅ Project Initialization Complete!"
echo "========================================"
echo ""
echo "📁 Created:"
echo "  - .gitignore"
echo "  - README.md"
echo "  - LICENSE"
echo "  - .env.example"
echo "  - docker-compose.yml (basic)"
echo "  - infrastructure/ structure"
echo "  - scripts/ utilities"
echo "  - docs/ structure"
echo ""
echo "🎯 Next Steps:"
echo "  1. Copy .env.example to .env"
echo "  2. Edit .env with your API keys"
echo "  3. Run: bash scripts/setup.sh"
echo ""
echo "Or continue with manual setup:"
echo "  1. cd frontend && npm install"
echo "  2. cd backend-python && python -m venv venv"
echo "  3. cd backend-go && go mod init"
echo ""
print_success "Ready to start building! 🚀"
