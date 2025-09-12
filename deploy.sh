#!/bin/bash

echo "🚀 Optics Sonata Deployment Script"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Extract if tar.gz exists
if [ -f "optics-sonata-complete.tar.gz" ]; then
    echo "📦 Extracting package..."
    tar -xzf optics-sonata-complete.tar.gz
fi

# Navigate to project directory
cd optics-sonata-new

echo "📥 Installing dependencies..."
if command -v bun &> /dev/null; then
    echo "🟡 Using Bun for faster installation..."
    bun install
else
    npm install
fi

echo "🔧 Building project..."
if command -v bun &> /dev/null; then
    bun run build
else
    npm run build
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development server:"
echo "  cd optics-sonata-new"
if command -v bun &> /dev/null; then
    echo "  bun dev"
else
    echo "  npm run dev"
fi
echo ""
echo "To start production server:"
if command -v bun &> /dev/null; then
    echo "  bun start"
else
    echo "  npm start"
fi
echo ""
echo "🌐 The website will be available at: http://localhost:3000"
echo ""
