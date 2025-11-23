# Frontend Logging Guide

## Overview

The frontend now has comprehensive logging that tracks **every API request, response, and user action**. This makes debugging much easier!

## How to View Logs

1. Open your browser (Chrome, Firefox, Edge)
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. All logs will appear here

## What You'll See

### On Page Load

```
🔧 API Client Configuration:
   Base URL: http://localhost:3000/api
   Timeout: 30000ms
---

🔐 Auth Provider Initializing...
   ℹ️  No stored user found - user needs to login
---
```

### When Logging In

```
🔑 Login Attempt:
   Email: test@example.com
   Password: ***
   ✅ Login successful!
   User: { id: '1', email: 'test@example.com', plan: 'Free', ... }
   Token generated: mock-token-1732364123456
   💾 Saved to localStorage
---
```

### When Making an API Request

```
🚀 API REQUEST: 2025-11-23T10:30:45.123Z
   Method: POST
   URL: http://localhost:3000/api/upload
   Headers: { Content-Type: 'multipart/form-data', Authorization: '***Bearer Token***' }
   ✅ Auth token attached
---
```

### On Successful Response

```
✅ API RESPONSE SUCCESS: 2025-11-23T10:30:46.456Z
   Status: 200 OK
   URL: /upload
   Data: { success: true, data: { fileId: 'abc123', ... } }
---
```

### On Network Error (CORS Issue)

```
❌ API REQUEST FAILED: 2025-11-23T10:30:47.789Z
   URL: /upload
   Method: POST
   Error Type: NETWORK ERROR
   Message: Network Error
   Code: ERR_NETWORK

   🔍 Debugging Info:
   ├─ Base URL: http://localhost:3000/api
   ├─ Full URL: http://localhost:3000/api/upload
   ├─ Timeout: 30000ms
   └─ Error Code: ERR_NETWORK

   ⚠️  POSSIBLE CAUSES:
   1. Backend server is not running
   2. CORS not enabled on backend
   3. Firewall blocking connection
   4. Wrong backend URL/port
   5. Network connectivity issue

   💡 SOLUTION:
   • Verify backend is running: http://localhost:3000
   • Add CORS to backend (see TROUBLESHOOTING.md)
   • Check browser console for more details
---
```

### When Uploading a File

```
📤 Upload File:
   Name: document.pdf
   Size: 2.45 MB
   Type: application/pdf
   Uploading to: /upload

🚀 API REQUEST: 2025-11-23T10:31:00.000Z
   Method: POST
   URL: http://localhost:3000/api/upload
   ...

✅ API RESPONSE SUCCESS: 2025-11-23T10:31:05.000Z
   ...

   ✅ Upload complete!
   File ID: abc123
---
```

### When Processing a Tool

```
🔧 Process Tool:
   Tool ID: pdf-compress
   File IDs: abc123
   Settings: { quality: 'medium' }
   User ID: None

🚀 API REQUEST: 2025-11-23T10:32:00.000Z
   Method: POST
   URL: http://localhost:3000/api/tools/pdf-compress
   Data: { fileIds: 'abc123', settings: { quality: 'medium' } }
   ...

✅ API RESPONSE SUCCESS: 2025-11-23T10:32:01.000Z
   ...

   ✅ Job created!
   Job ID: job-uuid-123
---
```

### When Polling Job Status

```
⏳ Polling Job Status:
   Job ID: job-uuid-123
   Interval: 2000ms
   📊 Poll #1 - Checking status...

🚀 API REQUEST: 2025-11-23T10:32:03.000Z
   Method: GET
   URL: http://localhost:3000/api/jobs/job-uuid-123
   ...

✅ API RESPONSE SUCCESS: 2025-11-23T10:32:03.500Z
   ...

   Status: processing (50%)
   Step: Compressing PDF...
   ⏳ Still processing... checking again in 2000ms

   📊 Poll #2 - Checking status...
   ...

   Status: completed (100%)
   Step: Completed
   ✅ Job completed successfully!
   Output File ID: output-abc123
   Download URL: http://localhost:3000/api/download/output-abc123
---
```

## Common Error Scenarios

### 1. Backend Not Running

```
❌ API REQUEST FAILED
   Error Type: NETWORK ERROR
   Code: ERR_NETWORK
   Message: Network Error

   ⚠️  Backend server is not running
```

**Solution:** Start your backend with `npm run dev` in the backend directory

### 2. CORS Not Enabled

```
❌ API REQUEST FAILED
   Error Type: NETWORK ERROR
   Code: ERR_NETWORK

   ⚠️  CORS not enabled on backend
```

**Solution:** Add CORS to your backend (see TROUBLESHOOTING.md)

### 3. Wrong URL/Port

```
🔧 API Client Configuration:
   Base URL: http://localhost:3000/api  ← Check this!
```

**Solution:** Make sure this matches your backend URL

### 4. Authentication Failed

```
❌ API REQUEST FAILED
   Error Type: SERVER ERROR
   Status: 401 Unauthorized
   🔒 UNAUTHORIZED - Clearing auth and redirecting to login
```

**Solution:** Login again - your token may have expired

### 5. Endpoint Not Found

```
❌ API REQUEST FAILED
   Error Type: SERVER ERROR
   Status: 404 Not Found
   ⚠️  Endpoint not found - Check API documentation
```

**Solution:** Check if the endpoint exists on your backend

## Filtering Logs

In the browser console, you can filter logs:

- `🚀` - API Requests
- `✅` - Successful Responses
- `❌` - Errors
- `📤` - File Uploads
- `🔧` - Tool Processing
- `⏳` - Job Polling
- `🔑` - Authentication
- `🔐` - Auth State

Type these emojis in the console filter box to see only specific logs!

## Production Builds

These detailed logs are helpful for development but may be too verbose for production.

To disable verbose logging in production, you can:

1. Check `NODE_ENV` and only log in development
2. Use a logging library with log levels
3. Add a build flag to strip console.log calls

For now, the logging helps you debug the CORS issue!

## Next Steps

1. **Start backend**: `npm run dev` (in backend directory)
2. **Start frontend**: `npm run dev` (in frontend directory)
3. **Open browser**: http://localhost:3001
4. **Open console**: Press F12
5. **Try to login or upload**: Watch the logs!

The logs will tell you **exactly** where the request is failing and why.

---

## Example: Full Request Flow

Here's what you should see for a complete file processing flow:

```
1. User logs in:
   🔑 Login Attempt
   ✅ Login successful

2. User uploads file:
   📤 Upload File: document.pdf (2.45 MB)
   🚀 API REQUEST: POST /upload
   ✅ API RESPONSE SUCCESS
   ✅ Upload complete! File ID: abc123

3. User processes file:
   🔧 Process Tool: pdf-compress
   🚀 API REQUEST: POST /tools/pdf-compress
   ✅ API RESPONSE SUCCESS
   ✅ Job created! Job ID: job-123

4. System polls for completion:
   ⏳ Polling Job Status: job-123
   📊 Poll #1 - Status: processing (25%)
   📊 Poll #2 - Status: processing (50%)
   📊 Poll #3 - Status: processing (75%)
   📊 Poll #4 - Status: completed (100%)
   ✅ Job completed successfully!
```

If **any step fails**, you'll see a detailed error message with troubleshooting steps!
