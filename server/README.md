# Kawaki Studios Backend Server

A Node.js backend server for the Kawaki Studios portfolio, supporting:
- 🔥 **Whispers** - Visitor messages displayed in the 3D world
- 🏎️ **Circuit Leaderboard** - Race times with daily reset
- 📬 **Contact Form** - Store contact submissions in Supabase
- 🍪 **Cookie Counter** - Global visitor counter

## Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Set Up Supabase

1. Create a [Supabase](https://supabase.com) project
2. Run the SQL in `schema.sql` to create tables
3. Copy `env.example` to `.env` and add your credentials:

```bash
cp env.example .env
```

### 3. Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 4. Connect the Frontend

In your portfolio `.env`:
```
VITE_SERVER_URL=ws://localhost:3001
```

---

## API Endpoints

### REST API (Contact Form)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/contacts` | Get all contacts (requires admin key) |

**POST /api/contact**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "Hello, I'd like to discuss a project..."
}
```

### WebSocket Messages

| Type | Direction | Description |
|------|-----------|-------------|
| `init` | Server→Client | Initial data on connect |
| `whispersInsert` | Both | Add/update whisper |
| `circuitInsert` | Client→Server | Submit race time |
| `circuitUpdate` | Server→Client | Updated leaderboard |

---

## Deployment

### Railway / Render / Fly.io

1. Push the `server` folder to a Git repo
2. Set environment variables in the dashboard
3. Deploy!

### Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon key |
| `PORT` | Server port (default: 3001) |
| `CORS_ORIGIN` | Allowed origin for CORS |
| `ADMIN_SECRET` | Secret for admin endpoints |
