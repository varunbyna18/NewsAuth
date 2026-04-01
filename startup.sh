#!/bin/bash
set -e

echo "=========================================="
echo "Starting NewsAuth Frontend"
echo "=========================================="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Install production dependencies
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm ci --production
else
  echo "Dependencies already installed, skipping npm ci"
fi

echo ""
echo "Listing directory contents:"
ls -la

echo ""
echo "Checking dist folder:"
if [ -d "dist" ]; then
  echo "dist folder exists with files:"
  ls -la dist/
else
  echo "ERROR: dist folder not found!"
  exit 1
fi

echo ""
echo "Starting Node.js server on port ${PORT:-8080}..."
npm start
