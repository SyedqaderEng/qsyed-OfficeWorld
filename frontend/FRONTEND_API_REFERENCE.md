# Frontend API Reference
**Qsyed Web Services - Complete API Endpoint Guide**

Base URL: `http://localhost:3000/api`

---

## 📤 File Upload Endpoints

### 1. Upload Single File
```http
POST /api/upload/single
Content-Type: multipart/form-data

Body (form-data):
  file: <file>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "abc123-def456-ghi789",
    "filename": "document.pdf",
    "size": 1024000,
    "mimetype": "application/pdf"
  }
}
```

### 2. Upload Multiple Files
```http
POST /api/upload/multiple
Content-Type: multipart/form-data

Body (form-data):
  files: <file1>
  files: <file2>
  files: <file3>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "fileId": "file-id-1",
        "filename": "doc1.pdf",
        "size": 1024000,
        "mimetype": "application/pdf"
      },
      {
        "fileId": "file-id-2",
        "filename": "doc2.pdf",
        "size": 2048000,
        "mimetype": "application/pdf"
      }
    ]
  }
}
```

---

## 🔍 Preview & Metadata Endpoints

### 3. Get PDF Information
```http
GET /api/preview/pdf/{fileId}/info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pageCount": 10,
    "title": "Sample Document",
    "author": "John Doe",
    "subject": "Business Report",
    "creator": "Microsoft Word",
    "producer": "Adobe PDF Library",
    "creationDate": "2024-01-15T10:30:00Z",
    "modificationDate": "2024-01-15T14:20:00Z",
    "pages": [
      {
        "pageNumber": 1,
        "width": 612,
        "height": 792,
        "rotation": 0
      },
      {
        "pageNumber": 2,
        "width": 612,
        "height": 792,
        "rotation": 0
      }
    ]
  }
}
```

### 4. Get PDF Page as Image
```http
GET /api/preview/pdf/{fileId}/page/{pageNum}
```

**Note:** Currently returns placeholder. Will be implemented with pdf-to-image conversion.

### 5. Get PDF Thumbnails
```http
GET /api/preview/pdf/{fileId}/thumbnails
```

**Note:** Will return array of thumbnail images for all pages.

### 6. Get Image Information
```http
GET /api/preview/image/{fileId}/info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "width": 1920,
    "height": 1080,
    "format": "jpeg",
    "space": "srgb",
    "channels": 3,
    "depth": "uchar",
    "density": 72,
    "hasAlpha": false,
    "orientation": 1
  }
}
```

### 7. Get Image Preview (Resized)
```http
GET /api/preview/image/{fileId}/preview?width=800&height=600
```

**Query Parameters:**
- `width` (optional): Max width in pixels (default: 800)
- `height` (optional): Max height in pixels (default: 600)

**Response:** Binary image data (JPEG)

### 8. Get Document Info (Word, Excel)
```http
GET /api/preview/document/{fileId}/info
```

**Note:** To be implemented.

### 9. Get Video Information
```http
GET /api/preview/video/{fileId}/info
```

**Note:** Will use FFmpeg to extract metadata.

### 10. Get Audio Information
```http
GET /api/preview/audio/{fileId}/info
```

---

## ⚙️ Tool Processing Endpoints

### 11. Get All Available Tools
```http
GET /api/tools
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "category": "PDF",
        "count": 35,
        "tools": [
          {
            "id": "pdf-merge",
            "name": "Merge PDFs",
            "description": "Combine multiple PDF files into one",
            "inputs": {
              "files": "multiple",
              "settings": {
                "order": "optional"
              }
            },
            "status": "implemented"
          },
          {
            "id": "pdf-split",
            "name": "Split PDF",
            "description": "Split PDF into multiple files",
            "inputs": {
              "files": "single",
              "settings": {
                "mode": "pages|individual|range",
                "pagesPerFile": "number",
                "pageRanges": "array"
              }
            },
            "status": "implemented"
          }
        ]
      }
    ]
  }
}
```

### 12. Get Tools by Category
```http
GET /api/tools/category/{categoryName}
```

**Example:**
```http
GET /api/tools/category/pdf
```

### 13. Process a Tool (Create Job)
```http
POST /api/tools/{toolId}/process
Content-Type: application/json

Body:
{
  "fileIds": ["file-id-1", "file-id-2"],
  "settings": {
    "mode": "pages",
    "pagesPerFile": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "job-abc123-def456",
    "status": "pending",
    "toolId": "pdf-split",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 📊 Job Status & Management Endpoints

### 14. Get Job Status
```http
GET /api/jobs/{jobId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "job-abc123-def456",
    "status": "processing",
    "progress": 65,
    "currentStep": "Merging file 3/5...",
    "toolId": "pdf-merge",
    "fileIds": ["file-id-1", "file-id-2"],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:31:30Z"
  }
}
```

**Status Values:**
- `pending` - Job queued, not started
- `processing` - Currently being processed
- `completed` - Successfully completed
- `failed` - Failed with error

### 15. Get All User Jobs
```http
GET /api/jobs
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "jobId": "job-1",
        "status": "completed",
        "toolId": "pdf-merge",
        "progress": 100,
        "createdAt": "2024-01-15T10:00:00Z"
      },
      {
        "jobId": "job-2",
        "status": "processing",
        "toolId": "pdf-split",
        "progress": 45,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### 16. Cancel a Job
```http
DELETE /api/jobs/{jobId}
```

**Response:**
```json
{
  "success": true,
  "message": "Job cancelled successfully"
}
```

---

## 📥 Download Endpoints

### 17. Download Processed File
```http
GET /api/download/{jobId}
```

**Response:** Binary file download with appropriate Content-Type and Content-Disposition headers.

**Headers in Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="merged-output.pdf"
```

### 18. Get Download Info
```http
GET /api/download/{jobId}/info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "merged-output.pdf",
    "size": 3145728,
    "mimetype": "application/pdf",
    "createdAt": "2024-01-15T10:35:00Z",
    "expiresAt": "2024-01-16T10:35:00Z"
  }
}
```

---

## 🏥 Health & System Endpoints

### 19. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 3600,
    "redis": "connected",
    "worker": "active",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 20. System Information
```http
GET /
```

**Response:**
```json
{
  "name": "Qsyed Web Services API",
  "version": "1.0.0",
  "description": "File processing platform with 192 tools",
  "categories": [
    "PDF (35 tools)",
    "Word (25 tools)",
    "Excel/CSV (30 tools)",
    "Image (30 tools)",
    "Video (20 tools)",
    "Audio (15 tools)",
    "Archive (12 tools)",
    "Utility (25 tools)"
  ]
}
```

---

## 🔄 Common Workflows

### Workflow 1: Upload → Preview → Process → Download

```javascript
// 1. Upload file
const uploadResponse = await fetch('http://localhost:3000/api/upload/single', {
  method: 'POST',
  body: formData // contains file
});
const { fileId } = uploadResponse.data;

// 2. Get PDF info (preview)
const infoResponse = await fetch(`http://localhost:3000/api/preview/pdf/${fileId}/info`);
const pdfInfo = infoResponse.data;
console.log(`PDF has ${pdfInfo.pageCount} pages`);

// 3. Process the file
const processResponse = await fetch('http://localhost:3000/api/tools/pdf-split/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileIds: [fileId],
    settings: {
      mode: 'pages',
      pagesPerFile: 5
    }
  })
});
const { jobId } = processResponse.data;

// 4. Poll for job status
const pollJobStatus = setInterval(async () => {
  const statusResponse = await fetch(`http://localhost:3000/api/jobs/${jobId}`);
  const job = statusResponse.data;

  console.log(`Progress: ${job.progress}% - ${job.currentStep}`);

  if (job.status === 'completed') {
    clearInterval(pollJobStatus);
    // 5. Download result
    window.location.href = `http://localhost:3000/api/download/${jobId}`;
  }

  if (job.status === 'failed') {
    clearInterval(pollJobStatus);
    console.error('Job failed:', job.error);
  }
}, 2000); // Poll every 2 seconds
```

### Workflow 2: Merge Multiple PDFs

```javascript
// 1. Upload multiple files
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
formData.append('files', file3);

const uploadResponse = await fetch('http://localhost:3000/api/upload/multiple', {
  method: 'POST',
  body: formData
});

const fileIds = uploadResponse.data.files.map(f => f.fileId);

// 2. Start merge process
const processResponse = await fetch('http://localhost:3000/api/tools/pdf-merge/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileIds: fileIds,
    settings: {}
  })
});

const { jobId } = processResponse.data;

// 3. Monitor and download (same as Workflow 1)
```

### Workflow 3: Image Preview and Processing

```javascript
// 1. Upload image
const uploadResponse = await fetch('http://localhost:3000/api/upload/single', {
  method: 'POST',
  body: formData
});
const { fileId } = uploadResponse.data;

// 2. Get image info
const infoResponse = await fetch(`http://localhost:3000/api/preview/image/${fileId}/info`);
const imageInfo = infoResponse.data;

// 3. Get preview (resized for UI)
const previewUrl = `http://localhost:3000/api/preview/image/${fileId}/preview?width=400&height=300`;
document.getElementById('preview').src = previewUrl;

// 4. Process image (e.g., resize, compress, convert)
// (to be implemented based on specific tool)
```

---

## 📋 Tool-Specific Settings

### PDF Split Settings
```json
{
  "mode": "pages",           // "pages" | "individual" | "range"
  "pagesPerFile": 5,         // For mode: "pages"
  "pageRanges": ["1-3", "4-7", "8-10"]  // For mode: "range"
}
```

### PDF Rotate Settings
```json
{
  "angle": 90,               // 90, 180, 270, -90
  "pages": "all"             // "all" | "1,3,5" | "1-5"
}
```

### PDF Watermark Settings
```json
{
  "text": "CONFIDENTIAL",
  "opacity": 50,             // 0-100
  "rotation": 45,            // degrees
  "fontSize": 48
}
```

### PDF Page Numbers Settings
```json
{
  "format": "Page {n} of {total}",
  "position": "bottom-center",  // top/bottom + left/center/right
  "fontSize": 12,
  "startNumber": 1
}
```

### PDF Remove Pages Settings
```json
{
  "pages": "1,3,5"           // "1,3,5" | "1-5" | "1-3,7-9"
}
```

### PDF Reorder Settings
```json
{
  "order": "3,1,2,4"         // New page order (1-indexed)
}
```

### PDF Metadata Settings
```json
{
  "title": "New Document Title",
  "author": "John Doe",
  "subject": "Business Report",
  "keywords": "business,report,2024",
  "creator": "Company Name",
  "producer": "PDF Library"
}
```

---

## ⚠️ Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid file format. Expected PDF.",
    "details": {
      "field": "file",
      "received": "image/jpeg"
    }
  }
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found (file or job not found)
- `413` - Payload Too Large (file size exceeded)
- `500` - Internal Server Error

---

## 🔐 CORS Configuration

**Allowed Origins (Development):**
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173`
- `http://localhost:5174`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`

**Frontend Fetch Configuration:**
```javascript
fetch('http://localhost:3000/api/...', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // If using cookies/sessions
  body: JSON.stringify(data)
})
```

---

## 📝 Notes for Frontend Developers

1. **File Upload**: Always use `FormData` for file uploads
2. **Job Polling**: Poll job status every 2-3 seconds for progress updates
3. **File Expiry**: Downloaded files expire after 24 hours
4. **Max File Size**: 100MB per file (configurable)
5. **Progress Updates**: Use `progress` and `currentStep` fields for UI feedback
6. **Error Handling**: Always check `success` field in response
7. **Preview Before Process**: Use preview endpoints to show file info before processing

---

## 🚀 Quick Start Example (React)

```javascript
import React, { useState } from 'react';

function PdfSplitter() {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleUpload = async (e) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    const res = await fetch('http://localhost:3000/api/upload/single', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    setFile(data.data);
  };

  const handleProcess = async () => {
    const res = await fetch('http://localhost:3000/api/tools/pdf-split/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileIds: [file.fileId],
        settings: { mode: 'individual' }
      })
    });
    const data = await res.json();
    setJobId(data.data.jobId);
    pollStatus(data.data.jobId);
  };

  const pollStatus = (id) => {
    const interval = setInterval(async () => {
      const res = await fetch(`http://localhost:3000/api/jobs/${id}`);
      const data = await res.json();

      setProgress(data.data.progress);
      setStatus(data.data.currentStep);

      if (data.data.status === 'completed') {
        clearInterval(interval);
        window.location.href = `http://localhost:3000/api/download/${id}`;
      }
    }, 2000);
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} accept=".pdf" />
      {file && <button onClick={handleProcess}>Split PDF</button>}
      {progress > 0 && (
        <div>
          <progress value={progress} max="100">{progress}%</progress>
          <p>{status}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 📌 Currently Implemented Tools

✅ **PDF Tools (9/35):**
- pdf-merge
- pdf-split
- pdf-compress
- pdf-rotate
- pdf-watermark
- pdf-page-numbers
- pdf-remove-pages
- pdf-reorder
- pdf-metadata

⚠️ **Other categories**: Placeholders - will copy file without processing until implemented.

---

For questions or issues, check the API response errors or backend logs.
