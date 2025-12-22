#!/bin/bash
# JobForge AI - Quick Reference Guide

cat << 'EOF'

╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║         📚 JobForge AI - QUICK REFERENCE GUIDE                          ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝


🚀 QUICK START
──────────────────────────────────────────────────────────────────────────

1. Start Everything:
   chmod +x /home/ash/Programming/jobforge-ai/start-dev.sh
   /home/ash/Programming/jobforge-ai/start-dev.sh

2. Open in Browser:
   http://localhost:3000

3. Login:
   Email:    demo@jobforge.ai
   Password: Demo@12345

4. Explore Features:
   ✅ Dashboard (real stats)
   ✅ Upload Resume
   ✅ Create Application
   ✅ Browse Jobs
   ✅ Schedule Interview


📍 IMPORTANT URLS
──────────────────────────────────────────────────────────────────────────

Frontend:
  http://localhost:3000          Main application
  http://localhost:3000/login    Login page
  http://localhost:3000/register Register page
  http://localhost:3000/dashboard Dashboard (requires login)

Backend API:
  http://localhost:8000           API root
  http://localhost:8000/health    Health check
  http://localhost:8000/docs      Swagger UI (API docs)
  http://localhost:8000/redoc     ReDoc (Alternative docs)


💻 TERMINAL COMMANDS
──────────────────────────────────────────────────────────────────────────

Start Backend Only:
  cd /home/ash/Programming/jobforge-ai/backend-python
  source source/bin/activate
  python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

Start Frontend Only:
  cd /home/ash/Programming/jobforge-ai/frontend
  npm run dev

Initialize Database:
  cd /home/ash/Programming/jobforge-ai/backend-python
  source source/bin/activate
  python init_db.py

Run Tests (if available):
  cd /home/ash/Programming/jobforge-ai/backend-python
  source source/bin/activate
  pytest


📝 DEMO CREDENTIALS
──────────────────────────────────────────────────────────────────────────

Default User:
  Email:    demo@jobforge.ai
  Password: Demo@12345

This account has sample data (resumes, applications, interviews)


📚 API ENDPOINTS (34 Total)
──────────────────────────────────────────────────────────────────────────

Authentication (6):
  POST   /api/v1/auth/register
  POST   /api/v1/auth/login
  POST   /api/v1/auth/refresh
  GET    /api/v1/auth/me
  POST   /api/v1/auth/change-password
  POST   /api/v1/auth/logout

Resumes (7):
  GET    /api/v1/resumes
  POST   /api/v1/resumes/upload
  GET    /api/v1/resumes/{id}
  PUT    /api/v1/resumes/{id}
  DELETE /api/v1/resumes/{id}
  POST   /api/v1/resumes/{id}/set-primary
  POST   /api/v1/resumes/{id}/analyze

Applications (7):
  GET    /api/v1/applications
  POST   /api/v1/applications
  GET    /api/v1/applications/{id}
  PUT    /api/v1/applications/{id}
  DELETE /api/v1/applications/{id}
  PATCH  /api/v1/applications/{id}/status
  GET    /api/v1/applications/stats

Jobs (6):
  GET    /api/v1/jobs
  GET    /api/v1/jobs/search?q=...
  GET    /api/v1/jobs/{id}
  POST   /api/v1/jobs
  PUT    /api/v1/jobs/{id}
  DELETE /api/v1/jobs/{id}

Interviews (8):
  GET    /api/v1/interviews
  GET    /api/v1/interviews/upcoming
  POST   /api/v1/interviews
  GET    /api/v1/interviews/{id}
  PUT    /api/v1/interviews/{id}
  DELETE /api/v1/interviews/{id}
  PATCH  /api/v1/interviews/{id}/status


🔐 EXAMPLE API CALLS
──────────────────────────────────────────────────────────────────────────

Login:
  curl -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "demo@jobforge.ai", "password": "Demo@12345"}'

Get Current User (requires token):
  curl -H "Authorization: Bearer {ACCESS_TOKEN}" \
    http://localhost:8000/api/v1/auth/me

List Resumes (requires token):
  curl -H "Authorization: Bearer {ACCESS_TOKEN}" \
    http://localhost:8000/api/v1/resumes

List Applications (requires token):
  curl -H "Authorization: Bearer {ACCESS_TOKEN}" \
    http://localhost:8000/api/v1/applications

List Jobs:
  curl http://localhost:8000/api/v1/jobs

Search Jobs:
  curl "http://localhost:8000/api/v1/jobs/search?q=engineer"


📂 FILE STRUCTURE
──────────────────────────────────────────────────────────────────────────

Backend:
  /backend-python/
    ├── app/
    │   ├── main.py (FastAPI app)
    │   ├── init_db.py (Database init)
    │   ├── models/ (5 models)
    │   ├── schemas/ (5 schemas)
    │   ├── crud/ (5 CRUD modules)
    │   └── api/v1/endpoints/ (5 routers)
    ├── requirements.txt
    └── source/ (virtual environment)

Frontend:
  /frontend/
    ├── src/
    │   ├── app/ (5 pages)
    │   ├── components/ (UI components)
    │   ├── lib/
    │   │   ├── api/ (services)
    │   │   └── store/ (Zustand stores)
    │   └── types/
    ├── package.json
    └── next.config.ts


📖 DOCUMENTATION FILES
──────────────────────────────────────────────────────────────────────────

Read These:
  ✅ IMPLEMENTATION_COMPLETE.md - Summary and quick reference
  ✅ COMPLETE_FEATURE_GUIDE.md - Detailed feature documentation
  ✅ IMPLEMENTATION_STATUS.md - Architecture and checklist
  ✅ CHECKLIST.md - Complete task checklist
  ✅ start-dev.sh - Startup script
  ✅ init_db.py - Database initialization


🔍 FEATURES OVERVIEW
──────────────────────────────────────────────────────────────────────────

Dashboard (/dashboard):
  - Real-time statistics
  - Resume count
  - Application count
  - Interview count
  - Success rate
  ✅ All data from API

Resumes (/resumes):
  - Upload resume
  - List resumes
  - View ATS score
  - Analyze with AI
  - Set as primary
  - Delete resume
  ✅ Full CRUD

Applications (/applications):
  - Create application
  - Track status
  - View statistics
  - Filter by status
  - Edit/delete
  ✅ Full CRUD + Stats

Jobs (/jobs):
  - List jobs
  - Search by keyword
  - Filter by location
  - View job details
  ✅ Full functionality

Interviews (/interviews):
  - List interviews
  - Schedule new interview
  - Update status
  - Track details
  ✅ Full CRUD


💡 TIPS
──────────────────────────────────────────────────────────────────────────

1. API Documentation:
   Visit http://localhost:8000/docs for interactive API documentation
   You can test all endpoints directly in the browser!

2. Browser DevTools:
   Open Network tab to see all API calls
   Check Application tab to see JWT tokens in localStorage

3. Sample Data:
   After running init_db.py, there's demo@jobforge.ai account ready
   It has sample resumes, applications, and interviews to test with

4. Hot Reload:
   Both backend and frontend support hot reload (auto-restart on changes)
   Backend: Update Python files → auto-reload
   Frontend: Update React files → auto-refresh

5. Database Reset:
   Run init_db.py again to reset database with fresh sample data

6. API Testing:
   Use the swagger UI at /docs instead of typing curl commands
   Much easier and shows you the response schema


❓ TROUBLESHOOTING
──────────────────────────────────────────────────────────────────────────

Port Already in Use:
  Backend (8000): lsof -i :8000 | kill -9 <PID>
  Frontend (3000): lsof -i :3000 | kill -9 <PID>

Database Connection Issues:
  Check PostgreSQL is running
  Verify DATABASE_URL in .env
  Run: python init_db.py again

Module Not Found Errors:
  Backend: Activate venv: source source/bin/activate
  Frontend: Install deps: npm install

CORS Errors:
  Check CORS_ORIGINS in backend config
  Frontend should be http://localhost:3000
  Backend should be http://localhost:8000


📞 QUICK HELP
──────────────────────────────────────────────────────────────────────────

Q: How do I upload a resume?
A: 1. Login to /dashboard
   2. Click "Upload Resume" button in Quick Actions
   3. Select a file and enter title
   4. Click upload - it goes to database

Q: How do I create an application?
A: 1. Navigate to /applications page
   2. Click "Add Application" button
   3. Fill company, position, status, etc.
   4. Click create - it saves to database

Q: How do I search for jobs?
A: 1. Navigate to /jobs page
   2. Type search term in search box
   3. Results from database appear below
   4. Click "View Job" for details

Q: Where is my data stored?
A: All data is stored in PostgreSQL database
   User data is isolated - can't see other users' data

Q: Is my password secure?
A: Yes! Passwords are hashed with Bcrypt
   Never stored in plain text


🎯 NEXT STEPS
──────────────────────────────────────────────────────────────────────────

Immediate:
  1. Start the dev environment
  2. Login with demo account
  3. Try uploading a resume
  4. Create an application
  5. Schedule an interview
  6. Check the dashboard stats update

Short Term:
  1. Customize the UI
  2. Add more sample data
  3. Integrate real AI for analysis
  4. Add email notifications

Medium Term:
  1. Deploy to production
  2. Add more features
  3. Build mobile app
  4. Create Chrome extension


═══════════════════════════════════════════════════════════════════════════

Need help? Check the docs:
  - IMPLEMENTATION_COMPLETE.md (this folder)
  - http://localhost:8000/docs (API docs)
  - Source code in /backend-python and /frontend

Ready? Run:
  /home/ash/Programming/jobforge-ai/start-dev.sh

═══════════════════════════════════════════════════════════════════════════
EOF
