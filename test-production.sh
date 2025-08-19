#!/bin/bash

# Production Profile Test Script
echo "🚀 Testing SmartAgri Profile Functionality in Production"
echo "=================================================="

# Check if server is running
echo "✅ Checking if production server is running..."
curl -s http://localhost:3000 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Production server is running on http://localhost:3000"
else
    echo "❌ Production server is not running"
    exit 1
fi

# Test profile API endpoint
echo ""
echo "🔍 Testing Profile API endpoint..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/api/profile

# Test profile page
echo ""
echo "🔍 Testing Profile page..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000/profile

# Test other key pages
echo ""
echo "🔍 Testing other key pages..."
echo "Dashboard: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard)"
echo "Chat: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/chat)"
echo "Weather: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/weather)"
echo "Crops: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/crops)"

echo ""
echo "✅ Production testing complete!"
echo "🌐 Visit http://localhost:3000 to test the application"
echo "👤 Profile functionality should now be visible in the navigation bar"
