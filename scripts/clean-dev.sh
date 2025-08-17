#!/bin/bash

# SmartAgri Development Cache Cleaner
# This script helps fix common Next.js chunk loading errors

echo "🧹 Cleaning SmartAgri development caches..."

# Remove Next.js build cache
echo "Removing .next directory..."
rm -rf .next

# Remove node modules cache
echo "Removing node_modules cache..."
rm -rf node_modules/.cache

# Remove TypeScript build info
echo "Removing TypeScript build cache..."
rm -f tsconfig.tsbuildinfo

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

echo "✅ Cache cleaning complete!"
echo ""
echo "🚀 Starting development server..."
npm run dev
