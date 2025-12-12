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
