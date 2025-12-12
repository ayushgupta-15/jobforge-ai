-- JobForge AI - Database Initialization
-- This file is automatically executed when PostgreSQL container starts

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search

-- Create initial database structure
-- (Full schema will be managed by Alembic migrations)
