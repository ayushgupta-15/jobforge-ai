#!/bin/bash
# JobForge AI - WSL Setup Script
# Run this script to install all required dependencies

set -e  # Exit on error

echo "🚀 JobForge AI - WSL Setup Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running in WSL
if grep -qi microsoft /proc/version; then
    print_success "Running in WSL"
else
    print_error "Not running in WSL. This script is optimized for WSL."
    exit 1
fi

# Update system
print_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_success "System updated"

# Install essential build tools
print_info "Installing essential build tools..."
sudo apt install -y curl wget git build-essential software-properties-common
print_success "Build tools installed"

# ============================================
# Install Node.js (v20 LTS)
# ============================================
print_info "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js already installed: $NODE_VERSION"
else
    print_info "Installing Node.js v20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js installed: $(node --version)"
fi

# Install npm global packages
print_info "Enabling Corepack..."
sudo corepack enable
corepack prepare npm@latest --activate
print_success "npm version: $(npm --version)"

# ============================================
# Install Python 3.11+
# ============================================
print_info "Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python already installed: $PYTHON_VERSION"
else
    print_info "Installing Python 3.11..."
    sudo add-apt-repository ppa:deadsnakes/ppa -y
    sudo apt update
    sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
    print_success "Python installed: $(python3 --version)"
fi

# Install pip if not present
if ! command -v pip3 &> /dev/null; then
    print_info "Installing pip..."
    sudo apt install -y python3-pip
    print_success "pip installed"
fi

# ============================================
# Install Go 1.21+
# ============================================
print_info "Checking Go installation..."
if command -v go &> /dev/null; then
    GO_VERSION=$(go version)
    print_success "Go already installed: $GO_VERSION"
else
    print_info "Installing Go 1.21..."
    GO_VERSION="1.21.5"
    wget https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz
    sudo rm -rf /usr/local/go
    sudo tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz
    rm go${GO_VERSION}.linux-amd64.tar.gz
    
    # Add to PATH
    echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
    echo 'export PATH=$PATH:$(go env GOPATH)/bin' >> ~/.bashrc
    export PATH=$PATH:/usr/local/go/bin
    
    print_success "Go installed: $(go version)"
fi

# ============================================
# Install Docker (WSL-specific)
# ============================================
print_info "Checking Docker installation..."
if command -v docker &> /dev/null; then
    print_success "Docker already installed: $(docker --version)"
else
    print_info "Installing Docker..."
    
    # Install Docker dependencies
    sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    print_success "Docker installed: $(docker --version)"
    print_info "⚠️  You need to RESTART your terminal for Docker permissions to take effect"
    print_info "After restart, run: docker ps"
fi

# ============================================
# Install Docker Compose
# ============================================
print_info "Checking Docker Compose installation..."
if command -v docker-compose &> /dev/null; then
    print_success "Docker Compose already installed: $(docker-compose --version)"
else
    print_info "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed: $(docker-compose --version)"
fi

# ============================================
# Install Additional Tools
# ============================================

# Install PostgreSQL client (for debugging)
print_info "Installing PostgreSQL client..."
sudo apt install -y postgresql-client
print_success "PostgreSQL client installed"

# Install Redis client (for debugging)
print_info "Installing Redis client..."
sudo apt install -y redis-tools
print_success "Redis client installed"

# Install pre-commit (optional but recommended)
print_info "Installing pre-commit..."
sudo apt install -y pre-commit
print_success "pre-commit installed"

# ============================================
# WSL-Specific Configurations
# ============================================

print_info "Applying WSL-specific configurations..."

# Increase file watchers (for Next.js)
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Configure Git for Windows/WSL line endings
git config --global core.autocrlf input
git config --global core.fileMode false

print_success "WSL configurations applied"

# ============================================
# Verify Installation
# ============================================

echo ""
echo "=================================="
echo "📋 Installation Summary"
echo "=================================="
echo ""

echo "Node.js:    $(node --version)"
echo "npm:        $(npm --version)"
echo "Python:     $(python3 --version)"
echo "pip:        $(pip3 --version)"
echo "Go:         $(go version | cut -d' ' -f3)"
echo "Docker:     $(docker --version | cut -d' ' -f3)"
echo "Docker Compose: $(docker-compose --version | cut -d' ' -f3)"
echo "Git:        $(git --version | cut -d' ' -f3)"

echo ""
print_success "All dependencies installed successfully!"
echo ""

# ============================================
# Next Steps
# ============================================

echo "=================================="
echo "🎯 Next Steps"
echo "=================================="
echo ""
echo "1. RESTART your terminal (to apply Docker group permissions)"
echo "2. Verify Docker works: docker ps"
echo "3. Navigate to your project: cd jobforge-ai"
echo "4. Continue with project setup"
echo ""

# ============================================
# Create helpful aliases
# ============================================

print_info "Creating helpful aliases..."
cat >> ~/.bashrc << 'EOF'

# JobForge AI aliases
alias jf-up='docker-compose up -d'
alias jf-down='docker-compose down'
alias jf-logs='docker-compose logs -f'
alias jf-restart='docker-compose restart'
alias jf-ps='docker-compose ps'
alias jf-frontend='cd frontend && npm run dev'
alias jf-backend-py='cd backend-python && source venv/bin/activate'
alias jf-backend-go='cd backend-go && go run cmd/server/main.go'
EOF

print_success "Aliases added to ~/.bashrc"

echo ""
print_info "Reload your bashrc: source ~/.bashrc"
echo ""

print_success "Setup complete! 🎉"
