# Server Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be ready (takes ~2 minutes)

## Step 2: Set Up Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `schema.sql`
4. Click **Run** to create all tables

## Step 3: Configure Environment Variables

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**
3. Edit `server/.env` and add your credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Install Dependencies & Start Server

```bash
cd server
npm install
npm run dev
```

You should see:
```
🚀 Kawaki Studios Server running on port 3001
   HTTP: http://localhost:3001
   WebSocket: ws://localhost:3001
✅ Server ready!
```

## Step 5: Test the Connection

1. Open your browser to http://localhost:3001
2. You should see: `{"status":"ok","message":"Kawaki Studios Server"}`

## Step 6: Add a Test Whisper

You can manually add a whisper in Supabase:

1. Go to **Table Editor** → **whispers**
2. Click **Insert row**
3. Fill in:
   - `uuid`: any-unique-id-123
   - `message`: Hello from the circuit! 🏎️
   - `country_code`: US
   - `x`: 0
   - `y`: 0
   - `z`: 0

Or use the SQL Editor:

```sql
INSERT INTO whispers (uuid, message, country_code, x, y, z)
VALUES ('test-whisper-1', 'Welcome to the circuit! 🏎️', 'US', 10, 0, 10);
```

## Troubleshooting

### Server won't start
- Make sure you're in the `server` folder
- Check that `.env` has valid Supabase credentials
- Run `npm install` again

### Can't connect from frontend
- Make sure server is running on port 3001
- Check that `VITE_SERVER_URL=ws://localhost:3001` in main `.env`
- Restart the Vite dev server

### Whispers not showing
- Check browser console for errors
- Verify whispers exist in Supabase table
- Make sure `VITE_WHISPERS_COUNT=30` in main `.env`
