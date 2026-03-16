#!/bin/bash
# Vercel build script

echo "Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps

echo "Building production bundle..."
npm run build

echo "Build complete!"
