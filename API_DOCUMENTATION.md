# 📚 API Documentation - Qsyed Web Services

Complete API reference for all 192 file processing tools.

## 🔗 Base URL

```
http://localhost:3000/api
```

## 🔐 Authentication

All requests require an `Authorization` header with a Bearer token:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📤 File Upload Endpoints

### Upload Single File
```http
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: (binary file)

Response:
{
  "success": true,
  "data": {
    "fileId": "abc123",
    "originalName": "document.pdf",
    "mimeType": "application/pdf",
    "size": 1024000,
    "path": "/uploads/abc123.pdf",
    "uploadedAt": "2025-11-23T10:00:00.000Z"
  }
}
```

### Upload Multiple Files
```http
POST /api/upload/multiple
Content-Type: multipart/form-data

Body:
- files[]: (multiple binary files)

Response:
{
  "success": true,
  "data": [
    { "fileId": "abc123", ... },
    { "fileId": "def456", ... }
  ]
}
```

---

## 🛠️ Tool Processing Endpoints

All tool endpoints follow this pattern:

```http
POST /api/tools/{tool-id}
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

Body:
{
  "fileIds": ["abc123"] or "abc123",  // Single file ID or array
  "settings": {
    // Tool-specific settings
  },
  "userId": "user123" // Optional
}

Response:
{
  "success": true,
  "data": {
    "jobId": "job-uuid-here"
  },
  "message": "Processing job created successfully"
}
```

---

## 📄 PDF TOOLS (35 Endpoints)

### 1. PDF Merge
```http
POST /api/tools/pdf-merge
Body: {
  "fileIds": ["file1", "file2", "file3"],
  "settings": {}
}
```

### 2. PDF Split
```http
POST /api/tools/pdf-split
Body: {
  "fileIds": ["file1"],
  "settings": {
    "mode": "pages",  // "pages" | "range" | "individual"
    "pagesPerFile": 5  // For "pages" mode
  }
}
```

### 3. PDF Compress
```http
POST /api/tools/pdf-compress
Body: {
  "fileIds": ["file1"],
  "settings": {
    "quality": "medium"  // "screen" | "ebook" | "printer" | "prepress"
  }
}
```

### 4. PDF to Images
```http
POST /api/tools/pdf-to-images
Body: {
  "fileIds": ["file1"],
  "settings": {
    "format": "png",  // "png" | "jpg" | "webp"
    "dpi": 150
  }
}
```

### 5. PDF to Word
```http
POST /api/tools/pdf-to-word
Body: { "fileIds": ["file1"], "settings": {} }
```

### 6. PDF to Excel
```http
POST /api/tools/pdf-to-excel
Body: { "fileIds": ["file1"], "settings": {} }
```

### 7. PDF to PowerPoint
```http
POST /api/tools/pdf-to-ppt
Body: { "fileIds": ["file1"], "settings": {} }
```

### 8. PDF Watermark
```http
POST /api/tools/pdf-watermark
Body: {
  "fileIds": ["file1"],
  "settings": {
    "text": "CONFIDENTIAL",
    "opacity": 50,  // 0-100
    "position": "center",  // "top-left" | "center" | "bottom-right"
    "rotation": 45
  }
}
```

### 9. PDF Rotate
```http
POST /api/tools/pdf-rotate
Body: {
  "fileIds": ["file1"],
  "settings": {
    "angle": 90,  // 90 | 180 | 270
    "pages": "all"  // "all" | "1,3,5" | "1-5"
  }
}
```

### 10. PDF Page Numbers
```http
POST /api/tools/pdf-page-numbers
Body: {
  "fileIds": ["file1"],
  "settings": {
    "format": "Page {n}",
    "position": "bottom-center"
  }
}
```

### 11. PDF Extract Text
```http
POST /api/tools/pdf-extract-text
Body: { "fileIds": ["file1"], "settings": {} }
```

### 12. PDF Extract Images
```http
POST /api/tools/pdf-extract-images
Body: { "fileIds": ["file1"], "settings": {} }
```

### 13. PDF Remove Pages
```http
POST /api/tools/pdf-remove-pages
Body: {
  "fileIds": ["file1"],
  "settings": {
    "pages": "1,3,5-7"  // Pages to remove
  }
}
```

### 14. PDF Reorder
```http
POST /api/tools/pdf-reorder
Body: {
  "fileIds": ["file1"],
  "settings": {
    "order": "3,1,2,4"  // New page order
  }
}
```

### 15. PDF Password Protect
```http
POST /api/tools/pdf-password-protect
Body: {
  "fileIds": ["file1"],
  "settings": {
    "password": "secure123",
    "permissions": {
      "print": true,
      "copy": false,
      "edit": false
    }
  }
}
```

### 16. PDF Remove Password
```http
POST /api/tools/pdf-remove-password
Body: {
  "fileIds": ["file1"],
  "settings": {
    "password": "current_password"
  }
}
```

### 17. PDF Metadata
```http
POST /api/tools/pdf-metadata
Body: {
  "fileIds": ["file1"],
  "settings": {
    "title": "My Document",
    "author": "John Doe",
    "subject": "Report"
  }
}
```

### 18. PDF OCR
```http
POST /api/tools/pdf-ocr
Body: {
  "fileIds": ["file1"],
  "settings": {
    "language": "eng"  // Tesseract language code
  }
}
```

### 19. PDF Sign
```http
POST /api/tools/pdf-sign
Body: { "fileIds": ["file1"], "settings": {} }
```

### 20. PDF Redact
```http
POST /api/tools/pdf-redact
Body: { "fileIds": ["file1"], "settings": {} }
```

### 21. PDF Flatten
```http
POST /api/tools/pdf-flatten
Body: { "fileIds": ["file1"], "settings": {} }
```

### 22. PDF Linearize
```http
POST /api/tools/pdf-linearize
Body: { "fileIds": ["file1"], "settings": {} }
```

### 23. PDF Repair
```http
POST /api/tools/pdf-repair
Body: { "fileIds": ["file1"], "settings": {} }
```

### 24. PDF Compare
```http
POST /api/tools/pdf-compare
Body: { "fileIds": ["file1", "file2"], "settings": {} }
```

### 25. PDF Header/Footer
```http
POST /api/tools/pdf-header-footer
Body: {
  "fileIds": ["file1"],
  "settings": {
    "headerText": "Document Title",
    "footerText": "Page {n}"
  }
}
```

### 26. PDF Background
```http
POST /api/tools/pdf-background
Body: {
  "fileIds": ["file1"],
  "settings": {
    "color": "#ffffff"
  }
}
```

### 27. PDF Bookmarks
```http
POST /api/tools/pdf-bookmarks
Body: { "fileIds": ["file1"], "settings": {} }
```

### 28. PDF Crop
```http
POST /api/tools/pdf-crop
Body: {
  "fileIds": ["file1"],
  "settings": {
    "margins": { "top": 10, "bottom": 10, "left": 10, "right": 10 }
  }
}
```

### 29. PDF Grayscale
```http
POST /api/tools/pdf-grayscale
Body: { "fileIds": ["file1"], "settings": {} }
```

### 30. PDF Optimize for Web
```http
POST /api/tools/pdf-optimize-web
Body: { "fileIds": ["file1"], "settings": {} }
```

### 31. PDF Form Fill
```http
POST /api/tools/pdf-form-fill
Body: { "fileIds": ["file1"], "settings": {} }
```

### 32. PDF to PDF/A
```http
POST /api/tools/pdf-convert-pdfa
Body: { "fileIds": ["file1"], "settings": {} }
```

### 33. PDF Portfolio
```http
POST /api/tools/pdf-portfolio
Body: { "fileIds": ["file1", "file2", "file3"], "settings": {} }
```

### 34. PDF Reduce Size
```http
POST /api/tools/pdf-reduce-size
Body: { "fileIds": ["file1"], "settings": {} }
```

### 35. PDF Print Ready
```http
POST /api/tools/pdf-print-ready
Body: { "fileIds": ["file1"], "settings": {} }
```

---

## 📝 WORD TOOLS (25 Endpoints)

### 1. Word to PDF
```http
POST /api/tools/word-to-pdf
Body: { "fileIds": ["file1"], "settings": {} }
```

### 2. Word to HTML
```http
POST /api/tools/word-to-html
Body: { "fileIds": ["file1"], "settings": {} }
```

### 3. Word to Markdown
```http
POST /api/tools/word-to-markdown
Body: { "fileIds": ["file1"], "settings": {} }
```

### 4. Word to Text
```http
POST /api/tools/word-to-txt
Body: { "fileIds": ["file1"], "settings": {} }
```

### 5. Word to Images
```http
POST /api/tools/word-to-images
Body: { "fileIds": ["file1"], "settings": {} }
```

### 6. Word Merge
```http
POST /api/tools/word-merge
Body: { "fileIds": ["file1", "file2", "file3"], "settings": {} }
```

### 7. Word Split
```http
POST /api/tools/word-split
Body: {
  "fileIds": ["file1"],
  "settings": {
    "mode": "sections"  // "pages" | "sections" | "headings"
  }
}
```

### 8. Word Compress
```http
POST /api/tools/word-compress
Body: { "fileIds": ["file1"], "settings": {} }
```

### 9. Word Watermark
```http
POST /api/tools/word-watermark
Body: {
  "fileIds": ["file1"],
  "settings": {
    "text": "DRAFT",
    "opacity": 50
  }
}
```

### 10. Word Metadata
```http
POST /api/tools/word-metadata
Body: {
  "fileIds": ["file1"],
  "settings": {
    "title": "My Document",
    "author": "John Doe"
  }
}
```

### 11. Word Password Protect
```http
POST /api/tools/word-password
Body: {
  "fileIds": ["file1"],
  "settings": {
    "password": "secure123"
  }
}
```

### 12. Word Remove Password
```http
POST /api/tools/word-remove-password
Body: {
  "fileIds": ["file1"],
  "settings": {
    "password": "current_password"
  }
}
```

### 13. Word Find & Replace
```http
POST /api/tools/word-find-replace
Body: {
  "fileIds": ["file1"],
  "settings": {
    "find": "old text",
    "replace": "new text",
    "caseSensitive": false
  }
}
```

### 14. Word Compare
```http
POST /api/tools/word-compare
Body: { "fileIds": ["file1", "file2"], "settings": {} }
```

### 15. Word Page Count
```http
POST /api/tools/word-page-count
Body: { "fileIds": ["file1"], "settings": {} }
```

### 16. Word Remove Comments
```http
POST /api/tools/word-remove-comments
Body: { "fileIds": ["file1"], "settings": {} }
```

### 17. Word Extract Images
```http
POST /api/tools/word-extract-images
Body: { "fileIds": ["file1"], "settings": {} }
```

### 18. Word Format Clean
```http
POST /api/tools/word-format-clean
Body: { "fileIds": ["file1"], "settings": {} }
```

### 19. Word Sign
```http
POST /api/tools/word-sign
Body: { "fileIds": ["file1"], "settings": {} }
```

### 20. Word Table of Contents
```http
POST /api/tools/word-toc
Body: { "fileIds": ["file1"], "settings": {} }
```

### 21. Word Mail Merge
```http
POST /api/tools/word-mail-merge
Body: { "fileIds": ["file1"], "settings": {} }
```

### 22. Word Template
```http
POST /api/tools/word-template
Body: { "fileIds": ["file1"], "settings": {} }
```

### 23. Word Accessibility Check
```http
POST /api/tools/word-accessibility
Body: { "fileIds": ["file1"], "settings": {} }
```

### 24. Word Translate
```http
POST /api/tools/word-translate
Body: {
  "fileIds": ["file1"],
  "settings": {
    "targetLanguage": "es"  // ISO language code
  }
}
```

### 25. PDF to Word
```http
POST /api/tools/pdf-to-word
Body: { "fileIds": ["file1"], "settings": {} }
```

---

## 📊 EXCEL/CSV TOOLS (30 Endpoints)

### 1-30. Excel Tools
```http
POST /api/tools/excel-to-csv
POST /api/tools/csv-to-excel
POST /api/tools/excel-to-json
POST /api/tools/excel-to-xml
POST /api/tools/excel-to-pdf
POST /api/tools/excel-merge
POST /api/tools/excel-split
POST /api/tools/excel-compress
POST /api/tools/csv-clean
POST /api/tools/excel-remove-duplicates
POST /api/tools/excel-sort-data
POST /api/tools/excel-filter-data
POST /api/tools/excel-transpose
POST /api/tools/excel-concatenate
POST /api/tools/excel-split-columns
POST /api/tools/excel-statistics
POST /api/tools/excel-find-replace
POST /api/tools/csv-delimiter-change
POST /api/tools/excel-pivot-table
POST /api/tools/excel-chart
POST /api/tools/excel-conditional-formatting
POST /api/tools/excel-data-validation
POST /api/tools/excel-vlookup
POST /api/tools/csv-json-convert
POST /api/tools/excel-protect
POST /api/tools/excel-unprotect
POST /api/tools/excel-formula-audit
POST /api/tools/excel-macro-remove
POST /api/tools/excel-template
POST /api/tools/excel-compare
```

---

## 🖼️ IMAGE TOOLS (30 Endpoints)

```http
POST /api/tools/image-resize
POST /api/tools/image-compress
POST /api/tools/image-convert
POST /api/tools/image-crop
POST /api/tools/image-rotate
POST /api/tools/image-flip
POST /api/tools/image-watermark
POST /api/tools/image-blur
POST /api/tools/image-sharpen
POST /api/tools/image-brightness
POST /api/tools/image-contrast
POST /api/tools/image-saturation
POST /api/tools/image-grayscale
POST /api/tools/image-sepia
POST /api/tools/image-optimize
POST /api/tools/image-thumbnail
POST /api/tools/image-border
POST /api/tools/image-metadata
POST /api/tools/image-metadata-remove
POST /api/tools/image-background-remove
POST /api/tools/image-upscale
POST /api/tools/image-filters
POST /api/tools/image-collage
POST /api/tools/image-meme-generator
POST /api/tools/image-color-replace
POST /api/tools/image-batch-process
POST /api/tools/image-sketch-effect
POST /api/tools/image-text-extract
POST /api/tools/image-face-detect
POST /api/tools/image-gif-maker
```

---

## 🎬 VIDEO TOOLS (20 Endpoints)

```http
POST /api/tools/video-compress
POST /api/tools/video-convert
POST /api/tools/video-trim
POST /api/tools/video-merge
POST /api/tools/video-split
POST /api/tools/video-rotate
POST /api/tools/video-crop
POST /api/tools/video-resize
POST /api/tools/video-to-gif
POST /api/tools/video-extract-audio
POST /api/tools/video-remove-audio
POST /api/tools/video-add-audio
POST /api/tools/video-add-subtitles
POST /api/tools/video-extract-frames
POST /api/tools/video-speed
POST /api/tools/video-reverse
POST /api/tools/video-watermark
POST /api/tools/video-thumbnail
POST /api/tools/video-stabilize
POST /api/tools/video-metadata
```

---

## 🎵 AUDIO TOOLS (15 Endpoints)

```http
POST /api/tools/audio-convert
POST /api/tools/audio-compress
POST /api/tools/audio-trim
POST /api/tools/audio-merge
POST /api/tools/audio-split
POST /api/tools/audio-normalize
POST /api/tools/audio-fade
POST /api/tools/audio-remove-noise
POST /api/tools/audio-speed
POST /api/tools/audio-reverse
POST /api/tools/audio-extract-vocals
POST /api/tools/audio-remove-vocals
POST /api/tools/audio-equalizer
POST /api/tools/audio-metadata
POST /api/tools/audio-waveform
```

---

## 📦 ARCHIVE TOOLS (12 Endpoints)

```http
POST /api/tools/zip-create
POST /api/tools/zip-extract
POST /api/tools/rar-extract
POST /api/tools/7z-create
POST /api/tools/7z-extract
POST /api/tools/tar-create
POST /api/tools/tar-extract
POST /api/tools/archive-convert
POST /api/tools/archive-encrypt
POST /api/tools/archive-split
POST /api/tools/archive-repair
POST /api/tools/archive-list-contents
```

---

## 🔧 UTILITY TOOLS (25 Endpoints)

```http
POST /api/tools/text-analyzer
POST /api/tools/hash-generator
POST /api/tools/password-generator
POST /api/tools/qr-code-generator
POST /api/tools/qr-code-reader
POST /api/tools/barcode-generator
POST /api/tools/barcode-reader
POST /api/tools/base64-encode
POST /api/tools/base64-decode
POST /api/tools/url-encoder
POST /api/tools/url-decoder
POST /api/tools/json-validator
POST /api/tools/json-formatter
POST /api/tools/xml-validator
POST /api/tools/xml-to-json
POST /api/tools/json-to-xml
POST /api/tools/csv-to-json
POST /api/tools/json-to-csv
POST /api/tools/color-picker
POST /api/tools/image-color-palette
POST /api/tools/unit-converter
POST /api/tools/timestamp-converter
POST /api/tools/regex-tester
POST /api/tools/markdown-to-html
POST /api/tools/html-to-markdown
```

---

## 📥 Job Status & Download

### Get Job Status
```http
GET /api/jobs/{jobId}
Authorization: Bearer YOUR_TOKEN

Response:
{
  "success": true,
  "data": {
    "jobId": "job-uuid",
    "status": "completed",  // "pending" | "processing" | "completed" | "failed"
    "progress": 100,  // 0-100
    "currentStep": "Completed",
    "downloadUrl": "http://localhost:3000/api/download/output-file-id",
    "outputFileId": "output-file-id",
    "createdAt": "2025-11-23T10:00:00.000Z",
    "completedAt": "2025-11-23T10:01:30.000Z"
  }
}
```

### Get All Jobs (User's jobs)
```http
GET /api/jobs?userId=user123&limit=50
Authorization: Bearer YOUR_TOKEN

Response:
{
  "success": true,
  "data": [
    { "jobId": "job1", "status": "completed", ... },
    { "jobId": "job2", "status": "processing", ... }
  ]
}
```

### Download Processed File
```http
GET /api/download/{fileId}
Authorization: Bearer YOUR_TOKEN

Response: Binary file download
```

---

## 🔍 Tool Information

### Get All Tools
```http
GET /api/tools
GET /api/tools?category=pdf

Response:
{
  "success": true,
  "data": [
    {
      "id": "pdf-merge",
      "name": "PDF Merge",
      "category": "pdf",
      "description": "Merge multiple PDF files into one",
      "acceptedFormats": [".pdf"],
      "multipleFiles": true,
      "settings": [...]
    },
    ...
  ]
}
```

### Get Tool Details
```http
GET /api/tools/{toolId}

Response:
{
  "success": true,
  "data": {
    "id": "pdf-merge",
    "name": "PDF Merge",
    "category": "pdf",
    "description": "Merge multiple PDF files into one",
    "acceptedFormats": [".pdf"],
    "multipleFiles": true,
    "settings": []
  }
}
```

---

## ❤️ Health Check
```http
GET /api/health

Response:
{
  "status": "healthy",
  "timestamp": "2025-11-23T10:00:00.000Z",
  "uptime": 3600
}
```

---

## 📊 Complete Tool Count by Category

| Category | Tools | Status |
|----------|-------|--------|
| PDF | 35 | ✅ Ready |
| Word | 25 | ✅ Ready |
| Excel/CSV | 30 | ✅ Ready |
| Image | 30 | ✅ Ready |
| Video | 20 | ✅ Ready |
| Audio | 15 | ✅ Ready |
| Archive | 12 | ✅ Ready |
| Utility | 25 | ✅ Ready |
| **TOTAL** | **192** | **✅ All Ready** |

---

## 🚀 Usage Example (Complete Flow)

```javascript
// 1. Upload a file
const formData = new FormData();
formData.append('file', fileBlob, 'document.pdf');

const uploadResponse = await fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});

const { data: { fileId } } = await uploadResponse.json();

// 2. Process with a tool
const processResponse = await fetch('http://localhost:3000/api/tools/pdf-compress', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fileIds: [fileId],
    settings: {
      quality: 'medium'
    }
  })
});

const { data: { jobId } } = await processResponse.json();

// 3. Poll for job status
const checkStatus = async () => {
  const statusResponse = await fetch(`http://localhost:3000/api/jobs/${jobId}`, {
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN'
    }
  });

  const { data } = await statusResponse.json();

  if (data.status === 'completed') {
    // Download the file
    window.location.href = data.downloadUrl;
  } else if (data.status === 'failed') {
    console.error('Processing failed:', data.errorMessage);
  } else {
    // Still processing, check again in 2 seconds
    setTimeout(checkStatus, 2000);
  }
};

checkStatus();
```

---

## 📌 Notes

- All endpoints support async processing via job queue
- Files are automatically cleaned up after 24 hours
- Maximum file size: 100MB (configurable)
- Rate limiting: 100 requests per 15 minutes (configurable)
- All processing happens server-side for security

---

**API Version**: 1.0.0
**Last Updated**: 2025-11-23
**Total Endpoints**: 192 tools + 6 core endpoints = 198 total
