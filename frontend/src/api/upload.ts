import { apiClient } from './client';
import { UploadResponse } from '../types';

export async function uploadFile(file: File): Promise<UploadResponse> {
  console.log('\n📤 Upload File:');
  console.log('   Name:', file.name);
  console.log('   Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
  console.log('   Type:', file.type);

  const formData = new FormData();
  formData.append('file', file);

  console.log('   Uploading to: /upload');

  const response = await apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  console.log('   ✅ Upload complete!');
  console.log('   File ID:', response.data.data.fileId);
  console.log('---');

  return response.data.data;
}

export async function uploadMultipleFiles(files: File[]): Promise<UploadResponse[]> {
  console.log('\n📤 Upload Multiple Files:');
  console.log('   Count:', files.length);
  files.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  });

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  console.log('   Uploading to: /upload/multiple');

  const response = await apiClient.post('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  console.log('   ✅ All uploads complete!');
  console.log('   Files uploaded:', response.data.data.length);
  console.log('---');

  return response.data.data;
}
