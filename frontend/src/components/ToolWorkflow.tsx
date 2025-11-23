import React, { useState, ReactNode } from 'react';
import { uploadFile, uploadMultipleFiles } from '../api/upload';
import { processTool } from '../api/tools';
import { pollJobStatus } from '../api/jobs';
import { downloadFile } from '../api/download';
import { ProgressBar, StepIndicator } from './ProgressBar';
import './ToolWorkflow.css';

export type WorkflowStep = 'upload' | 'configure' | 'processing' | 'complete';

interface ToolWorkflowProps {
  toolId: string;
  toolName: string;
  toolDescription: string;
  acceptedFormats: string[];
  multipleFiles?: boolean;
  children?: ReactNode; // For custom settings UI
  onSettingsRender?: () => ReactNode;
  defaultSettings?: Record<string, any>;
}

export function ToolWorkflow({
  toolId,
  toolName,
  toolDescription,
  acceptedFormats,
  multipleFiles = false,
  children,
  onSettingsRender,
  defaultSettings = {},
}: ToolWorkflowProps) {
  const [step, setStep] = useState<WorkflowStep>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>(defaultSettings);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [outputFileId, setOutputFileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = ['Upload Files', 'Configure Settings', 'Processing', 'Download'];
  const currentStepIndex = ['upload', 'configure', 'processing', 'complete'].indexOf(step);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      // Validate file types
      const validFiles = selectedFiles.filter((file) => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return acceptedFormats.includes(extension);
      });

      if (validFiles.length !== selectedFiles.length) {
        setError(`Only ${acceptedFormats.join(', ')} files are accepted`);
      } else {
        setError(null);
      }

      setFiles(validFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      console.log(`\n📤 Uploading ${files.length} file(s) for ${toolName}...`);

      if (multipleFiles && files.length > 1) {
        const results = await uploadMultipleFiles(files);
        setFileIds(results.map((r: any) => r.fileId));
      } else {
        const result = await uploadFile(files[0]);
        setFileIds([result.fileId]);
      }

      console.log('✅ Upload complete!');
      setStep('configure');
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      setError(error.response?.data?.error?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleProcess = async () => {
    if (fileIds.length === 0) return;

    setProcessing(true);
    setError(null);
    setProgress(0);
    setStep('processing');

    try {
      console.log(`\n🔧 Processing with ${toolId}...`);

      const jobId = await processTool(toolId, {
        fileIds: multipleFiles ? fileIds : fileIds[0],
        settings,
      });

      console.log('   Job ID:', jobId);

      const result = await pollJobStatus(jobId, (status) => {
        setProgress(status.progress);
        setCurrentStep(status.currentStep);
      });

      setOutputFileId(result.outputFileId!);
      setStep('complete');
      console.log('✅ Processing complete!');
    } catch (error: any) {
      console.error('❌ Processing failed:', error);
      setError(error.message || 'Processing failed. Please try again.');
      setStep('configure');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (outputFileId) {
      downloadFile(outputFileId, `${toolId}-output.pdf`);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFiles([]);
    setFileIds([]);
    setSettings(defaultSettings);
    setProgress(0);
    setCurrentStep('');
    setOutputFileId(null);
    setError(null);
  };

  return (
    <div className="tool-workflow">
      <div className="workflow-header">
        <h1 className="workflow-title">{toolName}</h1>
        <p className="workflow-description">{toolDescription}</p>
      </div>

      <StepIndicator steps={steps} currentStep={currentStepIndex} />

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="workflow-content">
        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="workflow-step">
            <h2>Upload Your {multipleFiles ? 'Files' : 'File'}</h2>
            <p className="step-description">
              Accepted formats: {acceptedFormats.join(', ')}
            </p>

            <div className="file-upload-area">
              <input
                type="file"
                id="file-input"
                className="file-input"
                onChange={handleFileSelect}
                accept={acceptedFormats.join(',')}
                multiple={multipleFiles}
              />
              <label htmlFor="file-input" className="file-upload-label">
                <div className="upload-icon">📁</div>
                <div className="upload-text">
                  Click to browse or drag and drop
                </div>
                <div className="upload-hint">
                  {multipleFiles ? 'Multiple files allowed' : 'Single file only'}
                </div>
              </label>
            </div>

            {files.length > 0 && (
              <div className="selected-files">
                <h3>Selected Files ({files.length})</h3>
                <ul>
                  {files.map((file, index) => (
                    <li key={index}>
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload & Continue'}
            </button>
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 'configure' && (
          <div className="workflow-step">
            <h2>Configure Settings</h2>
            <p className="step-description">
              Customize the settings for your {toolName.toLowerCase()} operation
            </p>

            <div className="settings-area">
              {onSettingsRender ? onSettingsRender() : children}
            </div>

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep('upload')}>
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleProcess}
                disabled={processing}
              >
                Start Processing
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <div className="workflow-step">
            <h2>Processing Your Files</h2>
            <p className="step-description">
              Please wait while we process your files...
            </p>

            <div className="processing-area">
              <ProgressBar
                progress={progress}
                currentStep={currentStep}
                showPercentage
              />
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && (
          <div className="workflow-step">
            <div className="success-icon">✅</div>
            <h2>Processing Complete!</h2>
            <p className="step-description">
              Your file has been processed successfully
            </p>

            <div className="complete-actions">
              <button className="btn btn-primary btn-large" onClick={handleDownload}>
                📥 Download Result
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                Process Another File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Export a helper for updating settings
export function useSetting<T>(
  initialValue: T
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  return [value, setValue];
}
