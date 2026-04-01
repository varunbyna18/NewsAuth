#!/bin/bash

# Azure App Service Linux Node.js startup script

# Install production dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing production dependencies..."
  npm ci --production
fi

# Start the Node.js server
echo "Starting Node.js server..."
npm start
