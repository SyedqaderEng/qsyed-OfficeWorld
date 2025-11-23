# 🎯 Complete API Endpoint Reference

**All 192 Tool Endpoints + 6 Core Endpoints = 198 Total**

Base URL: `http://localhost:3000/api`

---

## 📤 CORE ENDPOINTS (6)

### File Management
```
POST   /api/upload              - Upload single file
POST   /api/upload/multiple     - Upload multiple files
GET    /api/download/:fileId    - Download processed file
```

### Job Management
```
GET    /api/jobs/:jobId         - Get job status
GET    /api/jobs?userId=xxx     - Get all user jobs
```

### Health & Info
```
GET    /api/health              - Health check
GET    /api/tools               - Get all tools
GET    /api/tools?category=pdf  - Get tools by category
GET    /api/tools/:toolId       - Get tool details
```

---

## 📄 PDF TOOLS (35)

```
POST /api/tools/pdf-merge
POST /api/tools/pdf-split
POST /api/tools/pdf-compress
POST /api/tools/pdf-to-images
POST /api/tools/pdf-to-word
POST /api/tools/pdf-to-excel
POST /api/tools/pdf-to-ppt
POST /api/tools/pdf-watermark
POST /api/tools/pdf-rotate
POST /api/tools/pdf-page-numbers
POST /api/tools/pdf-extract-text
POST /api/tools/pdf-extract-images
POST /api/tools/pdf-remove-pages
POST /api/tools/pdf-reorder
POST /api/tools/pdf-password-protect
POST /api/tools/pdf-remove-password
POST /api/tools/pdf-metadata
POST /api/tools/pdf-ocr
POST /api/tools/pdf-sign
POST /api/tools/pdf-redact
POST /api/tools/pdf-flatten
POST /api/tools/pdf-linearize
POST /api/tools/pdf-repair
POST /api/tools/pdf-compare
POST /api/tools/pdf-header-footer
POST /api/tools/pdf-background
POST /api/tools/pdf-bookmarks
POST /api/tools/pdf-crop
POST /api/tools/pdf-grayscale
POST /api/tools/pdf-optimize-web
POST /api/tools/pdf-form-fill
POST /api/tools/pdf-convert-pdfa
POST /api/tools/pdf-portfolio
POST /api/tools/pdf-reduce-size
POST /api/tools/pdf-print-ready
```

---

## 📝 WORD TOOLS (25)

```
POST /api/tools/word-to-pdf
POST /api/tools/word-to-html
POST /api/tools/word-to-markdown
POST /api/tools/word-to-txt
POST /api/tools/word-to-images
POST /api/tools/word-merge
POST /api/tools/word-split
POST /api/tools/word-compress
POST /api/tools/word-watermark
POST /api/tools/word-metadata
POST /api/tools/word-password
POST /api/tools/word-remove-password
POST /api/tools/word-find-replace
POST /api/tools/word-compare
POST /api/tools/word-page-count
POST /api/tools/word-remove-comments
POST /api/tools/word-extract-images
POST /api/tools/word-format-clean
POST /api/tools/word-sign
POST /api/tools/word-toc
POST /api/tools/word-mail-merge
POST /api/tools/word-template
POST /api/tools/word-accessibility
POST /api/tools/word-translate
POST /api/tools/pdf-to-word
```

---

## 📊 EXCEL/CSV TOOLS (30)

```
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

## 🖼️ IMAGE TOOLS (30)

```
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

## 🎬 VIDEO TOOLS (20)

```
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

## 🎵 AUDIO TOOLS (15)

```
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

## 📦 ARCHIVE TOOLS (12)

```
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

## 🔧 UTILITY TOOLS (25)

```
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

## 📊 ENDPOINT SUMMARY

| Category | Endpoints | Status |
|----------|-----------|--------|
| PDF | 35 | ✅ |
| Word | 25 | ✅ |
| Excel/CSV | 30 | ✅ |
| Image | 30 | ✅ |
| Video | 20 | ✅ |
| Audio | 15 | ✅ |
| Archive | 12 | ✅ |
| Utility | 25 | ✅ |
| **Tool Endpoints** | **192** | ✅ |
| **Core Endpoints** | **6** | ✅ |
| **TOTAL** | **198** | ✅ |

---

## 🔄 STANDARD REQUEST FORMAT

All tool endpoints accept:

```json
{
  "fileIds": "single-file-id" or ["file-id-1", "file-id-2"],
  "settings": {
    // Tool-specific settings
  },
  "userId": "optional-user-id"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "jobId": "uuid-here"
  },
  "message": "Processing job created successfully"
}
```

---

## 📥 STANDARD JOB STATUS FORMAT

```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "status": "completed",
    "progress": 100,
    "currentStep": "Completed",
    "downloadUrl": "http://localhost:3000/api/download/output-file",
    "outputFileId": "output-file",
    "createdAt": "2025-11-23T10:00:00.000Z",
    "completedAt": "2025-11-23T10:01:30.000Z"
  }
}
```

---

## 🚀 QUICK USAGE

```javascript
// 1. Upload
const upload = await fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  body: formData
});
const { fileId } = (await upload.json()).data;

// 2. Process
const process = await fetch('http://localhost:3000/api/tools/pdf-compress', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fileIds: fileId, settings: {} })
});
const { jobId } = (await process.json()).data;

// 3. Poll Status
const checkStatus = async () => {
  const status = await fetch(`http://localhost:3000/api/jobs/${jobId}`);
  const job = (await status.json()).data;

  if (job.status === 'completed') {
    window.location.href = job.downloadUrl;
  } else {
    setTimeout(checkStatus, 2000);
  }
};
checkStatus();
```

---

## 📚 FULL DOCUMENTATION

- **Complete API Docs**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Frontend Guide**: [FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)
- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Ready to use in your frontend! All 198 endpoints are functional and documented.** 🚀
