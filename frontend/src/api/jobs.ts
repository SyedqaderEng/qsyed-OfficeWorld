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
  console.log('\n⏳ Polling Job Status:');
  console.log('   Job ID:', jobId);
  console.log('   Interval:', interval + 'ms');

  let pollCount = 0;

  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        pollCount++;
        console.log(`   📊 Poll #${pollCount} - Checking status...`);

        const status = await getJobStatus(jobId);

        console.log(`   Status: ${status.status} (${status.progress}%)`);
        console.log(`   Step: ${status.currentStep}`);

        if (onProgress) {
          onProgress(status);
        }

        if (status.status === 'completed') {
          console.log('   ✅ Job completed successfully!');
          console.log('   Output File ID:', status.outputFileId);
          console.log('   Download URL:', status.downloadUrl);
          console.log('---');
          resolve(status);
        } else if (status.status === 'failed') {
          console.error('   ❌ Job failed!');
          console.error('   Error:', status.errorMessage);
          console.log('---');
          reject(new Error(status.errorMessage || 'Processing failed'));
        } else {
          console.log(`   ⏳ Still processing... checking again in ${interval}ms`);
          setTimeout(checkStatus, interval);
        }
      } catch (error) {
        console.error('   ❌ Error polling job status:', error);
        console.log('---');
        reject(error);
      }
    };

    checkStatus();
  });
}

export async function getAllJobs(userId?: string, limit = 50): Promise<JobStatus[]> {
  console.log('\n📋 Get All Jobs:');
  console.log('   User ID:', userId || 'All users');
  console.log('   Limit:', limit);

  const params = userId ? { userId, limit } : { limit };
  const response = await apiClient.get('/jobs', { params });

  console.log('   ✅ Jobs loaded:', response.data.data.length);
  console.log('---');

  return response.data.data;
}
