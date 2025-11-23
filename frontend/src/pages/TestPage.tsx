import React, { useState } from 'react';
import { uploadFile } from '../api/upload';
import { processTool } from '../api/tools';
import { getJobStatus } from '../api/jobs';
import { apiClient } from '../api/client';
import './TestPage.css';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export function TestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: TestResult) => {
    setResults((prev) => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  // Test 1: Health Check
  const testHealth = async () => {
    addResult({ test: 'Health Check', status: 'pending', message: 'Testing...' });
    try {
      const response = await apiClient.get('/health');
      addResult({
        test: 'Health Check',
        status: 'success',
        message: 'Backend is healthy!',
        data: response.data,
      });
    } catch (error: any) {
      addResult({
        test: 'Health Check',
        status: 'error',
        message: error.message,
        data: error.response?.data,
      });
    }
  };

  // Test 2: Get Tools
  const testGetTools = async () => {
    addResult({ test: 'Get Tools', status: 'pending', message: 'Testing...' });
    try {
      const response = await apiClient.get('/tools');
      addResult({
        test: 'Get Tools',
        status: 'success',
        message: `Found ${response.data.data?.length || 0} tools`,
        data: response.data,
      });
    } catch (error: any) {
      addResult({
        test: 'Get Tools',
        status: 'error',
        message: error.message,
        data: error.response?.data,
      });
    }
  };

  // Test 3: Get Specific Tool
  const testGetTool = async (toolId: string) => {
    addResult({ test: `Get Tool: ${toolId}`, status: 'pending', message: 'Testing...' });
    try {
      const response = await apiClient.get(`/tools/${toolId}`);
      addResult({
        test: `Get Tool: ${toolId}`,
        status: 'success',
        message: 'Tool found!',
        data: response.data,
      });
    } catch (error: any) {
      addResult({
        test: `Get Tool: ${toolId}`,
        status: 'error',
        message: error.message,
        data: error.response?.data,
      });
    }
  };

  // Test 4: Upload File
  const testUpload = async (file: File) => {
    addResult({ test: 'Upload File', status: 'pending', message: 'Uploading...' });
    try {
      const result = await uploadFile(file);
      addResult({
        test: 'Upload File',
        status: 'success',
        message: `File uploaded! ID: ${result.fileId}`,
        data: result,
      });
      return result.fileId;
    } catch (error: any) {
      addResult({
        test: 'Upload File',
        status: 'error',
        message: error.message,
        data: error.response?.data,
      });
      return null;
    }
  };

  // Test 5: Process Tool
  const testProcess = async (fileId: string, toolId: string) => {
    addResult({ test: `Process: ${toolId}`, status: 'pending', message: 'Processing...' });
    try {
      const jobId = await processTool(toolId, {
        fileIds: fileId,
        settings: {},
      });
      addResult({
        test: `Process: ${toolId}`,
        status: 'success',
        message: `Job created! ID: ${jobId}`,
        data: { jobId },
      });
      return jobId;
    } catch (error: any) {
      addResult({
        test: `Process: ${toolId}`,
        status: 'error',
        message: error.message,
        data: error.response?.data,
      });
      return null;
    }
  };

  // Test 6: Get Job Status
  const testJobStatus = async (jobId: string) => {
    addResult({ test: 'Job Status', status: 'pending', message: 'Checking...' });
    try {
      const result = await getJobStatus(jobId);
      addResult({
        test: 'Job Status',
        status: 'success',
        message: `Status: ${result.status}`,
        data: result,
      });
    } catch (error: any) {
      addResult({
        test: 'Job Status',
        status: 'error',
        message: error.message,
        data: error.response?.data,
      });
    }
  };

  // Run All Tests
  const runAllTests = async () => {
    setLoading(true);
    clearResults();

    // Test 1: Health
    await testHealth();
    await new Promise((r) => setTimeout(r, 500));

    // Test 2: Get Tools
    await testGetTools();
    await new Promise((r) => setTimeout(r, 500));

    // Test 3: Get Specific Tool
    await testGetTool('pdf-split');
    await new Promise((r) => setTimeout(r, 500));

    setLoading(false);
  };

  // Full Integration Test
  const runFullTest = async (file: File) => {
    setLoading(true);
    clearResults();

    // Step 1: Upload
    const fileId = await testUpload(file);
    if (!fileId) {
      setLoading(false);
      return;
    }
    await new Promise((r) => setTimeout(r, 1000));

    // Step 2: Process
    const jobId = await testProcess(fileId, 'pdf-split');
    if (!jobId) {
      setLoading(false);
      return;
    }
    await new Promise((r) => setTimeout(r, 1000));

    // Step 3: Check Status
    await testJobStatus(jobId);

    setLoading(false);
  };

  return (
    <div className="test-page">
      <div className="test-container">
        <h1 className="test-title">🧪 API Test Suite</h1>
        <p className="test-subtitle">
          Test each API endpoint to diagnose connection issues
        </p>

        {/* Quick Tests */}
        <div className="test-section">
          <h2>Quick Tests</h2>
          <div className="test-buttons">
            <button onClick={testHealth} disabled={loading} className="test-btn">
              1. Test Health
            </button>
            <button onClick={testGetTools} disabled={loading} className="test-btn">
              2. Test Get Tools
            </button>
            <button
              onClick={() => testGetTool('pdf-split')}
              disabled={loading}
              className="test-btn"
            >
              3. Test Get Tool (pdf-split)
            </button>
            <button onClick={runAllTests} disabled={loading} className="test-btn primary">
              Run All Quick Tests
            </button>
          </div>
        </div>

        {/* File Upload Test */}
        <div className="test-section">
          <h2>Full Integration Test</h2>
          <p>Upload a file and try to process it</p>
          <input
            type="file"
            id="test-file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                runFullTest(file);
              }
            }}
            disabled={loading}
            className="test-file-input"
          />
          <label htmlFor="test-file" className="test-file-label">
            {loading ? 'Testing...' : 'Choose File & Run Test'}
          </label>
        </div>

        {/* Test Individual Endpoints */}
        <div className="test-section">
          <h2>Test Specific Endpoints</h2>
          <div className="endpoint-tests">
            <div className="endpoint-test">
              <h3>GET /api/health</h3>
              <button onClick={testHealth} className="test-btn-sm">
                Test
              </button>
            </div>
            <div className="endpoint-test">
              <h3>GET /api/tools</h3>
              <button onClick={testGetTools} className="test-btn-sm">
                Test
              </button>
            </div>
            <div className="endpoint-test">
              <h3>GET /api/tools/pdf-split</h3>
              <button onClick={() => testGetTool('pdf-split')} className="test-btn-sm">
                Test
              </button>
            </div>
            <div className="endpoint-test">
              <h3>GET /api/tools/pdf-compress</h3>
              <button
                onClick={() => testGetTool('pdf-compress')}
                className="test-btn-sm"
              >
                Test
              </button>
            </div>
          </div>
        </div>

        {/* Clear Button */}
        {results.length > 0 && (
          <button onClick={clearResults} className="clear-btn">
            Clear Results
          </button>
        )}

        {/* Results */}
        <div className="test-results">
          <h2>Test Results</h2>
          {results.length === 0 ? (
            <p className="no-results">No tests run yet. Click a test button above.</p>
          ) : (
            <div className="results-list">
              {results.map((result, index) => (
                <div key={index} className={`result-item ${result.status}`}>
                  <div className="result-header">
                    <span className="result-icon">
                      {result.status === 'success'
                        ? '✅'
                        : result.status === 'error'
                        ? '❌'
                        : '⏳'}
                    </span>
                    <span className="result-test">{result.test}</span>
                    <span className="result-status">{result.status}</span>
                  </div>
                  <div className="result-message">{result.message}</div>
                  {result.data && (
                    <details className="result-details">
                      <summary>View Details</summary>
                      <pre>{JSON.stringify(result.data, null, 2)}</pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="test-instructions">
          <h2>How to Use This Page</h2>
          <ol>
            <li>
              <strong>Run All Quick Tests</strong> - Tests health, get tools, and get
              specific tool
            </li>
            <li>
              <strong>Full Integration Test</strong> - Upload a file and try to process it
            </li>
            <li>
              <strong>Individual Tests</strong> - Test specific endpoints one by one
            </li>
            <li>
              <strong>Check Console</strong> - Press F12 to see detailed logs
            </li>
          </ol>

          <h3>Expected Results</h3>
          <ul>
            <li>
              ✅ <strong>Health Check</strong> should return{' '}
              <code>{`{ status: "healthy" }`}</code>
            </li>
            <li>
              ✅ <strong>Get Tools</strong> should return array of tools
            </li>
            <li>
              ✅ <strong>Get Tool</strong> should return tool details
            </li>
            <li>
              ✅ <strong>Upload</strong> should return <code>fileId</code>
            </li>
            <li>
              ✅ <strong>Process</strong> should return <code>jobId</code>
            </li>
          </ul>

          <h3>Common Errors</h3>
          <ul>
            <li>
              ❌ <strong>Network Error</strong> - Backend not running or CORS issue
            </li>
            <li>
              ❌ <strong>404 Not Found</strong> - Endpoint doesn't exist on backend
            </li>
            <li>
              ❌ <strong>500 Server Error</strong> - Backend error, check backend logs
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
