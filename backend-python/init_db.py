#!/usr/bin/env python3
"""
JobForge AI - Database Initialization Script
Creates tables and inserts sample data for testing
"""

import sys
sys.path.insert(0, '/home/ash/Programming/jobforge-ai/backend-python')

from app.core.database import SessionLocal, Base, engine
from app.models import User, Resume, Application, Job, Interview
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import uuid

def init_database():
    """Create all tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully")

def seed_sample_data():
    """Insert sample data for testing"""
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_user = db.query(User).filter(User.email == "demo@jobforge.ai").first()
        if existing_user:
            print("⚠️  Sample data already exists, skipping...")
            return
        
        print("\nSeeding sample data...")
        
        # Create sample user
        user_id = uuid.uuid4()
        demo_user = User(
            id=user_id,
            email="demo@jobforge.ai",
            password_hash=get_password_hash("Demo@12345"),
            full_name="Demo User",
            phone="+1-555-0100",
            location="San Francisco, CA",
            linkedin_url="https://linkedin.com/in/demouser",
            github_url="https://github.com/demouser",
            portfolio_url="https://demouser.dev",
            email_verified=True,
            is_active=True,
            subscription_tier="PRO"
        )
        db.add(demo_user)
        db.flush()
        
        print("✅ Created demo user (email: demo@jobforge.ai, password: Demo@12345)")
        
        # Create sample resumes
        resumes = [
            Resume(
                id=uuid.uuid4(),
                user_id=user_id,
                title="Senior Software Engineer Resume",
                file_url="/uploads/resumes/senior-engineer.pdf",
                file_type="application/pdf",
                is_primary=True,
                ats_score=85.5,
                keyword_match_score=92.0,
                strengths=["Strong technical background", "10+ years experience", "Leadership skills"],
                weaknesses=["Could add more metrics", "Missing some keywords"],
                suggestions=["Add quantifiable achievements", "Emphasize leadership experience"]
            ),
            Resume(
                id=uuid.uuid4(),
                user_id=user_id,
                title="Full-Stack Developer Resume",
                file_url="/uploads/resumes/fullstack-dev.pdf",
                file_type="application/pdf",
                is_primary=False,
                ats_score=78.2,
                keyword_match_score=85.0,
                strengths=["Full-stack skills", "Modern tech stack"],
                weaknesses=["Less enterprise experience"],
                suggestions=["Highlight cloud deployment experience"]
            ),
        ]
        db.add_all(resumes)
        db.flush()
        print("✅ Created 2 sample resumes")
        
        # Create sample jobs
        jobs = [
            Job(
                id=uuid.uuid4(),
                title="Senior Software Engineer",
                company="Tech Corp",
                location="San Francisco, CA",
                remote_type="hybrid",
                description="Looking for experienced software engineer with strong backend expertise...",
                requirements="10+ years experience, Python, Go, Kubernetes",
                salary_min=150000,
                salary_max=200000,
                job_type="full-time",
                experience_level="senior",
                source_url="https://example.com/jobs/1",
                posted_date=datetime.utcnow() - timedelta(days=5),
                is_active=True
            ),
            Job(
                id=uuid.uuid4(),
                title="Full-Stack Developer",
                company="StartupXYZ",
                location="Remote",
                remote_type="remote",
                description="Join our fast-growing startup as a full-stack developer...",
                requirements="5+ years experience, React, Node.js, PostgreSQL",
                salary_min=120000,
                salary_max=160000,
                job_type="full-time",
                experience_level="mid",
                source_url="https://example.com/jobs/2",
                posted_date=datetime.utcnow() - timedelta(days=2),
                is_active=True
            ),
            Job(
                id=uuid.uuid4(),
                title="DevOps Engineer",
                company="CloudServices Inc",
                location="New York, NY",
                remote_type="on-site",
                description="Seeking DevOps engineer for infrastructure management...",
                requirements="7+ years experience, AWS, Docker, Terraform",
                salary_min=130000,
                salary_max=180000,
                job_type="full-time",
                experience_level="senior",
                source_url="https://example.com/jobs/3",
                posted_date=datetime.utcnow() - timedelta(days=1),
                is_active=True
            ),
        ]
        db.add_all(jobs)
        db.flush()
        print("✅ Created 3 sample jobs")
        
        # Create sample applications
        applications = [
            Application(
                id=uuid.uuid4(),
                user_id=user_id,
                job_id=jobs[0].id,
                company_name="Tech Corp",
                job_title="Senior Software Engineer",
                job_url="https://example.com/jobs/1",
                status="interview",
                applied_date=datetime.utcnow() - timedelta(days=5),
                source="LinkedIn",
                notes="Application sent via LinkedIn. Had initial phone screening.",
                match_score=88.5
            ),
            Application(
                id=uuid.uuid4(),
                user_id=user_id,
                job_id=jobs[1].id,
                company_name="StartupXYZ",
                job_title="Full-Stack Developer",
                job_url="https://example.com/jobs/2",
                status="screening",
                applied_date=datetime.utcnow() - timedelta(days=2),
                source="Company Website",
                notes="Applied directly through company career page",
                match_score=82.0
            ),
            Application(
                id=uuid.uuid4(),
                user_id=user_id,
                company_name="DataTech Solutions",
                job_title="Senior Data Engineer",
                status="draft",
                notes="Planning to apply soon",
                match_score=None
            ),
        ]
        db.add_all(applications)
        db.flush()
        print("✅ Created 3 sample applications")
        
        # Create sample interviews
        interviews = [
            Interview(
                id=uuid.uuid4(),
                user_id=user_id,
                application_id=applications[0].id,
                interview_type="phone",
                status="scheduled",
                scheduled_at=datetime.utcnow() + timedelta(days=3),
                duration_minutes="45",
                interviewer_name="Sarah Johnson",
                interviewer_email="sarah@techcorp.com",
                location_or_url="https://zoom.us/...",
                notes="First round technical screening"
            ),
            Interview(
                id=uuid.uuid4(),
                user_id=user_id,
                application_id=applications[0].id,
                interview_type="in_person",
                status="scheduled",
                scheduled_at=datetime.utcnow() + timedelta(days=10),
                duration_minutes="60",
                interviewer_name="Mike Chen",
                interviewer_email="mike@techcorp.com",
                location_or_url="Tech Corp HQ, 123 Main St, SF",
                notes="Onsite interview with team"
            ),
        ]
        db.add_all(interviews)
        db.flush()
        print("✅ Created 2 sample interviews")
        
        # Commit all changes
        db.commit()
        print("\n✅ Sample data seeded successfully!")
        print("\n📝 Demo Credentials:")
        print("   Email: demo@jobforge.ai")
        print("   Password: Demo@12345")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    try:
        init_database()
        seed_sample_data()
        print("\n🎉 Database initialization complete!")
    except Exception as e:
        print(f"\n❌ Initialization failed: {e}")
        sys.exit(1)
