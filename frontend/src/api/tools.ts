import { apiClient } from './client';
import { ProcessRequest, ToolDefinition } from '../types';

export async function processTool(toolId: string, request: ProcessRequest): Promise<string> {
  const response = await apiClient.post(`/tools/${toolId}`, request);
  return response.data.data.jobId;
}

export async function getAllTools(category?: string): Promise<ToolDefinition[]> {
  const params = category ? { category } : {};
  const response = await apiClient.get('/tools', { params });
  return response.data.data;
}

export async function getToolDetails(toolId: string): Promise<ToolDefinition> {
  const response = await apiClient.get(`/tools/${toolId}`);
  return response.data.data;
}
