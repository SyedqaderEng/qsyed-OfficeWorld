# Quick Start - Frontend Without Backend Authentication

Since your backend doesn't require authentication yet, the frontend is configured to work **without tokens**!

## Setup (One Time)

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env file from example
cp .env.example .env

# The .env file will have:
# VITE_API_URL=http://localhost:3000/api
# VITE_REQUIRE_AUTH=false  ← No authentication required!
```

## Running the App

```bash
# Terminal 1: Start your backend (keep it running)
cd C:\Projects\qsyed-webservices\qsyed-webservices
npm run dev

# You should see:
# 🚀 Server running on port 3000
```

```bash
# Terminal 2: Start frontend
cd frontend
npm run dev

# You should see:
# ➜  Local:   http://localhost:3001/
```

## Testing

1. **Open browser**: http://localhost:3001

2. **Open Developer Console** (F12) → Console tab

3. You should see:
   ```
   🔧 API Client Configuration:
      Base URL: http://localhost:3000/api
      Timeout: 30000ms
   ---

   🔐 Auth Provider Initializing...
      ℹ️  No stored user found - user needs to login
   ---
   ```

4. **Try logging in** (use any email/password):
   - Click "Sign Up"
   - Enter: `test@example.com` / `password123`
   - Click "Sign Up"

5. **Check console logs**:
   ```
   🔑 Login Attempt:
      Email: test@example.com
      ✅ Login successful!
      💾 Saved to localStorage
   ```

6. **Go to Dashboard** - You should see "Free Plan" indicator

7. **Try uploading a file**:
   - Select a tool (e.g., "PDF Compress")
   - Choose a file
   - Click "Process File"

8. **Watch the console**:
   ```
   📤 Upload File:
      Name: document.pdf
      Size: 2.45 MB

   🚀 API REQUEST: POST http://localhost:3000/api/upload
      Method: POST
      URL: http://localhost:3000/api/upload
      ℹ️  Auth disabled (VITE_REQUIRE_AUTH=false)  ← No token!
   ---
   ```

## What If I See "Network Error"?

### Check 1: Is backend running?
```bash
# Visit in browser:
http://localhost:3000/api/health

# Should see:
{ "status": "healthy", "timestamp": "...", "uptime": 3600 }
```

### Check 2: Is CORS enabled?
Your backend needs CORS. Add this to your backend `src/server.ts`:

```typescript
import cors from 'cors';

app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Install CORS:
```bash
npm install cors @types/cors
```

### Check 3: Check browser console
Press F12 → Console tab

You'll see detailed error messages showing exactly what's wrong!

## Common Console Messages

### ✅ Everything Working:
```
🚀 API REQUEST: POST /upload
   ℹ️  Auth disabled (VITE_REQUIRE_AUTH=false)
---
✅ API RESPONSE SUCCESS
   Status: 200 OK
   ✅ Upload complete!
```

### ❌ Backend Not Running:
```
❌ API REQUEST FAILED
   Error Type: NETWORK ERROR
   Code: ERR_NETWORK

   ⚠️  POSSIBLE CAUSES:
   1. Backend server is not running  ← This!
```

**Solution**: Start backend with `npm run dev`

### ❌ CORS Not Enabled:
```
❌ API REQUEST FAILED
   Error Type: NETWORK ERROR

   ⚠️  POSSIBLE CAUSES:
   2. CORS not enabled on backend  ← This!
```

**Solution**: Add CORS to backend (see above)

### ❌ Wrong Port:
```
🔧 API Client Configuration:
   Base URL: http://localhost:3000/api
```

**Solution**: Make sure backend is on port 3000, or update `.env` file:
```env
VITE_API_URL=http://localhost:YOUR_PORT/api
```

## When You Add Authentication Later

When your backend adds authentication, just update `.env`:

```env
# Change from:
VITE_REQUIRE_AUTH=false

# To:
VITE_REQUIRE_AUTH=true
```

Then restart the frontend (`npm run dev`).

The Authorization header will automatically be added to all requests!

## File Structure

```
frontend/
├── .env                 ← Your local config (not in git)
├── .env.example         ← Template for .env
├── src/
│   ├── api/
│   │   └── client.ts    ← Handles auth based on VITE_REQUIRE_AUTH
│   └── ...
└── ...
```

## Summary

✅ **No backend auth needed**
✅ **Just start both servers and it works**
✅ **Console logs show everything**
✅ **Easy to debug with detailed error messages**

---

**Having issues?**
1. Check browser console (F12)
2. See `TROUBLESHOOTING.md`
3. See `LOGGING_GUIDE.md`
