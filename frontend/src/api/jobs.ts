import { apiClient } from './client';
import { JobStatus } from '../types';

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

        if (onProgress) {
          onProgress(status);
        }

        if (status.status === 'completed') {
          resolve(status);
        } else if (status.status === 'failed') {
          reject(new Error(status.errorMessage || 'Processing failed'));
        } else {
          setTimeout(checkStatus, interval);
        }
      } catch (error) {
        reject(error);
      }
    };

    checkStatus();
  });
}

export async function getAllJobs(userId?: string, limit = 50): Promise<JobStatus[]> {
  const params = userId ? { userId, limit } : { limit };
  const response = await apiClient.get('/jobs', { params });
  return response.data.data;
}
