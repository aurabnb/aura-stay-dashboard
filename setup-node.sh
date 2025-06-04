#!/bin/bash

echo "🔧 AURA Dashboard Node.js Setup"
echo "================================"

# Load nvm if it exists
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Check if nvm is now available
if ! command -v nvm &> /dev/null; then
    echo "❌ NVM not found. Installing via package manager or manual install:"
    echo ""
    echo "📋 Option 1 - Install NVM:"
    echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash"
    echo "   source ~/.bashrc (or restart terminal)"
    echo ""
    echo "📋 Option 2 - Use Homebrew (if on macOS):"
    echo "   brew install nvm"
    echo ""
    echo "📋 Option 3 - Manual Node.js 20.18.0 install:"
    echo "   https://nodejs.org/en/download/"
    echo ""
    echo "⚠️  After installing, restart your terminal and run this script again."
    exit 1
fi

# Check current Node.js version
CURRENT_NODE=$(node -v 2>/dev/null || echo "none")
REQUIRED_NODE="v20.18.0"

echo "📋 Current Node.js version: $CURRENT_NODE"
echo "📋 Required Node.js version: $REQUIRED_NODE"

# Use the correct Node.js version
if [[ "$CURRENT_NODE" == *"v20"* ]]; then
    echo "✅ Node.js 20.x is already active"
else
    echo "🔄 Switching to Node.js 20.18.0..."
    
    # Install and use Node.js 20.18.0
    nvm install 20.18.0
    nvm use 20.18.0
    nvm alias default 20.18.0
    
    echo "✅ Node.js setup complete!"
fi

# Verify versions
echo ""
echo "📊 Final versions:"
echo "   Node.js: $(node -v)"
echo "   NPM: $(npm -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🎉 Setup complete! You can now run:"
echo "   npm run dev    # Start development server"
echo "   npm run build  # Build for production" 