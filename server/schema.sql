-- ============================================
-- KAWAKI STUDIOS - SUPABASE SCHEMA
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Whispers table (visitor messages in 3D world)
CREATE TABLE IF NOT EXISTS whispers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    uuid TEXT NOT NULL,
    message TEXT NOT NULL,
    country_code TEXT,
    x REAL NOT NULL,
    y REAL NOT NULL,
    z REAL NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by UUID
CREATE INDEX IF NOT EXISTS idx_whispers_uuid ON whispers(uuid);

-- Circuit leaderboard (race times)
CREATE TABLE IF NOT EXISTS circuit_leaderboard (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    uuid TEXT NOT NULL,
    tag TEXT NOT NULL CHECK (LENGTH(tag) = 3),
    country_code TEXT,
    duration INTEGER NOT NULL,
    checkpoint_timings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster sorting by duration
CREATE INDEX IF NOT EXISTS idx_circuit_duration ON circuit_leaderboard(duration ASC);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stats table (for cookie counter, etc.)
CREATE TABLE IF NOT EXISTS stats (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize cookie counter
INSERT INTO stats (key, value) VALUES ('cookie_count', '0')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (Optional but recommended)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE whispers ENABLE ROW LEVEL SECURITY;
ALTER TABLE circuit_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access to whispers
CREATE POLICY "Whispers are viewable by everyone" ON whispers
    FOR SELECT USING (true);

-- Allow authenticated insert/update on whispers
CREATE POLICY "Anyone can insert whispers" ON whispers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update their own whispers" ON whispers
    FOR UPDATE USING (true);

-- Allow public read access to leaderboard
CREATE POLICY "Leaderboard is viewable by everyone" ON circuit_leaderboard
    FOR SELECT USING (true);

-- Allow anyone to insert scores
CREATE POLICY "Anyone can insert scores" ON circuit_leaderboard
    FOR INSERT WITH CHECK (true);

-- Allow anyone to insert contacts
CREATE POLICY "Anyone can submit contact form" ON contacts
    FOR INSERT WITH CHECK (true);

-- Allow reading stats
CREATE POLICY "Stats are readable by everyone" ON stats
    FOR SELECT USING (true);

-- Allow updating stats
CREATE POLICY "Stats can be updated" ON stats
    FOR UPDATE USING (true);

CREATE POLICY "Stats can be inserted" ON stats
    FOR INSERT WITH CHECK (true);
