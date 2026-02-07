# 🏎️ Circuit Server & Whispers Setup

## Quick Start (5 minutes)

### 1. Create Supabase Account
- Go to [supabase.com](https://supabase.com)
- Sign up (free)
- Create a new project
- Wait ~2 minutes for setup

### 2. Set Up Database
1. In Supabase dashboard → **SQL Editor**
2. Click **New Query**
3. Copy ALL content from `server/schema.sql`
4. Click **Run**

### 3. Get Your Credentials
1. In Supabase → **Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string)

### 4. Configure Server
Edit `server/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=3001
CORS_ORIGIN=http://localhost:5173
ADMIN_SECRET=change-this-secret
```

### 5. Start Server
```bash
cd server
npm install
npm run dev
```

You should see:
```
🚀 Kawaki Studios Server running on port 3001
✅ Server ready!
```

### 6. Add Test Whispers
In a new terminal:
```bash
cd server
npm run add-whisper
```

This adds 3 test whispers to your world! 🔥

### 7. Start Your App
In the main project folder:
```bash
npm run dev
```

Open http://localhost:5173 and look for the flame whispers in the 3D world!

---

## Features Now Working

✅ **Whispers** - Leave messages in the 3D world (press T key)
✅ **Circuit Leaderboard** - Race times with daily reset
✅ **Contact Form** - Visitor messages stored in database
✅ **Cookie Counter** - Global visitor counter

---

## How to Leave a Whisper

1. Walk around in the 3D world
2. Press **T** key
3. Type your message
4. Select your country flag (optional)
5. Submit!

Your whisper will appear as a flame at your location 🔥

---

## Deployment to Production

### For Vercel (Frontend)
Already configured with `vercel.json` ✅

### For Server (Backend)
Deploy to:
- **Railway** (recommended, free tier)
- **Render** (free tier)
- **Fly.io** (free tier)

Update your production `.env`:
```env
VITE_SERVER_URL=wss://your-server.railway.app
```

---

## Troubleshooting

**Server won't start?**
- Check `.env` has valid Supabase credentials
- Make sure you're in the `server` folder
- Run `npm install` again

**Whispers not showing?**
- Check server is running (http://localhost:3001 should work)
- Check browser console for errors
- Verify `VITE_SERVER_URL=ws://localhost:3001` in main `.env`
- Restart Vite dev server

**Can't add whispers?**
- Make sure you ran the `schema.sql` in Supabase
- Check Supabase credentials are correct
- Look at server console for error messages

---

## Need Help?

Check `server/SETUP.md` for detailed instructions!
