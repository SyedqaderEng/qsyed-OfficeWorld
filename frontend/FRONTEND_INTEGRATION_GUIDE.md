# 🎨 Frontend Integration Guide

This guide shows you how to integrate your frontend with the Qsyed Web Services backend.

## 🚀 Quick Start

### 1. Installation & Setup

```bash
# Install axios or fetch (example using axios)
npm install axios
```

### 2. Create API Client

```typescript
// api/client.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. Upload Files

```typescript
// api/upload.ts
import { apiClient } from './client';

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data; // { fileId, originalName, size, ... }
}

export async function uploadMultipleFiles(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await apiClient.post('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data; // Array of file objects
}
```

### 4. Process with Tools

```typescript
// api/tools.ts
import { apiClient } from './client';

export interface ProcessRequest {
  fileIds: string | string[];
  settings?: Record<string, any>;
  userId?: string;
}

export async function processTool(toolId: string, request: ProcessRequest) {
  const response = await apiClient.post(`/tools/${toolId}`, request);
  return response.data.data.jobId; // Returns job ID
}

// Get all available tools
export async function getAllTools(category?: string) {
  const params = category ? { category } : {};
  const response = await apiClient.get('/tools', { params });
  return response.data.data;
}

// Get specific tool details
export async function getToolDetails(toolId: string) {
  const response = await apiClient.get(`/tools/${toolId}`);
  return response.data.data;
}
```

### 5. Monitor Job Status

```typescript
// api/jobs.ts
import { apiClient } from './client';

export interface JobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep: string;
  downloadUrl?: string;
  outputFileId?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const response = await apiClient.get(`/jobs/${jobId}`);
  return response.data.data;
}

export async function pollJobStatus(
  jobId: string,
  onProgress?: (status: JobStatus) => void,
  interval = 2000
): Promise<JobStatus> {
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const status = await getJobStatus(jobId);

        // Call progress callback
        if (onProgress) {
          onProgress(status);
        }

        if (status.status === 'completed') {
          resolve(status);
        } else if (status.status === 'failed') {
          reject(new Error(status.errorMessage || 'Processing failed'));
        } else {
          // Still processing, check again
          setTimeout(checkStatus, interval);
        }
      } catch (error) {
        reject(error);
      }
    };

    checkStatus();
  });
}
```

### 6. Download Files

```typescript
// api/download.ts
export function downloadFile(fileId: string, filename?: string) {
  const token = localStorage.getItem('authToken');
  const url = `${API_BASE_URL}/download/${fileId}`;

  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || fileId;
  link.target = '_blank';

  // Add authorization header via fetch
  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.blob())
    .then((blob) => {
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    });
}
```

---

## 📱 Example React Components

### File Upload Component

```typescript
// components/FileUpload.tsx
import React, { useState } from 'react';
import { uploadFile } from '../api/upload';

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadFile(file);
      setFileId(result.fileId);
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {fileId && <p>File ID: {fileId}</p>}
    </div>
  );
}
```

### Tool Processor Component

```typescript
// components/ToolProcessor.tsx
import React, { useState } from 'react';
import { processTool } from '../api/tools';
import { pollJobStatus } from '../api/jobs';
import { downloadFile } from '../api/download';

interface Props {
  fileId: string;
  toolId: string;
}

export function ToolProcessor({ fileId, toolId }: Props) {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleProcess = async () => {
    setProcessing(true);
    setProgress(0);

    try {
      // Start processing
      const jobId = await processTool(toolId, {
        fileIds: fileId,
        settings: {},
      });

      // Poll for completion
      const result = await pollJobStatus(jobId, (status) => {
        setProgress(status.progress);
        setCurrentStep(status.currentStep);
      });

      // Processing complete
      setDownloadUrl(result.downloadUrl!);
      alert('Processing complete!');
    } catch (error) {
      console.error('Processing failed:', error);
      alert('Processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const fileId = downloadUrl.split('/').pop()!;
      downloadFile(fileId, `processed-${toolId}.pdf`);
    }
  };

  return (
    <div>
      <button onClick={handleProcess} disabled={processing}>
        {processing ? 'Processing...' : `Process with ${toolId}`}
      </button>

      {processing && (
        <div>
          <progress value={progress} max={100} />
          <p>{currentStep}</p>
        </div>
      )}

      {downloadUrl && (
        <button onClick={handleDownload}>Download Result</button>
      )}
    </div>
  );
}
```

### Complete Workflow Component

```typescript
// components/FileProcessorWorkflow.tsx
import React, { useState } from 'react';
import { uploadFile } from '../api/upload';
import { processTool } from '../api/tools';
import { pollJobStatus } from '../api/jobs';
import { downloadFile } from '../api/download';

export function FileProcessorWorkflow() {
  const [step, setStep] = useState<'upload' | 'process' | 'download'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [toolId, setToolId] = useState('pdf-compress');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [outputFileId, setOutputFileId] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    try {
      const result = await uploadFile(file);
      setFileId(result.fileId);
      setStep('process');
    } catch (error) {
      alert('Upload failed');
    }
  };

  const handleProcess = async () => {
    if (!fileId) return;

    try {
      const jobId = await processTool(toolId, {
        fileIds: fileId,
        settings: { quality: 'medium' },
      });

      const result = await pollJobStatus(jobId, (status) => {
        setProgress(status.progress);
        setCurrentStep(status.currentStep);
      });

      setOutputFileId(result.outputFileId!);
      setStep('download');
    } catch (error) {
      alert('Processing failed');
    }
  };

  const handleDownload = () => {
    if (outputFileId) {
      downloadFile(outputFileId, `processed-${file?.name}`);
    }
  };

  return (
    <div className="workflow">
      <h2>File Processing Workflow</h2>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div>
          <h3>Step 1: Upload File</h3>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <select value={toolId} onChange={(e) => setToolId(e.target.value)}>
            <option value="pdf-compress">PDF Compress</option>
            <option value="pdf-merge">PDF Merge</option>
            <option value="image-resize">Image Resize</option>
            {/* Add more tools */}
          </select>
          <button onClick={handleUpload} disabled={!file}>
            Upload & Continue
          </button>
        </div>
      )}

      {/* Step 2: Process */}
      {step === 'process' && (
        <div>
          <h3>Step 2: Processing</h3>
          <button onClick={handleProcess}>Start Processing</button>
          {progress > 0 && (
            <div>
              <progress value={progress} max={100} />
              <p>{progress}% - {currentStep}</p>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Download */}
      {step === 'download' && (
        <div>
          <h3>Step 3: Download Result</h3>
          <button onClick={handleDownload}>Download Processed File</button>
        </div>
      )}
    </div>
  );
}
```

---

## 🛠️ Tool-Specific Examples

### PDF Merge

```typescript
const fileIds = ['file1-id', 'file2-id', 'file3-id'];

const jobId = await processTool('pdf-merge', {
  fileIds,
  settings: {},
});

const result = await pollJobStatus(jobId);
downloadFile(result.outputFileId!);
```

### PDF Compress

```typescript
const jobId = await processTool('pdf-compress', {
  fileIds: 'file-id',
  settings: {
    quality: 'medium', // 'screen' | 'ebook' | 'printer' | 'prepress'
  },
});
```

### Image Resize

```typescript
const jobId = await processTool('image-resize', {
  fileIds: 'image-id',
  settings: {
    width: 800,
    height: 600,
    maintainAspectRatio: true,
  },
});
```

### Excel to CSV

```typescript
const jobId = await processTool('excel-to-csv', {
  fileIds: 'excel-id',
  settings: {
    delimiter: ',',
    includeHeaders: true,
  },
});
```

---

## 🎯 Best Practices

### 1. Error Handling

```typescript
try {
  const result = await uploadFile(file);
  // Handle success
} catch (error: any) {
  if (error.response?.status === 400) {
    alert('Invalid file type or size');
  } else if (error.response?.status === 401) {
    alert('Unauthorized - please log in');
  } else {
    alert('An error occurred');
  }
}
```

### 2. Progress Indicators

Always show progress to users for long-running operations:

```typescript
const [progress, setProgress] = useState(0);
const [currentStep, setCurrentStep] = useState('');

await pollJobStatus(jobId, (status) => {
  setProgress(status.progress);
  setCurrentStep(status.currentStep);
});

// In your component:
<div>
  <ProgressBar value={progress} />
  <p>{currentStep}</p>
</div>
```

### 3. File Size Validation

```typescript
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

function validateFile(file: File): boolean {
  if (file.size > MAX_FILE_SIZE) {
    alert('File too large (max 100MB)');
    return false;
  }
  return true;
}
```

### 4. Type Safety

```typescript
// Define types for all API responses
interface UploadResponse {
  fileId: string;
  originalName: string;
  size: number;
  mimeType: string;
}

interface ToolDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  acceptedFormats: string[];
  multipleFiles: boolean;
}
```

---

## 📚 Full API Reference

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference with all 192 endpoints.

---

## 🔗 Useful Links

- **API Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Implementation Plan**: [IMPLEMENTATION_Plan.md](./IMPLEMENTATION_Plan.md)
- **Backend README**: [README.md](./README.md)

---

## 📞 Support

For questions or issues:
- Check the API documentation
- Review example code above
- Check backend logs for errors
- Ensure Redis is running for job queue

Happy coding! 🚀
