# 📋 Frontend Workflow Specification
## Document Processing SaaS - Complete User Interaction Guide

Version: 1.0
Last Updated: 2025-11-23
Backend Base URL: `http://localhost:3000/api`

---

## Table of Contents

1. [File Upload Workflow](#1-file-upload-workflow)
2. [Preview Workflow](#2-preview-workflow)
3. [Split / Delete Workflow](#3-split--delete-workflow)
4. [Merge Workflow](#4-merge-workflow)
5. [Compress Workflow](#5-compress-workflow)
6. [OCR Workflow](#6-ocr-workflow)
7. [Convert Workflow](#7-convert-workflow)
8. [Download / Email Workflow](#8-download--email-workflow)
9. [Async / Status Handling](#9-async--status-handling)
10. [UI/UX Guidelines](#10-uiux-guidelines)
11. [Error Handling](#11-error-handling)
12. [Implementation Examples](#12-implementation-examples)

---

## 1. File Upload Workflow

### User Journey
```
User selects file(s) → Upload progress shown → File uploaded → FileID received → Ready for processing
```

### Step-by-Step Flow

#### Step 1.1: File Selection
**User Action:** Click "Choose File" button or drag-and-drop files

**UI Behavior:**
- Show file picker dialog
- Support multiple file selection (for merge operations)
- Display selected file name, size, and type
- Show file type icon (PDF, Word, Excel, Image, etc.)

**Validation:**
- Check file size against plan limits (Free: 10MB, Basic: 50MB, Pro: 200MB)
- Check file type is supported
- Display error if validation fails

**Code Example:**
```typescript
const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];

  if (!file) return;

  // Validate file size based on user plan
  const maxSize = user.plan === 'Free' ? 10 : user.plan === 'Basic' ? 50 : 200;
  if (file.size > maxSize * 1024 * 1024) {
    showError(`File too large. Max size for ${user.plan} plan: ${maxSize}MB`);
    return;
  }

  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];

  if (!allowedTypes.includes(file.type)) {
    showError('Unsupported file type');
    return;
  }

  setSelectedFile(file);
};
```

#### Step 1.2: Upload Initiation
**User Action:** Click "Upload" button

**Frontend Action:**
- Create FormData object
- Show upload progress indicator
- Call upload API

**API Call:**
```http
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: (binary file data)
```

**Request Code:**
```typescript
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  setUploading(true);
  setUploadProgress(0);

  try {
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        setUploadProgress(percentCompleted);
      },
    });

    return response.data.data;
  } catch (error) {
    handleUploadError(error);
    throw error;
  } finally {
    setUploading(false);
  }
};
```

#### Step 1.3: Upload Progress
**UI Behavior:**
- Show progress bar (0-100%)
- Display upload speed (MB/s)
- Show "Cancel" button
- Disable other interactions during upload

**Progress Indicator:**
```tsx
{uploading && (
  <div className="upload-progress">
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${uploadProgress}%` }}
      />
    </div>
    <p>{uploadProgress}% uploaded</p>
    <button onClick={cancelUpload}>Cancel</button>
  </div>
)}
```

#### Step 1.4: Upload Complete
**Backend Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "abc123def456",
    "originalName": "document.pdf",
    "mimeType": "application/pdf",
    "size": 1024000,
    "path": "/uploads/abc123def456.pdf",
    "uploadedAt": "2025-11-23T10:30:00.000Z",
    "metadata": {
      "pages": 10,
      "dimensions": {
        "width": 612,
        "height": 792
      }
    }
  }
}
```

**Frontend Action:**
- Store fileId in state
- Show success message
- Enable next workflow (Preview/Process)
- Update UI to show file details

#### Step 1.5: Multiple File Upload (for Merge)
**API Call:**
```http
POST /api/upload/multiple
Content-Type: multipart/form-data

Body:
- files[]: (multiple binary files)
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "fileId": "file1-id",
      "originalName": "doc1.pdf",
      "size": 1024000
    },
    {
      "fileId": "file2-id",
      "originalName": "doc2.pdf",
      "size": 2048000
    }
  ]
}
```

### Error Scenarios

| Error | HTTP Status | User Message | Action |
|-------|-------------|--------------|--------|
| File too large | 413 | "File exceeds plan limit" | Show upgrade option |
| Unsupported type | 400 | "File type not supported" | Show supported types |
| Network error | - | "Upload failed. Check connection" | Retry button |
| Timeout | 408 | "Upload timed out" | Retry button |

---

## 2. Preview Workflow

### User Journey
```
File uploaded → Request preview → Thumbnails generated → Display previews → User selects pages → Ready for next action
```

### Step-by-Step Flow

#### Step 2.1: Request Preview
**Trigger:** After successful file upload

**API Call:**
```http
GET /api/preview/{fileId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "abc123",
    "pages": [
      {
        "pageNumber": 1,
        "thumbnailUrl": "/api/preview/abc123/page/1/thumbnail",
        "fullUrl": "/api/preview/abc123/page/1/full",
        "width": 612,
        "height": 792,
        "text": "Preview of page content...",
        "hasImages": true
      },
      {
        "pageNumber": 2,
        "thumbnailUrl": "/api/preview/abc123/page/2/thumbnail",
        "fullUrl": "/api/preview/abc123/page/2/full",
        "width": 612,
        "height": 792,
        "text": "Page 2 content...",
        "hasImages": false
      }
    ],
    "metadata": {
      "totalPages": 10,
      "fileSize": 1024000,
      "format": "PDF",
      "encrypted": false,
      "hasFormFields": false
    }
  }
}
```

#### Step 2.2: Display Thumbnails
**UI Layout:**
```
┌─────────────────────────────────────┐
│  Page 1    Page 2    Page 3    ...  │
│  [✓]       [✓]       [ ]             │
│  ┌────┐   ┌────┐   ┌────┐          │
│  │    │   │    │   │    │          │
│  │img │   │img │   │img │          │
│  │    │   │    │   │    │          │
│  └────┘   └────┘   └────┘          │
│  Page 1    Page 2    Page 3         │
└─────────────────────────────────────┘
```

**Component Code:**
```tsx
interface PagePreview {
  pageNumber: number;
  thumbnailUrl: string;
  selected: boolean;
}

const PageGrid: React.FC<{ pages: PagePreview[] }> = ({ pages }) => {
  return (
    <div className="page-grid">
      {pages.map((page) => (
        <div
          key={page.pageNumber}
          className={`page-card ${page.selected ? 'selected' : ''}`}
          onClick={() => togglePageSelection(page.pageNumber)}
        >
          <div className="page-checkbox">
            <input
              type="checkbox"
              checked={page.selected}
              onChange={() => togglePageSelection(page.pageNumber)}
            />
          </div>
          <img
            src={page.thumbnailUrl}
            alt={`Page ${page.pageNumber}`}
            loading="lazy"
          />
          <div className="page-number">Page {page.pageNumber}</div>
        </div>
      ))}
    </div>
  );
};
```

#### Step 2.3: Page Selection
**User Actions:**
- Click page thumbnail to select/deselect
- Click "Select All" to select all pages
- Click "Select None" to deselect all
- Click "Invert Selection" to flip selection
- Drag to reorder pages (for merge)

**State Management:**
```typescript
const [selectedPages, setSelectedPages] = useState<number[]>([]);

const togglePageSelection = (pageNumber: number) => {
  setSelectedPages(prev =>
    prev.includes(pageNumber)
      ? prev.filter(p => p !== pageNumber)
      : [...prev, pageNumber]
  );
};

const selectAll = () => {
  setSelectedPages(pages.map(p => p.pageNumber));
};

const selectNone = () => {
  setSelectedPages([]);
};

const invertSelection = () => {
  const allPages = pages.map(p => p.pageNumber);
  setSelectedPages(
    allPages.filter(p => !selectedPages.includes(p))
  );
};
```

#### Step 2.4: Page Highlighting
**User Action:** Hover over page thumbnail

**UI Behavior:**
- Show page number
- Show page size
- Show "View Full Size" button
- Highlight border

#### Step 2.5: Page Deletion
**User Action:** Click delete icon on page

**UI Behavior:**
- Mark page for deletion (red overlay)
- Add to deletion list
- Show "Undo" option
- Update selection count

#### Step 2.6: Page Reordering (Drag & Drop)
**User Action:** Drag page thumbnail to new position

**Implementation:**
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';

const [pages, setPages] = useState(initialPages);

const handleDragEnd = (event) => {
  const { active, over } = event;

  if (active.id !== over.id) {
    setPages((items) => {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }
};
```

---

## 3. Split / Delete Workflow

### User Journey
```
Preview loaded → Select pages to keep → Submit split request → Processing → Download result
```

### Step-by-Step Flow

#### Step 3.1: Page Selection for Split
**User Action:** Select specific pages to keep

**UI Options:**
1. **Keep Selected Pages**
   - User selects pages to keep
   - All other pages are removed

2. **Remove Selected Pages**
   - User selects pages to delete
   - All other pages are kept

3. **Split into Multiple Files**
   - User defines split points
   - Creates multiple output files

**Selection UI:**
```tsx
<div className="split-options">
  <div className="option-group">
    <label>
      <input
        type="radio"
        value="keep"
        checked={mode === 'keep'}
        onChange={() => setMode('keep')}
      />
      Keep Selected Pages
    </label>
    <label>
      <input
        type="radio"
        value="remove"
        checked={mode === 'remove'}
        onChange={() => setMode('remove')}
      />
      Remove Selected Pages
    </label>
  </div>

  <div className="page-selection-summary">
    {mode === 'keep'
      ? `Keeping ${selectedPages.length} pages`
      : `Removing ${selectedPages.length} pages`
    }
  </div>
</div>
```

#### Step 3.2: Submit Split Request
**API Call:**
```http
POST /api/tools/pdf-split
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  "fileIds": "abc123",
  "settings": {
    "mode": "pages",
    "pagesToKeep": [1, 2, 5, 7, 10],
    "outputFormat": "separate" | "single"
  },
  "userId": "user123"
}
```

**Request Code:**
```typescript
const splitPDF = async (fileId: string, pagesToKeep: number[]) => {
  setProcessing(true);

  try {
    const response = await apiClient.post('/tools/pdf-split', {
      fileIds: fileId,
      settings: {
        mode: 'pages',
        pagesToKeep: pagesToKeep,
        outputFormat: 'single'
      }
    });

    const jobId = response.data.data.jobId;

    // Poll for status
    await pollJobStatus(jobId, (status) => {
      setProgress(status.progress);
      setCurrentStep(status.currentStep);
    });

  } catch (error) {
    handleError(error);
  } finally {
    setProcessing(false);
  }
};
```

**Backend Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "job-uuid-123"
  },
  "message": "Split job created successfully"
}
```

#### Step 3.3: Processing Status
**Poll Status API:**
```http
GET /api/jobs/{jobId}
Authorization: Bearer {token}
```

**Status Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "job-uuid-123",
    "status": "processing",
    "progress": 45,
    "currentStep": "Splitting PDF pages...",
    "createdAt": "2025-11-23T10:30:00.000Z"
  }
}
```

**UI Behavior:**
- Show progress bar (0-100%)
- Display current step message
- Show estimated time remaining
- Disable other actions

#### Step 3.4: Completion
**Completed Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "job-uuid-123",
    "status": "completed",
    "progress": 100,
    "currentStep": "Completed",
    "downloadUrl": "/api/download/output-file-id",
    "outputFileId": "output-123",
    "completedAt": "2025-11-23T10:31:30.000Z",
    "metadata": {
      "originalPages": 10,
      "keptPages": 5,
      "removedPages": 5,
      "outputSize": 512000
    }
  }
}
```

**UI Actions:**
- Show success message
- Display download button
- Show file size reduction
- Offer "Process Another" option

---

## 4. Merge Workflow

### User Journey
```
Upload multiple files → Preview all pages → Reorder pages → Submit merge → Processing → Download merged file
```

### Step-by-Step Flow

#### Step 4.1: Multiple File Upload
**User Action:** Upload 2+ PDF files

**UI:**
```
┌─────────────────────────────────────┐
│ Upload Files for Merging            │
│                                      │
│ ┌──────────┐  ┌──────────┐         │
│ │ doc1.pdf │  │ doc2.pdf │  [+]    │
│ │ 1.5 MB   │  │ 2.3 MB   │         │
│ │ 10 pages │  │ 15 pages │         │
│ └──────────┘  └──────────┘         │
│                                      │
│ [Upload Files] [Clear All]          │
└─────────────────────────────────────┘
```

**Code:**
```typescript
const [files, setFiles] = useState<UploadedFile[]>([]);

const handleMultipleUpload = async (fileList: FileList) => {
  const uploadPromises = Array.from(fileList).map(file =>
    uploadFile(file)
  );

  const results = await Promise.all(uploadPromises);
  setFiles(prev => [...prev, ...results]);
};
```

#### Step 4.2: Combined Preview
**API Call:** GET preview for each fileId

**UI Layout:**
```
┌─────────────────────────────────────────────┐
│ File 1: doc1.pdf (10 pages)                 │
│ [Page 1] [Page 2] [Page 3] ... [Page 10]   │
│                                              │
│ File 2: doc2.pdf (15 pages)                 │
│ [Page 1] [Page 2] [Page 3] ... [Page 15]   │
│                                              │
│ [Merge Order]: File 1 → File 2              │
│ [Reorder] [Preview Merged]                  │
└─────────────────────────────────────────────┘
```

#### Step 4.3: Page Reordering
**User Actions:**
- Drag files to reorder merge sequence
- Drag individual pages between files
- Delete pages before merging
- Rotate pages

**State:**
```typescript
interface MergeState {
  files: Array<{
    fileId: string;
    name: string;
    pages: Array<{
      pageNumber: number;
      thumbnailUrl: string;
      rotation: 0 | 90 | 180 | 270;
      include: boolean;
    }>;
  }>;
  mergeOrder: string[]; // Array of fileIds
}
```

#### Step 4.4: Submit Merge
**API Call:**
```http
POST /api/tools/pdf-merge
Content-Type: application/json

Body:
{
  "fileIds": ["file1-id", "file2-id", "file3-id"],
  "settings": {
    "pageOrder": [
      { "fileId": "file1-id", "pages": [1, 2, 3] },
      { "fileId": "file2-id", "pages": [1, 5, 10] },
      { "fileId": "file3-id", "pages": [2, 4, 6] }
    ],
    "removeBlankPages": false,
    "addPageNumbers": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "merge-job-456"
  }
}
```

#### Step 4.5: Processing & Download
**Status Updates:**
```
0%: Starting merge...
20%: Processing File 1 (10 pages)...
45%: Processing File 2 (15 pages)...
70%: Processing File 3 (8 pages)...
90%: Finalizing merged PDF...
100%: Complete!
```

---

## 5. Compress Workflow

### User Journey
```
Upload file → Select compression level → Submit → Processing → Download compressed file
```

### Step-by-Step Flow

#### Step 5.1: Compression Options
**UI:**
```tsx
<div className="compress-options">
  <h3>Compression Level</h3>

  <div className="compression-presets">
    <label className="preset-option">
      <input
        type="radio"
        value="screen"
        checked={level === 'screen'}
      />
      <div className="preset-details">
        <strong>Low Quality (72 DPI)</strong>
        <p>Smallest file size, screen viewing only</p>
        <span className="size-estimate">~50KB per page</span>
      </div>
    </label>

    <label className="preset-option">
      <input
        type="radio"
        value="ebook"
        checked={level === 'ebook'}
      />
      <div className="preset-details">
        <strong>Medium Quality (150 DPI)</strong>
        <p>Good balance, suitable for ebooks</p>
        <span className="size-estimate">~100KB per page</span>
      </div>
    </label>

    <label className="preset-option">
      <input
        type="radio"
        value="printer"
        checked={level === 'printer'}
      />
      <div className="preset-details">
        <strong>High Quality (300 DPI)</strong>
        <p>Suitable for printing</p>
        <span className="size-estimate">~200KB per page</span>
      </div>
    </label>

    <label className="preset-option">
      <input
        type="radio"
        value="prepress"
        checked={level === 'prepress'}
      />
      <div className="preset-details">
        <strong>Maximum Quality (300+ DPI)</strong>
        <p>Professional printing</p>
        <span className="size-estimate">~300KB per page</span>
      </div>
    </label>
  </div>

  <div className="size-comparison">
    <div className="original">
      <strong>Original Size:</strong> 5.2 MB
    </div>
    <div className="estimated">
      <strong>Estimated Size:</strong> 1.5 MB
      <span className="savings">(71% reduction)</span>
    </div>
  </div>
</div>
```

#### Step 5.2: Submit Compression
**API Call:**
```http
POST /api/tools/pdf-compress
Content-Type: application/json

Body:
{
  "fileIds": "file-id",
  "settings": {
    "quality": "ebook",
    "colorMode": "RGB" | "CMYK" | "Grayscale",
    "imageQuality": 85,
    "removeMetadata": true,
    "optimizeImages": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "compress-job-789"
  }
}
```

#### Step 5.3: Processing Progress
**Status Updates:**
```json
{
  "progress": 25,
  "currentStep": "Analyzing PDF structure..."
}

{
  "progress": 50,
  "currentStep": "Compressing images..."
}

{
  "progress": 75,
  "currentStep": "Optimizing fonts and metadata..."
}

{
  "progress": 100,
  "currentStep": "Completed",
  "metadata": {
    "originalSize": 5242880,
    "compressedSize": 1572864,
    "compressionRatio": 0.7,
    "savedSpace": 3670016
  }
}
```

**UI Display:**
```tsx
<div className="compression-results">
  <h3>Compression Complete!</h3>

  <div className="results-comparison">
    <div className="before">
      <strong>Before:</strong>
      <span className="size">5.2 MB</span>
    </div>
    <div className="arrow">→</div>
    <div className="after">
      <strong>After:</strong>
      <span className="size">1.5 MB</span>
    </div>
  </div>

  <div className="savings-badge">
    You saved 3.7 MB (70% reduction)!
  </div>

  <button onClick={downloadFile} className="download-btn">
    Download Compressed PDF
  </button>
</div>
```

---

## 6. OCR Workflow

### User Journey
```
Upload scanned PDF/image → Select language → Submit OCR → Processing → Download searchable PDF
```

### Step-by-Step Flow

#### Step 6.1: Language Selection
**UI:**
```tsx
<div className="ocr-settings">
  <h3>OCR Settings</h3>

  <div className="language-selector">
    <label>Document Language:</label>
    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
      <option value="eng">English</option>
      <option value="spa">Spanish</option>
      <option value="fra">French</option>
      <option value="deu">German</option>
      <option value="chi_sim">Chinese (Simplified)</option>
      <option value="jpn">Japanese</option>
      <option value="ara">Arabic</option>
      <option value="rus">Russian</option>
    </select>
  </div>

  <div className="ocr-options">
    <label>
      <input type="checkbox" checked={autoRotate} />
      Auto-rotate pages
    </label>
    <label>
      <input type="checkbox" checked={deskew} />
      Straighten skewed text
    </label>
    <label>
      <input type="checkbox" checked={removeBackground} />
      Remove background noise
    </label>
  </div>

  <div className="preview-warning">
    <p>⚠️ OCR processing may take several minutes for large documents</p>
    <p>Estimated time: ~30 seconds per page</p>
  </div>
</div>
```

#### Step 6.2: Submit OCR Request
**API Call:**
```http
POST /api/tools/pdf-ocr
Content-Type: application/json

Body:
{
  "fileIds": "file-id",
  "settings": {
    "language": "eng",
    "autoRotate": true,
    "deskew": true,
    "removeBackground": false,
    "outputFormat": "searchable-pdf",
    "preserveLayout": true
  }
}
```

#### Step 6.3: Processing Progress
**Status Updates with Details:**
```json
{
  "progress": 10,
  "currentStep": "Preprocessing images...",
  "details": {
    "totalPages": 20,
    "processedPages": 2,
    "currentPage": 3
  }
}

{
  "progress": 60,
  "currentStep": "Recognizing text on page 12/20...",
  "details": {
    "totalPages": 20,
    "processedPages": 12,
    "recognizedWords": 3450,
    "confidence": 98.5
  }
}
```

**UI Progress Display:**
```tsx
<div className="ocr-progress">
  <div className="progress-header">
    <h3>Processing OCR...</h3>
    <span className="page-counter">
      Page {processedPages}/{totalPages}
    </span>
  </div>

  <div className="progress-bar">
    <div className="fill" style={{ width: `${progress}%` }} />
  </div>

  <p className="current-step">{currentStep}</p>

  <div className="ocr-stats">
    <div className="stat">
      <strong>Words Recognized:</strong>
      <span>{recognizedWords}</span>
    </div>
    <div className="stat">
      <strong>Confidence:</strong>
      <span>{confidence}%</span>
    </div>
  </div>
</div>
```

#### Step 6.4: Results Preview
**Show Extracted Text:**
```tsx
<div className="ocr-results">
  <h3>OCR Complete!</h3>

  <div className="text-preview">
    <h4>Extracted Text Preview (Page 1):</h4>
    <div className="text-content">
      {extractedText.substring(0, 500)}...
    </div>
    <button onClick={showFullText}>View All Text</button>
  </div>

  <div className="download-options">
    <button onClick={downloadSearchablePDF}>
      Download Searchable PDF
    </button>
    <button onClick={downloadTextFile}>
      Download as Text File
    </button>
  </div>
</div>
```

---

## 7. Convert Workflow

### User Journey
```
Upload file → Select output format → Configure options → Submit → Processing → Download converted file
```

### Step-by-Step Flow

#### Step 7.1: Format Selection
**UI:**
```tsx
<div className="convert-options">
  <h3>Convert To:</h3>

  <div className="format-grid">
    <button
      className={`format-option ${targetFormat === 'word' ? 'active' : ''}`}
      onClick={() => setTargetFormat('word')}
    >
      <div className="format-icon">📝</div>
      <span>Word (.docx)</span>
    </button>

    <button
      className={`format-option ${targetFormat === 'excel' ? 'active' : ''}`}
      onClick={() => setTargetFormat('excel')}
    >
      <div className="format-icon">📊</div>
      <span>Excel (.xlsx)</span>
    </button>

    <button
      className={`format-option ${targetFormat === 'ppt' ? 'active' : ''}`}
      onClick={() => setTargetFormat('ppt')}
    >
      <div className="format-icon">📑</div>
      <span>PowerPoint (.pptx)</span>
    </button>

    <button
      className={`format-option ${targetFormat === 'html' ? 'active' : ''}`}
      onClick={() => setTargetFormat('html')}
    >
      <div className="format-icon">🌐</div>
      <span>HTML</span>
    </button>

    <button
      className={`format-option ${targetFormat === 'text' ? 'active' : ''}`}
      onClick={() => setTargetFormat('text')}
    >
      <div className="format-icon">📄</div>
      <span>Plain Text (.txt)</span>
    </button>

    <button
      className={`format-option ${targetFormat === 'images' ? 'active' : ''}`}
      onClick={() => setTargetFormat('images')}
    >
      <div className="format-icon">🖼️</div>
      <span>Images (.png/.jpg)</span>
    </button>
  </div>
</div>
```

#### Step 7.2: Format-Specific Options

**PDF → Word:**
```tsx
<div className="conversion-settings">
  <h4>Word Conversion Options:</h4>

  <label>
    <input type="checkbox" checked={preserveLayout} />
    Preserve page layout
  </label>

  <label>
    <input type="checkbox" checked={extractImages} />
    Extract and embed images
  </label>

  <label>
    <input type="checkbox" checked={enableEditing} />
    Enable text editing (may affect formatting)
  </label>

  <div className="page-range">
    <label>Pages to convert:</label>
    <select value={pageRange}>
      <option value="all">All pages</option>
      <option value="custom">Custom range</option>
    </select>

    {pageRange === 'custom' && (
      <input
        type="text"
        placeholder="e.g., 1-5, 8, 10-12"
        value={customPages}
        onChange={(e) => setCustomPages(e.target.value)}
      />
    )}
  </div>
</div>
```

**PDF → Images:**
```tsx
<div className="image-settings">
  <h4>Image Export Options:</h4>

  <div className="format-choice">
    <label>Image Format:</label>
    <select value={imageFormat}>
      <option value="png">PNG (High Quality)</option>
      <option value="jpg">JPEG (Smaller Size)</option>
      <option value="webp">WebP (Best Compression)</option>
    </select>
  </div>

  <div className="resolution">
    <label>Resolution (DPI):</label>
    <input
      type="range"
      min="72"
      max="600"
      value={dpi}
      onChange={(e) => setDpi(e.target.value)}
    />
    <span>{dpi} DPI</span>
  </div>

  <div className="quality">
    <label>Quality:</label>
    <input
      type="range"
      min="1"
      max="100"
      value={quality}
    />
    <span>{quality}%</span>
  </div>
</div>
```

#### Step 7.3: Submit Conversion
**API Call:**
```http
POST /api/tools/pdf-to-word
Content-Type: application/json

Body:
{
  "fileIds": "file-id",
  "settings": {
    "preserveLayout": true,
    "extractImages": true,
    "pageRange": "1-10",
    "outputFormat": "docx"
  }
}
```

**Other Conversion Endpoints:**
- `POST /api/tools/pdf-to-images`
- `POST /api/tools/pdf-to-excel`
- `POST /api/tools/pdf-to-ppt`
- `POST /api/tools/word-to-pdf`
- `POST /api/tools/excel-to-pdf`

---

## 8. Download / Email Workflow

### Step-by-Step Flow

#### Step 8.1: Download File
**API Call:**
```http
GET /api/download/{fileId}
Authorization: Bearer {token}
```

**Implementation:**
```typescript
const downloadFile = (fileId: string, filename: string) => {
  const token = localStorage.getItem('authToken');
  const url = `${API_BASE_URL}/download/${fileId}`;

  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(response => {
      if (!response.ok) throw new Error('Download failed');
      return response.blob();
    })
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    })
    .catch(error => {
      showError('Failed to download file');
    });
};
```

#### Step 8.2: Email File
**UI:**
```tsx
<div className="email-dialog">
  <h3>Email Processed File</h3>

  <form onSubmit={handleEmailSubmit}>
    <div className="form-group">
      <label>Recipient Email:</label>
      <input
        type="email"
        value={recipientEmail}
        placeholder="recipient@example.com"
        required
      />
    </div>

    <div className="form-group">
      <label>Subject:</label>
      <input
        type="text"
        value={subject}
        placeholder="Your processed document"
      />
    </div>

    <div className="form-group">
      <label>Message (optional):</label>
      <textarea
        value={message}
        placeholder="Add a personal message..."
        rows={4}
      />
    </div>

    <div className="file-info">
      <strong>Attaching:</strong> {filename} ({fileSize})
    </div>

    <button type="submit" disabled={sending}>
      {sending ? 'Sending...' : 'Send Email'}
    </button>
  </form>
</div>
```

**API Call:**
```http
POST /api/pdf/email
Content-Type: application/json

Body:
{
  "fileId": "output-file-id",
  "recipient": "user@example.com",
  "subject": "Your processed document",
  "message": "Here is your processed file",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "emailSent": true,
    "recipient": "user@example.com",
    "sentAt": "2025-11-23T10:35:00.000Z"
  },
  "message": "Email sent successfully"
}
```

---

## 9. Async / Status Handling

### Polling Implementation

#### Step 9.1: Start Job
**After initiating any processing operation:**
```typescript
const response = await apiClient.post('/tools/pdf-compress', {
  fileIds: fileId,
  settings: { quality: 'medium' }
});

const jobId = response.data.data.jobId;

// Start polling
await pollJobStatus(jobId);
```

#### Step 9.2: Poll Status
**Implementation:**
```typescript
const pollJobStatus = async (
  jobId: string,
  onProgress?: (status: JobStatus) => void,
  interval: number = 2000
): Promise<JobStatus> => {
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const response = await apiClient.get(`/jobs/${jobId}`);
        const status = response.data.data;

        // Update UI
        if (onProgress) {
          onProgress(status);
        }

        // Check completion
        if (status.status === 'completed') {
          resolve(status);
        } else if (status.status === 'failed') {
          reject(new Error(status.errorMessage || 'Processing failed'));
        } else {
          // Continue polling
          setTimeout(checkStatus, interval);
        }
      } catch (error) {
        reject(error);
      }
    };

    checkStatus();
  });
};
```

#### Step 9.3: Status States

**Possible Status Values:**
```typescript
type JobStatus =
  | 'pending'      // Job queued, not started
  | 'processing'   // Currently processing
  | 'completed'    // Successfully completed
  | 'failed';      // Error occurred

interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  progress: number;        // 0-100
  currentStep: string;     // Human-readable step
  downloadUrl?: string;    // Available when completed
  outputFileId?: string;   // Available when completed
  errorMessage?: string;   // Available when failed
  createdAt: string;
  completedAt?: string;
  estimatedTimeRemaining?: number; // seconds
}
```

#### Step 9.4: UI Progress Display
```tsx
const JobProgress: React.FC<{ jobId: string }> = ({ jobId }) => {
  const [status, setStatus] = useState<JobStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    pollJobStatus(jobId, (statusUpdate) => {
      setStatus(statusUpdate);
    }).catch(err => {
      setError(err.message);
    });
  }, [jobId]);

  if (error) {
    return (
      <div className="error-state">
        <span className="error-icon">❌</span>
        <h3>Processing Failed</h3>
        <p>{error}</p>
        <button onClick={retry}>Try Again</button>
      </div>
    );
  }

  if (!status) {
    return <div className="loading">Loading status...</div>;
  }

  if (status.status === 'completed') {
    return (
      <div className="success-state">
        <span className="success-icon">✅</span>
        <h3>Processing Complete!</h3>
        <button onClick={() => downloadFile(status.outputFileId!)}>
          Download File
        </button>
      </div>
    );
  }

  return (
    <div className="processing-state">
      <div className="progress-circle">
        <CircularProgress value={status.progress} />
      </div>

      <h3>{status.currentStep}</h3>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${status.progress}%` }}
        />
      </div>

      <p className="progress-text">
        {status.progress}% complete
      </p>

      {status.estimatedTimeRemaining && (
        <p className="time-remaining">
          Estimated time: {formatTime(status.estimatedTimeRemaining)}
        </p>
      )}
    </div>
  );
};
```

### Webhook Alternative (Optional)

**If backend supports webhooks:**
```typescript
// Setup webhook listener
const setupWebhook = (jobId: string) => {
  const ws = new WebSocket(`wss://api.example.com/ws/jobs/${jobId}`);

  ws.onmessage = (event) => {
    const status = JSON.parse(event.data);
    updateJobStatus(status);

    if (status.status === 'completed' || status.status === 'failed') {
      ws.close();
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    // Fallback to polling
    pollJobStatus(jobId);
  };
};
```

---

## 10. UI/UX Guidelines

### Visual Design Principles

#### 10.1 Consistent Layout
```
┌───────────────────────────────────────┐
│ [Logo]  Home  Tools  Pricing  Profile │ ← Header (fixed)
├───────────────────────────────────────┤
│                                        │
│  [Current Workflow Title]              │
│  [Step Indicator: 1 > 2 > 3]          │
│                                        │
│  ┌──────────────────────────────┐    │
│  │                               │    │
│  │     Main Content Area         │    │
│  │                               │    │
│  └──────────────────────────────┘    │
│                                        │
│  [Back] [Cancel]     [Next Step →]    │
│                                        │
└───────────────────────────────────────┘
```

#### 10.2 Color Scheme
```css
/* Primary Colors */
--primary: #667eea;      /* Main actions */
--primary-hover: #5568d3;
--secondary: #764ba2;    /* Accents */

/* Status Colors */
--success: #10b981;      /* Completed actions */
--error: #ef4444;        /* Errors */
--warning: #f59e0b;      /* Warnings */
--info: #3b82f6;         /* Information */

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-500: #6b7280;
--gray-900: #1f2937;
```

#### 10.3 Step Indicators
```tsx
const StepIndicator: React.FC<{ steps: string[], current: number }> =
  ({ steps, current }) => {
  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`step ${
            index < current ? 'completed' :
            index === current ? 'active' :
            'pending'
          }`}
        >
          <div className="step-number">
            {index < current ? '✓' : index + 1}
          </div>
          <div className="step-label">{step}</div>
          {index < steps.length - 1 && (
            <div className="step-connector" />
          )}
        </div>
      ))}
    </div>
  );
};
```

#### 10.4 Loading States
```tsx
// Skeleton Loader for Thumbnails
<div className="thumbnail-skeleton">
  <div className="skeleton-image" />
  <div className="skeleton-text" />
</div>

// Spinner for Actions
<div className="spinner-overlay">
  <div className="spinner" />
  <p>Processing...</p>
</div>

// Progress Bar
<div className="progress-bar">
  <div className="progress-fill" style={{ width: `${progress}%` }}>
    <span className="progress-label">{progress}%</span>
  </div>
</div>
```

#### 10.5 Error Messages
```tsx
const ErrorMessage: React.FC<{ error: string, retry?: () => void }> =
  ({ error, retry }) => {
  return (
    <div className="error-message">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h4>Something went wrong</h4>
        <p>{error}</p>
      </div>
      {retry && (
        <button onClick={retry} className="retry-button">
          Try Again
        </button>
      )}
    </div>
  );
};
```

#### 10.6 Success Messages
```tsx
const SuccessMessage: React.FC<{ message: string, action?: () => void }> =
  ({ message, action }) => {
  return (
    <div className="success-message">
      <div className="success-icon">✅</div>
      <div className="success-content">
        <h4>Success!</h4>
        <p>{message}</p>
      </div>
      {action && (
        <button onClick={action} className="action-button">
          Download File
        </button>
      )}
    </div>
  );
};
```

### Accessibility

#### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order should follow logical flow
- Escape key should close modals/dialogs

#### Screen Reader Support
```tsx
<button
  aria-label="Upload file"
  aria-describedby="upload-help"
>
  Upload
</button>
<div id="upload-help" className="sr-only">
  Select a PDF file to upload. Maximum size: 10MB for Free plan.
</div>
```

### Responsive Design

#### Mobile Layout
```css
@media (max-width: 768px) {
  .page-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tool-options {
    flex-direction: column;
  }

  .step-indicator {
    overflow-x: auto;
  }
}
```

---

## 11. Error Handling

### Error Types and Responses

#### 11.1 Network Errors
```typescript
const handleNetworkError = (error: any) => {
  if (!error.response) {
    showError({
      title: 'Connection Error',
      message: 'Could not connect to server. Check your internet connection.',
      action: 'retry'
    });
  }
};
```

#### 11.2 Validation Errors
**Backend Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid file format",
    "details": {
      "field": "file",
      "expected": [".pdf", ".docx"],
      "received": ".txt"
    }
  }
}
```

**Frontend Handling:**
```typescript
const handleValidationError = (error: ValidationError) => {
  showError({
    title: 'Invalid Input',
    message: error.details
      ? `Expected ${error.details.expected.join(', ')} but received ${error.details.received}`
      : error.message,
    type: 'warning'
  });
};
```

#### 11.3 Processing Errors
**Backend Response:**
```json
{
  "success": false,
  "data": {
    "jobId": "job-123",
    "status": "failed",
    "errorMessage": "PDF is encrypted and requires a password",
    "errorCode": "PDF_ENCRYPTED"
  }
}
```

**Frontend Handling:**
```typescript
const handleProcessingError = (error: ProcessingError) => {
  const errorMessages: Record<string, string> = {
    'PDF_ENCRYPTED': 'This PDF is password-protected. Please provide the password.',
    'PDF_CORRUPTED': 'The PDF file appears to be corrupted.',
    'INSUFFICIENT_PAGES': 'Not enough pages to perform this operation.',
    'FILE_TOO_LARGE': 'File exceeds maximum size limit for your plan.'
  };

  const userMessage = errorMessages[error.errorCode] || error.errorMessage;

  showError({
    title: 'Processing Failed',
    message: userMessage,
    action: error.errorCode === 'PDF_ENCRYPTED' ? 'enterPassword' : 'retry'
  });
};
```

#### 11.4 Rate Limiting
**Backend Response:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Daily request limit exceeded",
    "details": {
      "limit": 5,
      "used": 5,
      "resetsAt": "2025-11-24T00:00:00.000Z"
    }
  }
}
```

**Frontend Handling:**
```typescript
const handleRateLimitError = (error: RateLimitError) => {
  const resetTime = new Date(error.details.resetsAt);
  const hoursUntilReset = Math.ceil(
    (resetTime.getTime() - Date.now()) / (1000 * 60 * 60)
  );

  showError({
    title: 'Daily Limit Reached',
    message: `You've used all ${error.details.limit} requests for today. Limit resets in ${hoursUntilReset} hours.`,
    action: 'upgrade',
    actionText: 'Upgrade Plan'
  });
};
```

---

## 12. Implementation Examples

### Complete Split Workflow Component

```tsx
import React, { useState, useEffect } from 'react';
import { uploadFile } from '../api/upload';
import { processTool } from '../api/tools';
import { pollJobStatus } from '../api/jobs';
import { downloadFile } from '../api/download';

export const PDFSplitWorkflow: React.FC = () => {
  // State
  const [step, setStep] = useState<'upload' | 'preview' | 'split' | 'download'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputFileId, setOutputFileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Upload
  const handleUpload = async () => {
    if (!file) return;

    try {
      const result = await uploadFile(file);
      setFileId(result.fileId);
      setStep('preview');

      // Fetch preview
      await fetchPreview(result.fileId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Step 2: Preview
  const fetchPreview = async (fileId: string) => {
    try {
      const response = await apiClient.get(`/preview/${fileId}`);
      setPages(response.data.data.pages);
    } catch (err: any) {
      setError('Failed to load preview');
    }
  };

  // Step 3: Split
  const handleSplit = async () => {
    if (!fileId || selectedPages.length === 0) return;

    setProcessing(true);
    setStep('split');

    try {
      const jobId = await processTool('pdf-split', {
        fileIds: fileId,
        settings: {
          mode: 'pages',
          pagesToKeep: selectedPages
        }
      });

      const result = await pollJobStatus(jobId, (status) => {
        setProgress(status.progress);
      });

      setOutputFileId(result.outputFileId!);
      setStep('download');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Step 4: Download
  const handleDownload = () => {
    if (outputFileId) {
      downloadFile(outputFileId, `split-${file?.name}`);
    }
  };

  // Render
  return (
    <div className="split-workflow">
      <StepIndicator
        steps={['Upload', 'Select Pages', 'Split', 'Download']}
        current={['upload', 'preview', 'split', 'download'].indexOf(step)}
      />

      {error && (
        <ErrorMessage error={error} retry={() => setError(null)} />
      )}

      {step === 'upload' && (
        <div className="upload-step">
          <h2>Upload PDF to Split</h2>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button
            onClick={handleUpload}
            disabled={!file}
            className="primary-button"
          >
            Upload & Preview
          </button>
        </div>
      )}

      {step === 'preview' && (
        <div className="preview-step">
          <h2>Select Pages to Keep</h2>
          <div className="selection-controls">
            <button onClick={() => setSelectedPages(pages.map(p => p.pageNumber))}>
              Select All
            </button>
            <button onClick={() => setSelectedPages([])}>
              Select None
            </button>
            <span className="selection-count">
              {selectedPages.length} of {pages.length} pages selected
            </span>
          </div>

          <PageGrid
            pages={pages}
            selectedPages={selectedPages}
            onTogglePage={(pageNum) => {
              setSelectedPages(prev =>
                prev.includes(pageNum)
                  ? prev.filter(p => p !== pageNum)
                  : [...prev, pageNum]
              );
            }}
          />

          <div className="navigation-buttons">
            <button onClick={() => setStep('upload')}>Back</button>
            <button
              onClick={handleSplit}
              disabled={selectedPages.length === 0}
              className="primary-button"
            >
              Split PDF
            </button>
          </div>
        </div>
      )}

      {step === 'split' && (
        <div className="processing-step">
          <h2>Splitting PDF...</h2>
          <ProgressBar value={progress} />
          <p>{progress}% complete</p>
        </div>
      )}

      {step === 'download' && (
        <div className="download-step">
          <SuccessIcon />
          <h2>PDF Split Successfully!</h2>
          <p>Your file contains {selectedPages.length} pages</p>
          <button onClick={handleDownload} className="primary-button">
            Download Split PDF
          </button>
          <button onClick={() => window.location.reload()}>
            Split Another PDF
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## Flow Diagrams

### Overall System Flow
```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────┐     ┌──────────────┐
│  File Upload    │────►│   Backend    │
│  Component      │     │   /upload    │
└─────────┬───────┘     └──────┬───────┘
          │                     │
          │                     ▼
          │              ┌─────────────┐
          │              │  Store File │
          │              │  Return ID  │
          │              └──────┬──────┘
          │                     │
          ▼                     │
┌─────────────────┐            │
│  Preview        │◄───────────┘
│  Component      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐     ┌──────────────┐
│  Tool Action    │────►│   Backend    │
│  (Split/Merge)  │     │  /tools/xxx  │
└─────────┬───────┘     └──────┬───────┘
          │                     │
          │                     ▼
          │              ┌─────────────┐
          │              │  Queue Job  │
          │              │  Return ID  │
          │              └──────┬──────┘
          │                     │
          ▼                     │
┌─────────────────┐            │
│  Status Poll    │◄───────────┘
│  Component      │
│  (Every 2s)     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Download       │
│  Component      │
└─────────────────┘
```

---

## Summary

This specification covers:

✅ **8 Complete Workflows**
- File Upload (single & multiple)
- Preview with thumbnails
- Split/Delete pages
- Merge PDFs
- Compress with quality options
- OCR with language selection
- Format conversion
- Download/Email

✅ **Async Processing**
- Job queue system
- Status polling
- Progress updates
- Error handling

✅ **UI/UX Guidelines**
- Consistent layout
- Step indicators
- Loading states
- Error messages
- Success feedback

✅ **Implementation Details**
- API endpoints
- Request/response formats
- Code examples
- Error handling
- State management

✅ **Complete Example Component**
- Full split workflow
- All steps integrated
- Error handling
- Progress tracking

This specification provides everything needed to implement a complete document-processing frontend that integrates seamlessly with your backend APIs.
