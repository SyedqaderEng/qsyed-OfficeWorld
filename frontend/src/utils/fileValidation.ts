/**
 * File Validation Utility
 * Enterprise-grade file validation with magic byte checking
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  detectedType?: string;
  expectedType?: string;
  suggestion?: string;
}

// File signatures (magic bytes) for common formats
const FILE_SIGNATURES: Record<string, { signature: number[][]; offset: number }> = {
  pdf: {
    signature: [[0x25, 0x50, 0x44, 0x46]], // %PDF
    offset: 0,
  },
  jpg: {
    signature: [[0xff, 0xd8, 0xff]],
    offset: 0,
  },
  png: {
    signature: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    offset: 0,
  },
  docx: {
    signature: [[0x50, 0x4b, 0x03, 0x04]], // ZIP format (DOCX is zipped XML)
    offset: 0,
  },
  xlsx: {
    signature: [[0x50, 0x4b, 0x03, 0x04]], // ZIP format
    offset: 0,
  },
  zip: {
    signature: [[0x50, 0x4b, 0x03, 0x04], [0x50, 0x4b, 0x05, 0x06]],
    offset: 0,
  },
  rar: {
    signature: [[0x52, 0x61, 0x72, 0x21, 0x1a, 0x07]],
    offset: 0,
  },
  gif: {
    signature: [[0x47, 0x49, 0x46, 0x38]], // GIF8
    offset: 0,
  },
  mp4: {
    signature: [[0x66, 0x74, 0x79, 0x70]], // ftyp
    offset: 4,
  },
  mp3: {
    signature: [[0x49, 0x44, 0x33], [0xff, 0xfb]], // ID3 or MPEG
    offset: 0,
  },
};

/**
 * Read file header bytes
 */
async function readFileHeader(file: File, length: number = 12): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const blob = file.slice(0, length);

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Check if bytes match a signature
 */
function matchesSignature(bytes: Uint8Array, signature: number[], offset: number): boolean {
  if (bytes.length < offset + signature.length) {
    return false;
  }

  for (let i = 0; i < signature.length; i++) {
    if (bytes[offset + i] !== signature[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Detect file type from magic bytes
 */
async function detectFileType(file: File): Promise<string | null> {
  try {
    const header = await readFileHeader(file, 12);

    for (const [type, { signature, offset }] of Object.entries(FILE_SIGNATURES)) {
      for (const sig of signature) {
        if (matchesSignature(header, sig, offset)) {
          return type;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error detecting file type:', error);
    return null;
  }
}

/**
 * Validate file against expected formats
 */
export async function validateFile(
  file: File,
  acceptedFormats: string[]
): Promise<ValidationResult> {
  console.log('\n🔍 VALIDATING FILE:');
  console.log('   File name:', file.name);
  console.log('   File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
  console.log('   MIME type:', file.type);
  console.log('   Expected formats:', acceptedFormats.join(', '));

  // Check file size (max 200MB for Pro plan)
  const maxSize = 200 * 1024 * 1024;
  if (file.size > maxSize) {
    console.error('   ❌ File too large');
    return {
      isValid: false,
      error: 'File size exceeds maximum limit',
      suggestion: `Maximum file size is ${maxSize / 1024 / 1024}MB. Please upgrade your plan or use a smaller file.`,
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    console.error('   ❌ File is empty');
    return {
      isValid: false,
      error: 'File is empty',
      suggestion: 'The selected file contains no data. Please select a valid file.',
    };
  }

  // Extract extension from filename
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  console.log('   File extension:', fileExtension);

  // Check if extension is in accepted formats
  if (!acceptedFormats.includes(fileExtension)) {
    console.error('   ❌ Invalid file extension');
    return {
      isValid: false,
      error: `Invalid file format: ${fileExtension}`,
      expectedType: acceptedFormats.join(', '),
      suggestion: `This tool only accepts ${acceptedFormats.join(', ')} files. Please select a different file.`,
    };
  }

  // Detect actual file type from magic bytes
  console.log('   🔬 Analyzing file signature...');
  const detectedType = await detectFileType(file);
  console.log('   Detected type:', detectedType || 'unknown');

  // Map extensions to internal types
  const extensionTypeMap: Record<string, string> = {
    '.pdf': 'pdf',
    '.jpg': 'jpg',
    '.jpeg': 'jpg',
    '.png': 'png',
    '.gif': 'gif',
    '.docx': 'docx',
    '.doc': 'docx', // Can't distinguish DOC from DOCX by signature
    '.xlsx': 'xlsx',
    '.xls': 'xlsx',
    '.zip': 'zip',
    '.rar': 'rar',
    '.mp4': 'mp4',
    '.mp3': 'mp3',
  };

  const expectedType = extensionTypeMap[fileExtension];

  // If we detected a type, verify it matches
  if (detectedType && expectedType) {
    if (detectedType !== expectedType) {
      console.error('   ❌ File signature mismatch!');
      console.error('   Expected:', expectedType);
      console.error('   Detected:', detectedType);
      return {
        isValid: false,
        error: 'File type mismatch',
        detectedType: detectedType,
        expectedType: expectedType,
        suggestion: `This file appears to be a ${detectedType.toUpperCase()} file, but has a ${fileExtension} extension. The file may be corrupted or renamed. Please ensure you're uploading a valid ${expectedType.toUpperCase()} file.`,
      };
    }
  }

  // Special validation for PDF files
  if (expectedType === 'pdf') {
    const isValidPDF = await validatePDFStructure(file);
    if (!isValidPDF) {
      console.error('   ❌ Invalid PDF structure');
      return {
        isValid: false,
        error: 'Invalid or corrupted PDF file',
        suggestion: 'The PDF file appears to be corrupted or incomplete. Try opening it in a PDF reader to verify, or try a different file.',
      };
    }
  }

  console.log('   ✅ File validation passed');
  return {
    isValid: true,
    detectedType: detectedType || undefined,
  };
}

/**
 * Validate PDF structure
 */
async function validatePDFStructure(file: File): Promise<boolean> {
  try {
    // Read first 1KB and last 1KB to check PDF structure
    const headerPromise = readFileHeader(file, 1024);
    const footerPromise = readFileFooter(file, 1024);

    const [header, footer] = await Promise.all([headerPromise, footerPromise]);

    // Check for PDF header
    const pdfHeader = [0x25, 0x50, 0x44, 0x46]; // %PDF
    if (!matchesSignature(header, pdfHeader, 0)) {
      console.error('   PDF header missing');
      return false;
    }

    // Check for PDF version (1.0-1.7 or 2.0)
    const versionMatch = String.fromCharCode(...header.slice(0, 8)).match(/%PDF-(\d+\.\d+)/);
    if (!versionMatch) {
      console.error('   PDF version not found');
      return false;
    }
    console.log('   PDF version:', versionMatch[1]);

    // Check for EOF marker in footer
    const footerStr = String.fromCharCode(...footer);
    if (!footerStr.includes('%%EOF')) {
      console.warn('   ⚠️  PDF EOF marker not found (file may be incomplete)');
      // Don't fail validation, as some PDFs might not have proper EOF
    }

    return true;
  } catch (error) {
    console.error('   Error validating PDF structure:', error);
    return false;
  }
}

/**
 * Read file footer bytes
 */
async function readFileFooter(file: File, length: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const start = Math.max(0, file.size - length);
    const blob = file.slice(start, file.size);

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Validate multiple files
 */
export async function validateFiles(
  files: File[],
  acceptedFormats: string[]
): Promise<{ valid: File[]; invalid: { file: File; result: ValidationResult }[] }> {
  const results = await Promise.all(
    files.map(async (file) => ({
      file,
      result: await validateFile(file, acceptedFormats),
    }))
  );

  return {
    valid: results.filter((r) => r.result.isValid).map((r) => r.file),
    invalid: results.filter((r) => !r.result.isValid),
  };
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate file name for security
 */
export function validateFileName(fileName: string): ValidationResult {
  // Check for path traversal attacks
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return {
      isValid: false,
      error: 'Invalid file name',
      suggestion: 'File name contains invalid characters. Please rename the file.',
    };
  }

  // Check for excessively long names
  if (fileName.length > 255) {
    return {
      isValid: false,
      error: 'File name too long',
      suggestion: 'File name must be less than 255 characters. Please rename the file.',
    };
  }

  // Check for dangerous characters
  const dangerousChars = /[<>:"|?*\x00-\x1f]/;
  if (dangerousChars.test(fileName)) {
    return {
      isValid: false,
      error: 'Invalid characters in file name',
      suggestion: 'File name contains invalid characters. Please rename the file.',
    };
  }

  return { isValid: true };
}
