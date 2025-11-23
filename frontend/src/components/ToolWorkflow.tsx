import React, { useState, ReactNode, useRef } from 'react';
import { uploadFile, uploadMultipleFiles } from '../api/upload';
import { processTool } from '../api/tools';
import { pollJobStatus } from '../api/jobs';
import { downloadFile } from '../api/download';
import { ProgressBar, StepIndicator } from './ProgressBar';
import { useToast } from './Toast';
import { validateFile, validateFiles, formatFileSize, validateFileName } from '../utils/fileValidation';
import { classifyError, logError, isRetryable, getRetryDelay, DetailedError, RetryStrategy } from '../utils/errorHandling';
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
  const [error, setError] = useState<DetailedError | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Map<string, string>>(new Map());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const steps = ['Upload Files', 'Configure Settings', 'Processing', 'Download'];
  const currentStepIndex = ['upload', 'configure', 'processing', 'complete'].indexOf(step);

  /**
   * Handle file selection with validation
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const selectedFiles = Array.from(e.target.files);
    console.log(`\n📁 FILES SELECTED: ${selectedFiles.length} file(s)`);

    setError(null);
    setValidationErrors(new Map());

    // Validate file names
    for (const file of selectedFiles) {
      const nameValidation = validateFileName(file.name);
      if (!nameValidation.isValid) {
        toast.showError(
          'Invalid File Name',
          nameValidation.error || 'File name is invalid',
          nameValidation.suggestion
        );
        return;
      }
    }

    // Validate files
    try {
      if (multipleFiles && selectedFiles.length > 1) {
        const validation = await validateFiles(selectedFiles, acceptedFormats);

        if (validation.invalid.length > 0) {
          const errorMap = new Map();
          validation.invalid.forEach(({ file, result }) => {
            errorMap.set(file.name, result.error || 'Validation failed');
            console.error(`   ❌ ${file.name}: ${result.error}`);

            toast.showError(
              `Invalid File: ${file.name}`,
              result.error || 'Validation failed',
              result.suggestion
            );
          });
          setValidationErrors(errorMap);
        }

        if (validation.valid.length > 0) {
          setFiles(validation.valid);
          console.log(`   ✅ ${validation.valid.length} valid file(s)`);
          toast.showSuccess(
            'Files Validated',
            `${validation.valid.length} file(s) ready for upload`
          );
        }
      } else {
        const file = selectedFiles[0];
        const validation = await validateFile(file, acceptedFormats);

        if (!validation.isValid) {
          console.error(`   ❌ Validation failed: ${validation.error}`);

          const detailedError = classifyError(
            { type: 'validation', message: validation.error, details: validation.suggestion },
            { fileName: file.name, fileSize: file.size }
          );

          setError(detailedError);
          logError(detailedError);

          toast.showError(
            detailedError.message,
            detailedError.userMessage,
            detailedError.technicalDetails,
            {
              label: 'Select Different File',
              onClick: () => fileInputRef.current?.click(),
            }
          );
          return;
        }

        setFiles([file]);
        console.log(`   ✅ File validated successfully`);
        toast.showSuccess('File Validated', `${file.name} is ready for upload`);
      }
    } catch (err: any) {
      console.error('   ❌ Validation error:', err);
      toast.showError(
        'Validation Error',
        'Failed to validate file',
        err.message
      );
    }
  };

  /**
   * Handle file upload with retry logic
   */
  const handleUpload = async (attemptNumber: number = 0) => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      console.log(`\n📤 UPLOAD ATTEMPT #${attemptNumber + 1}`);
      console.log(`   Uploading ${files.length} file(s) for ${toolName}...`);
      console.log(`   Tool ID: ${toolId}`);
      console.log(`   Files:`, files.map(f => `${f.name} (${formatFileSize(f.size)})`).join(', '));

      let uploadedFileIds: string[];

      if (multipleFiles && files.length > 1) {
        const results = await uploadMultipleFiles(files);
        uploadedFileIds = results.map((r: any) => r.fileId);
        console.log(`   ✅ ${uploadedFileIds.length} files uploaded`);
      } else {
        const result = await uploadFile(files[0]);
        uploadedFileIds = [result.fileId];
        console.log(`   ✅ File uploaded: ${result.fileId}`);
      }

      setFileIds(uploadedFileIds);
      setRetryAttempt(0);
      setStep('configure');

      toast.showSuccess(
        'Upload Complete',
        `${files.length} file(s) uploaded successfully`
      );
    } catch (err: any) {
      console.error('   ❌ Upload failed');

      const detailedError = classifyError(err, {
        step: 'upload',
        toolId,
        toolName,
        fileCount: files.length,
        attempt: attemptNumber + 1,
      });

      setError(detailedError);
      logError(detailedError);

      // Check if we can retry
      const maxAttempts = 3;
      if (isRetryable(detailedError, maxAttempts, attemptNumber + 1)) {
        const delay = getRetryDelay(RetryStrategy.EXPONENTIAL_BACKOFF, attemptNumber + 1);
        console.log(`   🔄 Retrying in ${delay}ms...`);

        toast.showWarning(
          'Upload Failed - Retrying',
          `Attempt ${attemptNumber + 1}/${maxAttempts}. Retrying in ${delay / 1000}s...`
        );

        setTimeout(() => {
          setRetryAttempt(attemptNumber + 1);
          handleUpload(attemptNumber + 1);
        }, delay);
      } else {
        // Show error toast with action
        toast.showError(
          detailedError.message,
          detailedError.userMessage,
          detailedError.technicalDetails,
          detailedError.retryStrategy === RetryStrategy.REFRESH_FILE
            ? {
                label: 'Select Different File',
                onClick: handleRefreshFile,
              }
            : detailedError.canRetry
            ? {
                label: 'Retry Upload',
                onClick: () => handleUpload(0),
              }
            : undefined
        );
      }
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle processing with retry logic
   */
  const handleProcess = async (attemptNumber: number = 0) => {
    if (fileIds.length === 0) return;

    setProcessing(true);
    setError(null);
    setProgress(0);
    setStep('processing');

    try {
      console.log(`\n🔧 PROCESSING ATTEMPT #${attemptNumber + 1}`);
      console.log(`   Tool: ${toolName} (${toolId})`);
      console.log(`   File IDs:`, fileIds);
      console.log(`   Settings:`, settings);

      const jobId = await processTool(toolId, {
        fileIds: multipleFiles ? fileIds : fileIds[0],
        settings,
      });

      console.log(`   ✅ Job created: ${jobId}`);
      console.log(`   📊 Polling for status...`);

      const result = await pollJobStatus(jobId, (status) => {
        console.log(`   Progress: ${status.progress}% - ${status.currentStep}`);
        setProgress(status.progress);
        setCurrentStep(status.currentStep);
      });

      console.log(`   ✅ Processing complete!`);
      console.log(`   Output file ID: ${result.outputFileId}`);

      setOutputFileId(result.outputFileId!);
      setStep('complete');
      setRetryAttempt(0);

      toast.showSuccess(
        'Processing Complete',
        'Your file has been processed successfully'
      );
    } catch (err: any) {
      console.error('   ❌ Processing failed');

      const detailedError = classifyError(err, {
        step: 'processing',
        toolId,
        toolName,
        fileIds,
        settings,
        attempt: attemptNumber + 1,
        progress,
      });

      setError(detailedError);
      logError(detailedError);

      // Check if we can retry
      const maxAttempts = 2;
      if (isRetryable(detailedError, maxAttempts, attemptNumber + 1)) {
        const delay = getRetryDelay(RetryStrategy.EXPONENTIAL_BACKOFF, attemptNumber + 1);
        console.log(`   🔄 Retrying in ${delay}ms...`);

        toast.showWarning(
          'Processing Failed - Retrying',
          `Attempt ${attemptNumber + 1}/${maxAttempts}. Retrying in ${delay / 1000}s...`
        );

        setTimeout(() => {
          setRetryAttempt(attemptNumber + 1);
          handleProcess(attemptNumber + 1);
        }, delay);
      } else {
        setStep('configure'); // Go back to configure step

        // Show error toast with actions
        toast.showError(
          detailedError.message,
          detailedError.userMessage,
          detailedError.technicalDetails,
          detailedError.retryStrategy === RetryStrategy.REFRESH_FILE
            ? {
                label: 'Upload New File',
                onClick: handleRefreshFile,
              }
            : {
                label: 'Try Again',
                onClick: () => handleProcess(0),
              }
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Handle download with validation
   */
  const handleDownload = async () => {
    if (!outputFileId) return;

    try {
      console.log(`\n📥 DOWNLOADING FILE`);
      console.log(`   Output file ID: ${outputFileId}`);

      await downloadFile(outputFileId, `${toolId}-output.pdf`);

      console.log(`   ✅ Download started`);
      toast.showSuccess('Download Started', 'Your file is being downloaded');
    } catch (err: any) {
      console.error('   ❌ Download failed');

      const detailedError = classifyError(err, {
        step: 'download',
        outputFileId,
      });

      logError(detailedError);

      toast.showError(
        detailedError.message,
        detailedError.userMessage,
        detailedError.technicalDetails,
        {
          label: 'Retry Download',
          onClick: handleDownload,
        }
      );
    }
  };

  /**
   * Refresh/reload file
   */
  const handleRefreshFile = () => {
    console.log('\n🔄 REFRESHING FILE SELECTION');
    setFiles([]);
    setFileIds([]);
    setError(null);
    setValidationErrors(new Map());
    setStep('upload');
    setRetryAttempt(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }

    toast.showInfo('Select New File', 'Please select a new file to upload');
  };

  /**
   * Reset workflow
   */
  const handleReset = () => {
    console.log('\n🔄 RESETTING WORKFLOW');
    setStep('upload');
    setFiles([]);
    setFileIds([]);
    setSettings(defaultSettings);
    setProgress(0);
    setCurrentStep('');
    setOutputFileId(null);
    setError(null);
    setRetryAttempt(0);
    setValidationErrors(new Map());

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="tool-workflow">
      <div className="workflow-header">
        <h1 className="workflow-title">{toolName}</h1>
        <p className="workflow-description">{toolDescription}</p>
      </div>

      <StepIndicator steps={steps} currentStep={currentStepIndex} />

      {/* Error Display */}
      {error && (
        <div className={`error-banner severity-${error.severity.toLowerCase()}`}>
          <div className="error-banner-header">
            <span className="error-icon">⚠️</span>
            <div className="error-content">
              <div className="error-title">{error.message}</div>
              <div className="error-message">{error.userMessage}</div>
            </div>
          </div>

          <div className="error-suggestion">
            <strong>Suggestion:</strong>
            <pre>{error.suggestion}</pre>
          </div>

          <details className="error-technical">
            <summary>Technical Details</summary>
            <pre>{error.technicalDetails}</pre>
            {error.context && (
              <pre>{JSON.stringify(error.context, null, 2)}</pre>
            )}
          </details>

          <div className="error-actions">
            {error.retryStrategy === RetryStrategy.REFRESH_FILE && (
              <button className="btn btn-primary" onClick={handleRefreshFile}>
                Select Different File
              </button>
            )}
            {error.canRetry && error.retryStrategy !== RetryStrategy.REFRESH_FILE && (
              <button
                className="btn btn-primary"
                onClick={() => step === 'configure' ? handleProcess(0) : handleUpload(0)}
              >
                Retry
              </button>
            )}
            <button className="btn btn-secondary" onClick={handleReset}>
              Start Over
            </button>
          </div>
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
                ref={fileInputRef}
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
                    <li key={index} className={validationErrors.has(file.name) ? 'file-error' : ''}>
                      <span className="file-name">
                        {validationErrors.has(file.name) ? '❌' : '✅'} {file.name}
                      </span>
                      <span className="file-size">
                        {formatFileSize(file.size)}
                      </span>
                      {validationErrors.has(file.name) && (
                        <div className="file-error-message">
                          {validationErrors.get(file.name)}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="step-actions">
              <button
                className="btn btn-primary"
                onClick={() => handleUpload(0)}
                disabled={files.length === 0 || uploading || validationErrors.size > 0}
              >
                {uploading ? `Uploading... ${retryAttempt > 0 ? `(Attempt ${retryAttempt + 1})` : ''}` : 'Upload & Continue'}
              </button>
            </div>
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
                onClick={() => handleProcess(0)}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Start Processing'}
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
              {retryAttempt > 0 && ` (Attempt ${retryAttempt + 1})`}
            </p>

            <div className="processing-area">
              <ProgressBar
                progress={progress}
                currentStep={currentStep}
                showPercentage
              />
            </div>

            <div className="processing-info">
              <p>⏳ This may take a few moments depending on file size and complexity</p>
              <p>💡 Do not close this window or navigate away</p>
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
