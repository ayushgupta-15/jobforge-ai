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
