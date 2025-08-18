#!/bin/bash

# SmartAgri Development Cache Cleaner
# Enhanced script to fix AbortError and other Next.js issues

echo "🧹 Cleaning SmartAgri development caches..."

# Stop any running Next.js processes
echo "Stopping any running Next.js processes..."
pkill -f "next dev" 2>/dev/null || true

# Remove Next.js build cache
echo "Removing .next directory..."
rm -rf .next

# Remove node modules cache
echo "Removing node_modules cache..."
rm -rf node_modules/.cache

# Remove TypeScript build info
echo "Removing TypeScript build cache..."
rm -f tsconfig.tsbuildinfo

# Remove Next.js specific caches
echo "Removing Next.js font cache..."
rm -rf .next/cache

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Clear any temporary files
echo "Clearing temporary files..."
rm -rf /tmp/.next-* 2>/dev/null || true

echo "✅ Cache cleaning complete!"
echo ""
echo "🚀 Starting development server..."
npm run dev