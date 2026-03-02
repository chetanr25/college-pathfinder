#!/usr/bin/env python3
"""
Script to create Supabase tables for chat sessions
Run this once to set up the database schema.
"""

import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

# SQL statements to create tables
CREATE_TABLES_SQL = """
-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Chat',
    preview TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
"""

RLS_POLICIES_SQL = """
-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON chat_sessions;
CREATE POLICY "Users can view own sessions" ON chat_sessions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own sessions" ON chat_sessions;
CREATE POLICY "Users can create own sessions" ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON chat_sessions;
CREATE POLICY "Users can update own sessions" ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON chat_sessions;
CREATE POLICY "Users can delete own sessions" ON chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
DROP POLICY IF EXISTS "Users can view messages from own sessions" ON chat_messages;
CREATE POLICY "Users can view messages from own sessions" ON chat_messages FOR SELECT USING (session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert messages to own sessions" ON chat_messages;
CREATE POLICY "Users can insert messages to own sessions" ON chat_messages FOR INSERT WITH CHECK (session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete messages from own sessions" ON chat_messages;
CREATE POLICY "Users can delete messages from own sessions" ON chat_messages FOR DELETE USING (session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid()));
"""


def main():
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
        print("\nPlease add these to your backend/.env file:")
        print("SUPABASE_URL=https://your-project.supabase.co")
        print("SUPABASE_SERVICE_KEY=your-service-key")
        return

    print(f"🔌 Connecting to Supabase: {supabase_url}")

    try:
        supabase = create_client(supabase_url, supabase_key)
        print("✅ Connected to Supabase")
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        return

    # The Supabase Python client doesn't support raw SQL execution directly.
    # We need to use the database URL directly or use the SQL editor.

    print("\n" + "=" * 60)
    print("⚠️  IMPORTANT: Run this SQL in Supabase SQL Editor")
    print("=" * 60)
    print("\nGo to: https://supabase.com/dashboard")
    print("Navigate to: Your Project → SQL Editor → New Query")
    print("\nCopy and paste this SQL:\n")
    print("-" * 60)
    print(CREATE_TABLES_SQL)
    print("-" * 60)
    print("\nThen run this SQL for RLS policies:\n")
    print("-" * 60)
    print(RLS_POLICIES_SQL)
    print("-" * 60)

    # Try to check if tables exist
    print("\n🔍 Checking if tables exist...")
    try:
        supabase.table("chat_sessions").select("id").limit(1).execute()
        print("✅ chat_sessions table exists!")
    except Exception as e:
        if "PGRST205" in str(e) or "not found" in str(e).lower():
            print(
                "❌ chat_sessions table does NOT exist - please create it using the SQL above"
            )
        else:
            print(f"⚠️  Could not check table: {e}")

    try:
        supabase.table("chat_messages").select("id").limit(1).execute()
        print("✅ chat_messages table exists!")
    except Exception as e:
        if "PGRST205" in str(e) or "not found" in str(e).lower():
            print(
                "❌ chat_messages table does NOT exist - please create it using the SQL above"
            )
        else:
            print(f"⚠️  Could not check table: {e}")


if __name__ == "__main__":
    main()
