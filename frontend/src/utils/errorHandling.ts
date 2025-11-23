/**
 * Enterprise Error Handling System
 * Detailed error classification, logging, and recovery mechanisms
 */

import axios, { AxiosError } from 'axios';

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  RATE_LIMIT = 'RATE_LIMIT',
  FILE_SIZE = 'FILE_SIZE',
  FILE_FORMAT = 'FILE_FORMAT',
  FILE_CORRUPTED = 'FILE_CORRUPTED',
  PROCESSING = 'PROCESSING',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface DetailedError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  technicalDetails: string;
  suggestion: string;
  canRetry: boolean;
  retryStrategy?: RetryStrategy;
  timestamp: string;
  context?: Record<string, any>;
}

export enum RetryStrategy {
  IMMEDIATE = 'IMMEDIATE',
  EXPONENTIAL_BACKOFF = 'EXPONENTIAL_BACKOFF',
  MANUAL = 'MANUAL',
  REFRESH_FILE = 'REFRESH_FILE',
  NONE = 'NONE',
}

/**
 * Parse and classify error
 */
export function classifyError(error: any, context?: Record<string, any>): DetailedError {
  console.error('\n❌ ERROR OCCURRED:');
  console.error('   Raw error:', error);
  console.error('   Context:', context);

  const timestamp = new Date().toISOString();

  // Network errors (no response from server)
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    // No response - network error
    if (!axiosError.response) {
      console.error('   Classification: NETWORK ERROR');
      console.error('   Possible causes:');
      console.error('   - Backend server is not running');
      console.error('   - CORS not configured on backend');
      console.error('   - Network connection lost');
      console.error('   - Firewall blocking request');

      return {
        type: ErrorType.NETWORK,
        severity: ErrorSeverity.HIGH,
        message: 'Network Error',
        userMessage: 'Unable to connect to the server',
        technicalDetails: `Network request failed: ${axiosError.message}. No response received from ${axiosError.config?.url}`,
        suggestion: 'Please check:\n1. Backend server is running\n2. Network connection is stable\n3. Firewall is not blocking the request\n4. Try refreshing the page',
        canRetry: true,
        retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF,
        timestamp,
        context: {
          url: axiosError.config?.url,
          method: axiosError.config?.method,
          code: axiosError.code,
        },
      };
    }

    const status = axiosError.response.status;
    const responseData = axiosError.response.data as any;

    console.error('   HTTP Status:', status);
    console.error('   Response data:', responseData);

    // 400 - Bad Request (Validation errors)
    if (status === 400) {
      const errorMessage = responseData?.error?.message || responseData?.message || 'Invalid request';

      return {
        type: ErrorType.VALIDATION,
        severity: ErrorSeverity.MEDIUM,
        message: 'Validation Error',
        userMessage: errorMessage,
        technicalDetails: `HTTP 400: ${errorMessage}. Details: ${JSON.stringify(responseData?.error?.details || {})}`,
        suggestion: 'Please check your input and try again. If the problem persists, try uploading a different file.',
        canRetry: true,
        retryStrategy: RetryStrategy.REFRESH_FILE,
        timestamp,
        context: { status, responseData },
      };
    }

    // 401 - Unauthorized
    if (status === 401) {
      return {
        type: ErrorType.AUTHENTICATION,
        severity: ErrorSeverity.HIGH,
        message: 'Authentication Required',
        userMessage: 'You need to log in to use this feature',
        technicalDetails: `HTTP 401: ${responseData?.error?.message || 'Unauthorized'}`,
        suggestion: 'Please log in and try again.',
        canRetry: false,
        retryStrategy: RetryStrategy.NONE,
        timestamp,
        context: { status, responseData },
      };
    }

    // 403 - Forbidden
    if (status === 403) {
      return {
        type: ErrorType.AUTHORIZATION,
        severity: ErrorSeverity.HIGH,
        message: 'Access Denied',
        userMessage: 'You do not have permission to perform this action',
        technicalDetails: `HTTP 403: ${responseData?.error?.message || 'Forbidden'}`,
        suggestion: 'This feature may require a premium plan. Please upgrade your account or contact support.',
        canRetry: false,
        retryStrategy: RetryStrategy.NONE,
        timestamp,
        context: { status, responseData },
      };
    }

    // 413 - Payload Too Large
    if (status === 413) {
      return {
        type: ErrorType.FILE_SIZE,
        severity: ErrorSeverity.MEDIUM,
        message: 'File Too Large',
        userMessage: 'The file you uploaded is too large',
        technicalDetails: `HTTP 413: File exceeds server size limit`,
        suggestion: 'Please use a smaller file or upgrade your plan for larger file limits.',
        canRetry: true,
        retryStrategy: RetryStrategy.REFRESH_FILE,
        timestamp,
        context: { status, responseData },
      };
    }

    // 415 - Unsupported Media Type
    if (status === 415) {
      return {
        type: ErrorType.FILE_FORMAT,
        severity: ErrorSeverity.MEDIUM,
        message: 'Unsupported File Format',
        userMessage: 'This file format is not supported',
        technicalDetails: `HTTP 415: ${responseData?.error?.message || 'Unsupported media type'}`,
        suggestion: 'Please upload a file in one of the supported formats.',
        canRetry: true,
        retryStrategy: RetryStrategy.REFRESH_FILE,
        timestamp,
        context: { status, responseData },
      };
    }

    // 422 - Unprocessable Entity (File corrupted)
    if (status === 422) {
      return {
        type: ErrorType.FILE_CORRUPTED,
        severity: ErrorSeverity.MEDIUM,
        message: 'File Processing Error',
        userMessage: 'The file appears to be corrupted or incomplete',
        technicalDetails: `HTTP 422: ${responseData?.error?.message || 'Unprocessable entity'}`,
        suggestion: 'The file may be corrupted. Please try:\n1. Re-downloading the original file\n2. Using a different file\n3. Verifying the file opens correctly in its native application',
        canRetry: true,
        retryStrategy: RetryStrategy.REFRESH_FILE,
        timestamp,
        context: { status, responseData },
      };
    }

    // 429 - Too Many Requests (Rate limit)
    if (status === 429) {
      const retryAfter = axiosError.response.headers['retry-after'];
      return {
        type: ErrorType.RATE_LIMIT,
        severity: ErrorSeverity.MEDIUM,
        message: 'Rate Limit Exceeded',
        userMessage: 'You have exceeded your request limit',
        technicalDetails: `HTTP 429: Rate limit exceeded. Retry after: ${retryAfter || 'unknown'}`,
        suggestion: `You've reached your plan's request limit. Please:\n1. Wait ${retryAfter || 'a few minutes'} before trying again\n2. Upgrade your plan for higher limits`,
        canRetry: true,
        retryStrategy: RetryStrategy.MANUAL,
        timestamp,
        context: { status, responseData, retryAfter },
      };
    }

    // 500 - Internal Server Error
    if (status >= 500) {
      const errorId = responseData?.error?.id || 'N/A';
      return {
        type: ErrorType.SERVER_ERROR,
        severity: ErrorSeverity.CRITICAL,
        message: 'Server Error',
        userMessage: 'The server encountered an error while processing your request',
        technicalDetails: `HTTP ${status}: ${responseData?.error?.message || 'Internal server error'}. Error ID: ${errorId}`,
        suggestion: 'This is a server-side issue. Please:\n1. Try again in a few moments\n2. If the problem persists, contact support with error ID: ' + errorId,
        canRetry: true,
        retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF,
        timestamp,
        context: { status, responseData, errorId },
      };
    }

    // 502, 503, 504 - Service unavailable
    if (status === 502 || status === 503 || status === 504) {
      return {
        type: ErrorType.SERVER_ERROR,
        severity: ErrorSeverity.HIGH,
        message: 'Service Unavailable',
        userMessage: 'The service is temporarily unavailable',
        technicalDetails: `HTTP ${status}: Service unavailable or gateway timeout`,
        suggestion: 'The server is experiencing high load or undergoing maintenance. Please try again in a few minutes.',
        canRetry: true,
        retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF,
        timestamp,
        context: { status, responseData },
      };
    }
  }

  // Timeout errors
  if (error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') {
    return {
      type: ErrorType.TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      message: 'Request Timeout',
      userMessage: 'The request took too long to complete',
      technicalDetails: `Request timeout: ${error.message}`,
      suggestion: 'The file may be too large or the server is busy. Please:\n1. Try a smaller file\n2. Try again later\n3. Check your network connection',
      canRetry: true,
      retryStrategy: RetryStrategy.EXPONENTIAL_BACKOFF,
      timestamp,
      context,
    };
  }

  // File validation errors
  if (error.type === 'validation') {
    return {
      type: ErrorType.FILE_FORMAT,
      severity: ErrorSeverity.LOW,
      message: 'File Validation Failed',
      userMessage: error.message || 'The file failed validation',
      technicalDetails: error.details || error.message,
      suggestion: error.suggestion || 'Please select a valid file and try again.',
      canRetry: true,
      retryStrategy: RetryStrategy.REFRESH_FILE,
      timestamp,
      context,
    };
  }

  // Processing errors
  if (error.step === 'processing') {
    return {
      type: ErrorType.PROCESSING,
      severity: ErrorSeverity.MEDIUM,
      message: 'Processing Failed',
      userMessage: 'An error occurred while processing your file',
      technicalDetails: error.message || 'Processing error',
      suggestion: 'The file could not be processed. This may be due to:\n1. File corruption\n2. Unsupported file features\n3. Server processing error\n\nPlease try a different file or contact support.',
      canRetry: true,
      retryStrategy: RetryStrategy.REFRESH_FILE,
      timestamp,
      context,
    };
  }

  // Unknown errors
  console.error('   Classification: UNKNOWN ERROR');
  return {
    type: ErrorType.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    message: 'Unexpected Error',
    userMessage: 'An unexpected error occurred',
    technicalDetails: error.message || JSON.stringify(error),
    suggestion: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    canRetry: true,
    retryStrategy: RetryStrategy.MANUAL,
    timestamp,
    context: { originalError: error, ...context },
  };
}

/**
 * Log error to console and potentially external service
 */
export function logError(error: DetailedError): void {
  console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('🚨 ERROR REPORT');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('Type:', error.type);
  console.error('Severity:', error.severity);
  console.error('Timestamp:', error.timestamp);
  console.error('Message:', error.message);
  console.error('User Message:', error.userMessage);
  console.error('Technical Details:', error.technicalDetails);
  console.error('Suggestion:', error.suggestion);
  console.error('Can Retry:', error.canRetry);
  console.error('Retry Strategy:', error.retryStrategy);
  if (error.context) {
    console.error('Context:', JSON.stringify(error.context, null, 2));
  }
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // In production, send to error tracking service (Sentry, LogRocket, etc.)
  // sendToErrorTracking(error);
}

/**
 * Get retry delay based on strategy and attempt
 */
export function getRetryDelay(strategy: RetryStrategy, attempt: number): number {
  switch (strategy) {
    case RetryStrategy.IMMEDIATE:
      return 0;
    case RetryStrategy.EXPONENTIAL_BACKOFF:
      // 2^attempt * 1000ms (1s, 2s, 4s, 8s, 16s)
      return Math.min(Math.pow(2, attempt) * 1000, 30000);
    case RetryStrategy.MANUAL:
    case RetryStrategy.REFRESH_FILE:
    case RetryStrategy.NONE:
      return 0;
  }
}

/**
 * Check if error is retryable
 */
export function isRetryable(error: DetailedError, maxAttempts: number, currentAttempt: number): boolean {
  if (!error.canRetry) {
    return false;
  }

  if (currentAttempt >= maxAttempts) {
    console.warn(`   Max retry attempts (${maxAttempts}) reached`);
    return false;
  }

  // Don't auto-retry these types - require user action
  const manualRetryTypes = [
    ErrorType.AUTHENTICATION,
    ErrorType.AUTHORIZATION,
    ErrorType.FILE_SIZE,
    ErrorType.FILE_FORMAT,
    ErrorType.FILE_CORRUPTED,
  ];

  if (manualRetryTypes.includes(error.type)) {
    return false;
  }

  return true;
}
