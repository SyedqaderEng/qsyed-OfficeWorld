const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function downloadFile(fileId: string, filename?: string) {
  const token = localStorage.getItem('authToken');
  const url = `${API_BASE_URL}/download/${fileId}`;

  fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  })
    .then((response) => response.blob())
    .then((blob) => {
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || fileId;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    })
    .catch((error) => {
      console.error('Download failed:', error);
      alert('Failed to download file');
    });
}
