#!/bin/bash

# Database setup script for College Pathfinder

echo "Setting up PostgreSQL database..."

# Create tables
sudo -u postgres psql -d collegefinder << 'EOF'
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    google_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Chat',
    preview TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);

-- Show tables
\dt
EOF

echo "Database setup complete!"

# Update .env file
echo "Updating .env file..."
if ! grep -q "POSTGRES_URL" .env; then
    echo "POSTGRES_URL=postgresql+asyncpg://postgres:postgres@172.31.25.114:5432/collegefinder" >> .env
    echo "Added POSTGRES_URL to .env"
else
    sed -i 's|POSTGRES_URL=.*|POSTGRES_URL=postgresql+asyncpg://postgres:postgres@172.31.25.114:5432/collegefinder|' .env
    echo "Updated POSTGRES_URL in .env"
fi

echo "Setup complete! Please restart the backend container."