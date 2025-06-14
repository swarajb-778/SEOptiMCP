#!/bin/bash

echo "🚀 Setting up AI-Driven SEO Analysis Platform..."

# Create frontend .env file
if [ ! -f .env ]; then
    echo "📝 Creating frontend .env file..."
    cp env.example .env
    echo "✅ Frontend .env created from template"
else
    echo "⚠️  Frontend .env already exists, skipping..."
fi

# Create backend .env file
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cp backend/env.example backend/.env
    echo "✅ Backend .env created from template"
else
    echo "⚠️  Backend .env already exists, skipping..."
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p backend/logs

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env with your Firebase configuration"
echo "2. Edit backend/.env with your API keys"
echo "3. Run 'npm run dev:frontend' to start the frontend"
echo "4. Run 'npm run dev:backend' to start the backend"
echo ""
echo "📖 See SETUP.md for detailed configuration instructions" 