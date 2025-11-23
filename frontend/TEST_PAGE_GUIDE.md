# 🧪 API Test Page Guide

## What is this?

The Test Page is a **diagnostic tool** built into the frontend to help you test and debug API connections. It shows exactly which endpoints are working and which are failing.

## How to Access

1. **Start your backend** (if not already running):
   ```bash
   cd C:\Projects\qsyed-webservices\qsyed-webservices
   npm run dev
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open the test page**:
   - Click **"🧪 Test API"** in the navigation bar, OR
   - Go directly to: **http://localhost:3001/test**

## Quick Tests

### Test 1: Health Check
**What it does:** Verifies your backend is running and responding

**Click:** "1. Test Health"

**Expected result:**
```json
✅ Health Check - success
{
  "status": "healthy",
  "timestamp": "2025-11-23T...",
  "uptime": 3600
}
```

**If it fails:**
- ❌ Backend is NOT running
- **Solution:** Start backend with `npm run dev`

---

### Test 2: Get Tools
**What it does:** Tests if backend can return list of available tools

**Click:** "2. Test Get Tools"

**Expected result:**
```json
✅ Get Tools - success
Found 192 tools
{
  "success": true,
  "data": [
    { "id": "pdf-split", "name": "PDF Split", ... },
    { "id": "pdf-compress", "name": "PDF Compress", ... },
    ...
  ]
}
```

**If it fails:**
- ❌ `/api/tools` endpoint doesn't exist
- **Solution:** Check if your backend has this endpoint implemented

---

### Test 3: Get Tool (pdf-split)
**What it does:** Tests if backend can return details for a specific tool

**Click:** "3. Test Get Tool (pdf-split)"

**Expected result:**
```json
✅ Get Tool: pdf-split - success
{
  "success": true,
  "data": {
    "id": "pdf-split",
    "name": "PDF Split",
    "category": "pdf",
    "description": "Split PDF into multiple files",
    "acceptedFormats": [".pdf"],
    "multipleFiles": false
  }
}
```

**If it fails:**
- ❌ `/api/tools/pdf-split` endpoint doesn't exist
- **Solution:** Check if your backend has tool detail endpoints

---

## Full Integration Test

This tests the **complete workflow**: Upload → Process → Check Status

**How to use:**
1. Click **"Choose File & Run Test"**
2. Select any file (PDF, image, document, etc.)
3. Watch the test run automatically:
   - ✅ Upload file
   - ✅ Process with pdf-split
   - ✅ Check job status

**Expected flow:**
```
📤 Upload File - success
   File ID: abc123

🔧 Process: pdf-split - success
   Job ID: job-uuid-123

📊 Job Status - success
   Status: processing/completed
```

**Common errors and what they mean:**

### ✅ Upload works, ❌ Process fails

**Error:** Network Error on Process step

**What this means:**
- Upload endpoint exists ✅
- Backend is running ✅
- CORS is working ✅
- **BUT** the process endpoint doesn't exist or is returning an error

**Possible causes:**
1. **Backend doesn't have `/api/tools/pdf-split` endpoint**
   - Check your backend routes
   - Verify endpoint is implemented

2. **Endpoint exists but has a bug**
   - Check backend console/logs
   - Look for error messages when you click "Process"

3. **Request format is wrong**
   - Backend expects different request body format
   - Check backend documentation

**How to verify:**

**Option A: Check backend logs**
When you run the test, watch your backend console. You should see:
```
POST /api/tools/pdf-split
```

If you see errors there, that's your issue!

**Option B: Test endpoint manually**
Open a new terminal and run:
```bash
curl -X POST http://localhost:3000/api/tools/pdf-split \
  -H "Content-Type: application/json" \
  -d '{"fileIds":"test","settings":{}}'
```

What you should see:
- ✅ `{"success":true,"data":{"jobId":"..."}}`
- ❌ `Cannot POST /api/tools/pdf-split` → Endpoint doesn't exist
- ❌ `500 Server Error` → Backend has a bug

---

## Test Specific Endpoints

At the bottom of the page, you can test individual endpoints:

- **GET /api/health** - Basic health check
- **GET /api/tools** - List all tools
- **GET /api/tools/pdf-split** - Get pdf-split details
- **GET /api/tools/pdf-compress** - Get pdf-compress details

Click **"Test"** next to each one to verify it works.

---

## Understanding Results

### ✅ Success (Green)
- Endpoint exists
- Backend responded successfully
- API is working correctly

### ❌ Error (Red)
Click **"View Details"** to see:
- Error message
- Response data from backend
- HTTP status code

Common status codes:
- **404 Not Found** - Endpoint doesn't exist on backend
- **500 Server Error** - Backend has a bug/crash
- **Network Error** - Backend not running or CORS issue

### ⏳ Pending (Yellow)
- Request is in progress
- Wait for it to complete

---

## Debugging Your Issue

Since you said:
> "Upload works but process/split fails"

Here's what to do:

### Step 1: Run Full Integration Test
1. Go to http://localhost:3001/test
2. Click "Choose File & Run Test"
3. Select a PDF file
4. Watch which step fails

### Step 2: Check the Error Details
When the "Process: pdf-split" step fails:
1. Click **"View Details"**
2. Look at the error message
3. Check the response data

### Step 3: Check Backend Console
Switch to your backend terminal window and look for:
- Error messages when you click "Process"
- Stack traces
- 404 or 500 errors

### Step 4: Verify Endpoint Exists
In your backend code, check if you have:
```typescript
// Does this route exist?
router.post('/tools/pdf-split', async (req, res) => {
  // ...
});
```

---

## Common Scenarios

### Scenario 1: Everything fails
**Symptoms:**
- ❌ Health check fails
- ❌ Get tools fails
- ❌ All tests fail

**Solution:**
- Backend is not running
- Start backend: `npm run dev`

---

### Scenario 2: Health works, Tools fail
**Symptoms:**
- ✅ Health check works
- ❌ Get tools fails with 404

**Solution:**
- Backend running but missing `/api/tools` endpoint
- Implement the tools listing endpoint

---

### Scenario 3: Upload works, Process fails
**Symptoms:**
- ✅ Upload file works
- ❌ Process fails with Network Error or 404

**Solution:**
- Backend missing `/api/tools/{toolId}` endpoints
- Implement tool processing endpoints
- Check backend logs for errors

**Verify in backend:**
```typescript
// Make sure you have these routes:
app.post('/api/tools/:toolId', processToolHandler);
// OR
app.post('/api/tools/pdf-split', pdfSplitHandler);
app.post('/api/tools/pdf-compress', pdfCompressHandler);
// etc.
```

---

## Next Steps

After using the test page, you should know:

1. ✅ **Which endpoints work**
2. ❌ **Which endpoints fail**
3. 📋 **Exact error messages**
4. 🔍 **Where to look in your backend code**

---

## Pro Tips

1. **Keep browser console open (F12)**
   - You'll see detailed logs of every request
   - Shows exact URLs being called
   - Shows request/response data

2. **Keep backend console visible**
   - Watch for incoming requests
   - See backend errors immediately
   - Verify which routes are being hit

3. **Test one thing at a time**
   - If upload works, that's confirmed ✅
   - Focus on fixing the failing endpoint

4. **Use the individual endpoint tests**
   - Test each endpoint separately
   - Easier to isolate the problem

---

## Example: Fixing "Process Fails" Issue

**What you see:**
```
✅ Upload File - success
❌ Process: pdf-split - Network Error
```

**Steps to fix:**

1. **Check backend has the endpoint:**
   ```typescript
   // In your backend routes
   app.post('/api/tools/pdf-split', async (req, res) => {
     const { fileIds, settings } = req.body;

     // Create job
     const jobId = await createProcessingJob('pdf-split', fileIds, settings);

     res.json({
       success: true,
       data: { jobId }
     });
   });
   ```

2. **Test the endpoint manually:**
   ```bash
   curl -X POST http://localhost:3000/api/tools/pdf-split \
     -H "Content-Type: application/json" \
     -d '{"fileIds":"test-file-id","settings":{}}'
   ```

3. **If it works:** Frontend issue - check request format
4. **If it fails:** Backend issue - implement the endpoint

---

## Quick Reference

| What you want to test | Which button to click |
|----------------------|---------------------|
| Is backend running? | "1. Test Health" |
| Can I get tools list? | "2. Test Get Tools" |
| Does pdf-split exist? | "3. Test Get Tool (pdf-split)" |
| Full upload + process flow | "Choose File & Run Test" |
| Specific endpoint | Individual "Test" buttons |

---

**The test page shows EXACTLY where your API is failing!**

Use it to diagnose, then fix the specific endpoint that's broken. 🎯
