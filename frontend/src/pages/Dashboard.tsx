import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PRICING_PLANS } from '../constants/pricing';
import { uploadFile } from '../api/upload';
import { processTool } from '../api/tools';
import { pollJobStatus } from '../api/jobs';
import { downloadFile } from '../api/download';
import './Dashboard.css';

export function Dashboard() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [toolId, setToolId] = useState('pdf-compress');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState('');

  const currentPlan = PRICING_PLANS.find((p) => p.name === user?.plan);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setProcessing(true);
    setProgress(0);
    setError('');

    try {
      // Upload file
      setCurrentStep('Uploading file...');
      const uploadResult = await uploadFile(file);

      // Start processing
      setCurrentStep('Starting processing...');
      const jobId = await processTool(toolId, {
        fileIds: uploadResult.fileId,
        settings: {},
      });

      // Poll for completion
      const result = await pollJobStatus(jobId, (status) => {
        setProgress(status.progress);
        setCurrentStep(status.currentStep);
      });

      // Download result
      if (result.outputFileId) {
        downloadFile(result.outputFileId, `processed-${file.name}`);
        setCurrentStep('Download started!');
      }
    } catch (err: any) {
      console.error('Processing failed:', err);
      setError(err.message || 'Processing failed. Please try again.');
    } finally {
      setProcessing(false);
      setProgress(0);
      setTimeout(() => setCurrentStep(''), 3000);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* User Plan Section */}
        <div className="plan-info-section">
          <div className="plan-info-card">
            <div className="plan-header">
              <h2 className="plan-name">Your Plan: {user?.plan}</h2>
              {user?.plan === 'Free' && (
                <div className="free-plan-indicator">
                  Free Plan Active
                </div>
              )}
            </div>

            {currentPlan && (
              <div className="plan-details">
                <div className="plan-stat">
                  <div className="stat-label">Daily Requests</div>
                  <div className="stat-value">{currentPlan.maxRequests}</div>
                </div>
                <div className="plan-stat">
                  <div className="stat-label">Max File Size</div>
                  <div className="stat-value">{currentPlan.maxFileSize}</div>
                </div>
                {user?.plan !== 'Pro' && (
                  <div className="upgrade-section">
                    <p className="upgrade-text">
                      Upgrade to unlock more features and higher limits
                    </p>
                    <a href="#pricing" className="upgrade-button">
                      View Plans
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* File Processing Section */}
        <div className="processing-section">
          <h2 className="section-heading">Process Your Files</h2>

          <div className="upload-card">
            <div className="form-group">
              <label className="form-label">Select Tool</label>
              <select
                className="form-select"
                value={toolId}
                onChange={(e) => setToolId(e.target.value)}
                disabled={processing}
              >
                <optgroup label="PDF Tools">
                  <option value="pdf-compress">PDF Compress</option>
                  <option value="pdf-merge">PDF Merge</option>
                  <option value="pdf-split">PDF Split</option>
                  <option value="pdf-to-word">PDF to Word</option>
                  <option value="pdf-to-images">PDF to Images</option>
                </optgroup>
                <optgroup label="Image Tools">
                  <option value="image-resize">Image Resize</option>
                  <option value="image-compress">Image Compress</option>
                  <option value="image-convert">Image Convert</option>
                </optgroup>
                <optgroup label="Word Tools">
                  <option value="word-to-pdf">Word to PDF</option>
                  <option value="word-compress">Word Compress</option>
                </optgroup>
                <optgroup label="Excel Tools">
                  <option value="excel-to-csv">Excel to CSV</option>
                  <option value="excel-to-pdf">Excel to PDF</option>
                </optgroup>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select File</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="file-input"
                  className="file-input"
                  onChange={handleFileChange}
                  disabled={processing}
                />
                <label htmlFor="file-input" className="file-input-label">
                  {file ? file.name : 'Choose a file'}
                </label>
              </div>
            </div>

            <button
              className="process-button"
              onClick={handleProcess}
              disabled={!file || processing}
            >
              {processing ? 'Processing...' : 'Process File'}
            </button>

            {error && <div className="error-message">{error}</div>}

            {processing && (
              <div className="progress-section">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {progress}% - {currentStep}
                </div>
              </div>
            )}

            {!processing && currentStep && (
              <div className="success-message">{currentStep}</div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-section">
          <h2 className="section-heading">Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-number">0</div>
              <div className="stat-label">Files Processed Today</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📁</div>
              <div className="stat-number">0</div>
              <div className="stat-label">Total Files</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-number">0</div>
              <div className="stat-label">Processing Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
