# Troubleshooting: Network Error - Frontend to Backend Connection

## Issue
Getting "Network Error" when frontend tries to connect to backend API.

## Root Cause
CORS (Cross-Origin Resource Sharing) is not enabled on your backend server.

## Solution

### Step 1: Enable CORS on Your Backend

Navigate to your backend directory:
```bash
cd C:\Projects\qsyed-webservices\qsyed-webservices
```

Install CORS package:
```bash
npm install cors
npm install @types/cors --save-dev
```

### Step 2: Update Backend Server Configuration

Find your main server file (likely `src/server.ts` or `src/app.ts`) and add:

```typescript
import express from 'express';
import cors from 'cors';

const app = express();

// IMPORTANT: Add CORS BEFORE other middleware
app.use(cors({
  origin: [
    'http://localhost:3001',  // Frontend dev server
    'http://localhost:3000',  // Backend server
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Then add your other middleware
app.use(express.json());
// ... rest of your middleware
```

### Step 3: Restart Backend Server

After adding CORS, restart your backend:
```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

You should see:
```
🚀 Server running on port 3000
```

### Step 4: Verify Backend is Accessible

Test your backend API directly:
```bash
# Open browser and visit:
http://localhost:3000/api/health

# Or use curl:
curl http://localhost:3000/api/health
```

You should see a response like:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-23T...",
  "uptime": 3600
}
```

### Step 5: Start Frontend

In the frontend directory:
```bash
cd frontend
npm run dev
```

Frontend should now run on `http://localhost:3001` and connect successfully!

---

## Alternative: If You Don't Want to Install CORS Package

Add manual CORS headers in your backend:

```typescript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});
```

---

## Debugging Checklist

### ✅ Backend Running?
```bash
# Check if backend is running
netstat -ano | findstr :3000

# Or visit in browser
http://localhost:3000/api/health
```

### ✅ Frontend Running?
```bash
# Check if frontend is running
# Should see: "Local: http://localhost:3001"
```

### ✅ Check Browser Console
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for error messages
4. You should see helpful debug info from the updated API client

### ✅ Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try to login or load data
4. Check if requests are being made
5. Look for:
   - **Failed** requests (red) = CORS issue
   - **Pending** forever = Backend not running
   - **404** = Wrong endpoint

---

## Expected Console Output (After Fix)

### Backend Console:
```
🚀 Server running on port 3000
📁 Upload directory: C:\Projects\qsyed-webservices\qsyed-webservices\uploads
⚙️  Environment: development
🔧 Worker concurrency: 5
```

### Frontend Console (Browser):
```
Vite ready in X ms
➜  Local:   http://localhost:3001/
```

---

## Test Connection

After applying the fix:

1. Open `http://localhost:3001`
2. Click "Sign Up"
3. Enter any email/password
4. Click "Sign Up"
5. You should be redirected to Dashboard

If it works, you'll see the dashboard with "Free Plan" indicator!

---

## Still Having Issues?

### Check Firewall
Windows Firewall might be blocking:
```bash
# Run as Administrator
netsh advfirewall firewall add rule name="Node 3000" dir=in action=allow protocol=TCP localport=3000
```

### Check Port Conflicts
```bash
# See what's using port 3000
netstat -ano | findstr :3000

# See what's using port 3001
netstat -ano | findstr :3001
```

### Environment Variables
Create `.env` in frontend folder:
```env
VITE_API_URL=http://localhost:3000/api
```

Then restart frontend:
```bash
npm run dev
```

---

## Quick Test Script

Create this file in your backend: `test-cors.js`

```javascript
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/health',
  method: 'GET',
  headers: {
    'Origin': 'http://localhost:3001'
  }
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('CORS Headers:', res.headers['access-control-allow-origin']);

  if (res.headers['access-control-allow-origin']) {
    console.log('✅ CORS is working!');
  } else {
    console.log('❌ CORS not configured');
  }
});

req.on('error', (e) => {
  console.error('❌ Backend not running:', e.message);
});

req.end();
```

Run it:
```bash
node test-cors.js
```

---

## Contact
If none of this works, please share:
1. Backend console output
2. Frontend browser console errors (F12)
3. Network tab screenshot
