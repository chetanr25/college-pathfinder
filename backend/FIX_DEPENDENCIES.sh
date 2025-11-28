#!/bin/bash

echo "🔧 Fixing Python dependencies..."

# Clear pip cache
python3 -m pip cache purge

# Upgrade pip
python3 -m pip install --upgrade pip

# Install requirements
python3 -m pip install -r requirements.txt

echo "✅ Dependencies installed successfully!"
