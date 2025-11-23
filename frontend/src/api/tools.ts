import { apiClient } from './client';
import { ProcessRequest, ToolDefinition } from '../types';

export async function processTool(toolId: string, request: ProcessRequest): Promise<string> {
  console.log('\n🔧 Process Tool:');
  console.log('   Tool ID:', toolId);
  console.log('   File IDs:', request.fileIds);
  console.log('   Settings:', request.settings);
  console.log('   User ID:', request.userId || 'None');

  const response = await apiClient.post(`/tools/${toolId}`, request);

  console.log('   ✅ Job created!');
  console.log('   Job ID:', response.data.data.jobId);
  console.log('---');

  return response.data.data.jobId;
}

export async function getAllTools(category?: string): Promise<ToolDefinition[]> {
  console.log('\n📋 Get All Tools:');
  console.log('   Category:', category || 'All');

  const params = category ? { category } : {};
  const response = await apiClient.get('/tools', { params });

  console.log('   ✅ Tools loaded:', response.data.data.length);
  console.log('---');

  return response.data.data;
}

export async function getToolDetails(toolId: string): Promise<ToolDefinition> {
  console.log('\n🔍 Get Tool Details:');
  console.log('   Tool ID:', toolId);

  const response = await apiClient.get(`/tools/${toolId}`);

  console.log('   ✅ Tool details loaded');
  console.log('   Name:', response.data.data.name);
  console.log('---');

  return response.data.data;
}
