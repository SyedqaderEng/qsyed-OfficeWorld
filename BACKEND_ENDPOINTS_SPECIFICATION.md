# Backend API Endpoints Required for PDF to Word Converter

The frontend calls these exact endpoints in this order. Your backend needs to implement all 4 endpoints.

---

## **1. Upload File**

### Endpoint
```
POST /api/upload
```

### Request
```http
POST /api/upload HTTP/1.1
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- file: (binary file data)
```

### Example Request (JavaScript)
```javascript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await axios.post('/api/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': 'Bearer <token>'
  }
});
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "fileId": "a11bc2a2-ce0a-4b2d-af16-b851b3e161d6",
    "originalName": "document.pdf",
    "mimeType": "application/pdf",
    "size": 2458624,
    "uploadedAt": "2025-11-23T21:30:00.000Z"
  }
}
```

### What Frontend Does Next
- Stores `fileId`
- Moves to configuration step
- User selects options (OCR, language, format, etc.)

---

## **2. Start Conversion**

### Endpoint
```
POST /api/process
```

### Request
```http
POST /api/process HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>

{
  "fileId": "a11bc2a2-ce0a-4b2d-af16-b851b3e161d6",
  "tool": "pdf-to-word",
  "options": {
    "outputFormat": "docx",           // "docx" or "doc"
    "ocrEnabled": false,               // boolean
    "ocrLanguage": "eng",              // Optional: "eng", "spa", "fra", "deu", "ita", "por", "ara", "rus", "chi_sim", "jpn", "kor", "hin"
    "preserveLayout": true,            // boolean
    "password": "secret123"            // Optional: PDF password if protected
  }
}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "requestId": "x7y8z9-4b2d-af16-b851b3e161d6"
  },
  "message": "Processing job created successfully"
}
```

### What Frontend Does Next
- Stores `requestId`
- Starts polling `/api/status/{requestId}` every 2 seconds

---

## **3. Poll Status** (Called Every 2 Seconds)

### Endpoint
```
GET /api/status/:requestId
```

### Request
```http
GET /api/status/x7y8z9-4b2d-af16-b851b3e161d6 HTTP/1.1
Authorization: Bearer <token>
```

### Response (200 OK) - While Processing
```json
{
  "success": true,
  "data": {
    "requestId": "x7y8z9-4b2d-af16-b851b3e161d6",
    "state": "converting",              // See states below
    "progress": 70,                     // 0-100
    "message": "Converting to Word format..."
  }
}
```

### Response (200 OK) - When Complete
```json
{
  "success": true,
  "data": {
    "requestId": "x7y8z9-4b2d-af16-b851b3e161d6",
    "state": "done",
    "progress": 100,
    "message": "Conversion complete!",
    "outputFileToken": "f4g5h6-download-token-123456"
  }
}
```

### Response (200 OK) - When Failed
```json
{
  "success": true,
  "data": {
    "requestId": "x7y8z9-4b2d-af16-b851b3e161d6",
    "state": "failed",
    "progress": 45,
    "message": "Conversion failed",
    "error": "PDF is password protected but no password provided"
  }
}
```

### **Processing States** (IMPORTANT!)
The frontend expects these exact state values in this order:

| State        | Description                          | Progress |
|--------------|--------------------------------------|----------|
| `queued`     | Job is queued, waiting to start     | 0-10%    |
| `processing` | Starting to process the PDF          | 10-30%   |
| `ocr`        | Performing OCR text extraction       | 30-50%   |
| `converting` | Converting PDF to Word format        | 50-80%   |
| `finalizing` | Finalizing the Word document         | 80-95%   |
| `done`       | Conversion complete ✅               | 100%     |
| `failed`     | Conversion failed ❌                 | Any      |

### What Frontend Does
- Polls every 2 seconds
- Shows visual state progression indicator
- Updates progress bar
- When `state === "done"`: Stops polling, shows download button
- When `state === "failed"`: Stops polling, shows error with retry button

---

## **4. Download Converted File**

### Endpoint
```
GET /api/download/:fileToken
```

### Request
```http
GET /api/download/f4g5h6-download-token-123456 HTTP/1.1
Authorization: Bearer <token>
```

### Response (200 OK)
```http
HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="converted.docx"

[Binary file data - the actual DOCX file]
```

### What Frontend Does
- Creates blob URL from response
- Triggers browser download
- Shows "Download Started" notification

---

## **Complete Workflow Summary**

```
User selects PDF
   ↓
Frontend validates PDF (magic bytes)
   ↓
POST /api/upload
   ← { fileId: "abc123" }
   ↓
User configures options (OCR, language, format)
   ↓
POST /api/process { fileId, tool, options }
   ← { requestId: "xyz456" }
   ↓
Poll every 2 seconds:
GET /api/status/xyz456
   ← { state: "queued", progress: 0 }
   ← { state: "processing", progress: 20 }
   ← { state: "ocr", progress: 40 }
   ← { state: "converting", progress: 70 }
   ← { state: "finalizing", progress: 90 }
   ← { state: "done", progress: 100, outputFileToken: "token123" }
   ↓
GET /api/download/token123
   ← [DOCX file binary data]
   ↓
Browser downloads file
```

---

## **Error Handling**

### Upload Errors
```json
{
  "success": false,
  "error": "File too large. Maximum size is 200MB"
}
```

Frontend will:
- Show error notification with details
- Offer "Select Different File" button

### Processing Errors
```json
{
  "success": false,
  "error": "Invalid file format or corrupted PDF"
}
```

Frontend will:
- Show error notification
- Offer "Try Again" button
- Automatically retry 2 times with exponential backoff (1s, 2s delays)

### Status Polling Errors
If status endpoint returns 404:
```json
{
  "success": false,
  "error": "Job not found"
}
```

Frontend will:
- Stop polling
- Show error notification

---

## **Implementation Notes for Backend**

### 1. File Upload (`POST /api/upload`)
- Accept multipart/form-data
- Store file temporarily
- Generate unique `fileId` (UUID recommended)
- Return file metadata

### 2. Process Request (`POST /api/process`)
- Validate `fileId` exists
- Validate options
- Create background job
- Generate unique `requestId` (UUID recommended)
- Return immediately (don't wait for conversion)
- Process conversion in background worker/queue

### 3. Status Polling (`GET /api/status/:requestId`)
- Look up job status from database/cache
- Return current state and progress
- Frontend polls every 2 seconds, so this endpoint needs to be fast
- When done, include `outputFileToken`

### 4. Download (`GET /api/download/:fileToken`)
- Validate token
- Stream converted file
- Set proper Content-Type and Content-Disposition headers
- Optionally delete file after download (TTL cleanup)

---

## **Required Backend Technologies**

You'll need:
- **File upload handling**: `multer` (Node.js) or equivalent
- **Background jobs**: Queue system (Bull, BullMQ, RabbitMQ, etc.)
- **PDF to Word conversion**: LibreOffice, Aspose, or similar engine
- **OCR** (if enabled): Tesseract, Google Vision API, or similar
- **File storage**: Local filesystem, S3, or similar
- **Job tracking**: Redis, PostgreSQL, or similar

---

## **Testing Your Backend**

Use these curl commands to test:

```bash
# 1. Upload
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer your-token" \
  -F "file=@test.pdf"

# 2. Process
curl -X POST http://localhost:3000/api/process \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "abc123",
    "tool": "pdf-to-word",
    "options": {
      "outputFormat": "docx",
      "ocrEnabled": false,
      "preserveLayout": true
    }
  }'

# 3. Check Status
curl http://localhost:3000/api/status/xyz456 \
  -H "Authorization: Bearer your-token"

# 4. Download
curl http://localhost:3000/api/download/token123 \
  -H "Authorization: Bearer your-token" \
  --output converted.docx
```

---

## **Base URL Configuration**

The frontend is configured to use:
```
Base URL: http://localhost:3000/api
```

This is set in `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

So your endpoints are:
- `http://localhost:3000/api/upload`
- `http://localhost:3000/api/process`
- `http://localhost:3000/api/status/:requestId`
- `http://localhost:3000/api/download/:fileToken`

---

## **CORS Configuration**

Your backend needs CORS enabled:

```javascript
// Express.js example
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## **Questions?**

If you need clarification on any endpoint, let me know!
