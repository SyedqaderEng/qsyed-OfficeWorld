export type PlanType = 'Free' | 'Basic' | 'Pro';

export interface PricingPlan {
  name: PlanType;
  price: number;
  interval: 'month' | 'year';
  maxRequests: number;
  maxFileSize: string;
  features: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: PlanType;
  createdAt: string;
}

export interface UploadResponse {
  fileId: string;
  originalName: string;
  size: number;
  mimeType: string;
  path: string;
  uploadedAt: string;
}

export interface JobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  downloadUrl?: string;
  outputFileId?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ProcessRequest {
  fileIds: string | string[];
  settings?: Record<string, any>;
  userId?: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  acceptedFormats: string[];
  multipleFiles: boolean;
  settings?: any[];
}
