import React, { useState, useRef, useCallback } from 'react';
import { useToast } from '../../components/Toast';
import { ProgressBar, StepIndicator } from '../../components/ProgressBar';
import { validateFile, formatFileSize } from '../../utils/fileValidation';
import { classifyError, logError, isRetryable, getRetryDelay, DetailedError, RetryStrategy } from '../../utils/errorHandling';
import { uploadFile } from '../../api/upload';
import { apiClient } from '../../api/client';
import './CompletePDFToWord.css';

type WorkflowStep = 'upload' | 'configure' | 'processing' | 'complete';

type ProcessingState = 'queued' | 'processing' | 'ocr' | 'converting' | 'finalizing' | 'done' | 'failed';

interface StatusResponse {
  requestId: string;
  state: ProcessingState;
  progress: number;
  message: string;
  outputFileToken?: string;
  error?: string;
}

export function CompletePDFToWordPage() {
  const [step, setStep] = useState<WorkflowStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Settings
  const [ocrEnabled, setOcrEnabled] = useState(false);
  const [ocrLanguage, setOcrLanguage] = useState('eng');
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [outputFormat, setOutputFormat] = useState<'docx' | 'doc'>('docx');
  const [password, setPassword] = useState('');

  // Processing state
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('queued');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [outputFileToken, setOutputFileToken] = useState<string | null>(null);
  const [error, setError] = useState<DetailedError | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const steps = ['Upload PDF', 'Configure Options', 'Converting', 'Download'];
  const currentStepIndex = ['upload', 'configure', 'processing', 'complete'].indexOf(step);

  const languages = [
    { code: 'eng', name: 'English' },
    { code: 'spa', name: 'Spanish' },
    { code: 'fra', name: 'French' },
    { code: 'deu', name: 'German' },
    { code: 'ita', name: 'Italian' },
    { code: 'por', name: 'Portuguese' },
    { code: 'ara', name: 'Arabic' },
    { code: 'rus', name: 'Russian' },
    { code: 'chi_sim', name: 'Chinese (Simplified)' },
    { code: 'jpn', name: 'Japanese' },
    { code: 'kor', name: 'Korean' },
    { code: 'hin', name: 'Hindi' },
  ];

  const stateLabels: Record<ProcessingState, string> = {
    queued: 'Queued - Waiting for processing...',
    processing: 'Processing your PDF...',
    ocr: 'Performing OCR text extraction...',
    converting: 'Converting to Word format...',
    finalizing: 'Finalizing document...',
    done: 'Conversion complete!',
    failed: 'Conversion failed',
  };

  /**
   * Handle drag events
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      await handleFileSelected(droppedFiles[0]);
    }
  }, []);

  /**
   * Handle file input change
   */
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileSelected(e.target.files[0]);
    }
  };

  /**
   * Step 1: Validate and upload file
   */
  const handleFileSelected = async (selectedFile: File) => {
    console.log('\n📁 FILE SELECTED:', selectedFile.name);
    setError(null);

    // Validate file
    console.log('🔍 Validating file...');
    const validation = await validateFile(selectedFile, ['.pdf']);

    if (!validation.isValid) {
      console.error('   ❌ Validation failed:', validation.error);

      const detailedError = classifyError(
        { type: 'validation', message: validation.error, details: validation.suggestion },
        { fileName: selectedFile.name, fileSize: selectedFile.size }
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

    console.log('   ✅ File validated successfully');
    setFile(selectedFile);
    toast.showSuccess('File Validated', `${selectedFile.name} is ready for upload`);

    // Auto-upload
    await handleUpload(selectedFile);
  };

  /**
   * Upload file to backend
   */
  const handleUpload = async (fileToUpload: File, attemptNumber: number = 0) => {
    setUploading(true);
    setError(null);

    try {
      console.log(`\n📤 UPLOAD ATTEMPT #${attemptNumber + 1}`);
      console.log(`   Uploading to /api/upload`);
      console.log(`   File: ${fileToUpload.name} (${formatFileSize(fileToUpload.size)})`);

      const result = await uploadFile(fileToUpload);

      console.log(`   ✅ Upload complete!`);
      console.log(`   File ID: ${result.fileId}`);
      console.log(`   Metadata:`, result);

      setFileId(result.fileId);
      setFileMeta(result);
      setRetryAttempt(0);
      setStep('configure');

      toast.showSuccess('Upload Complete', 'Your PDF is ready for conversion');
    } catch (err: any) {
      console.error('   ❌ Upload failed');

      const detailedError = classifyError(err, {
        step: 'upload',
        fileName: fileToUpload.name,
        attempt: attemptNumber + 1,
      });

      setError(detailedError);
      logError(detailedError);

      // Retry logic
      const maxAttempts = 3;
      if (isRetryable(detailedError, maxAttempts, attemptNumber + 1)) {
        const delay = getRetryDelay(RetryStrategy.EXPONENTIAL_BACKOFF, attemptNumber + 1);

        toast.showWarning(
          'Upload Failed - Retrying',
          `Attempt ${attemptNumber + 1}/${maxAttempts}. Retrying in ${delay / 1000}s...`
        );

        setTimeout(() => {
          setRetryAttempt(attemptNumber + 1);
          handleUpload(fileToUpload, attemptNumber + 1);
        }, delay);
      } else {
        toast.showError(
          detailedError.message,
          detailedError.userMessage,
          detailedError.technicalDetails,
          detailedError.retryStrategy === RetryStrategy.REFRESH_FILE
            ? {
                label: 'Select Different File',
                onClick: handleReset,
              }
            : detailedError.canRetry
            ? {
                label: 'Retry Upload',
                onClick: () => handleUpload(fileToUpload, 0),
              }
            : undefined
        );
      }
    } finally {
      setUploading(false);
    }
  };

  /**
   * Step 3: Request conversion
   */
  const handleProcess = async (attemptNumber: number = 0) => {
    if (!fileId) return;

    setProcessing(true);
    setError(null);
    setProgress(0);
    setStep('processing');
    setProcessingState('queued');

    try {
      console.log(`\n🔧 CONVERSION REQUEST #${attemptNumber + 1}`);
      console.log(`   POST /api/process`);
      console.log(`   File ID: ${fileId}`);
      console.log(`   Options:`, {
        outputFormat,
        ocrEnabled,
        ocrLanguage: ocrEnabled ? ocrLanguage : null,
        preserveLayout,
        password: password ? '***' : null,
      });

      // Step 3: POST /api/process
      const payload = {
        fileId,
        tool: 'pdf-to-word',
        options: {
          outputFormat,
          ocrEnabled,
          ocrLanguage: ocrEnabled ? ocrLanguage : undefined,
          preserveLayout,
          password: password || undefined,
        },
      };

      const response = await apiClient.post('/process', payload);
      const newRequestId = response.data.data.requestId;

      console.log(`   ✅ Conversion started!`);
      console.log(`   Request ID: ${newRequestId}`);

      setRequestId(newRequestId);
      setRetryAttempt(0);

      toast.showInfo('Converting', 'Your PDF is being converted to Word...');

      // Step 4: Start polling
      await pollStatus(newRequestId);
    } catch (err: any) {
      console.error('   ❌ Conversion request failed');

      const detailedError = classifyError(err, {
        step: 'processing',
        fileId,
        options: { outputFormat, ocrEnabled, ocrLanguage, preserveLayout },
        attempt: attemptNumber + 1,
      });

      setError(detailedError);
      logError(detailedError);

      const maxAttempts = 2;
      if (isRetryable(detailedError, maxAttempts, attemptNumber + 1)) {
        const delay = getRetryDelay(RetryStrategy.EXPONENTIAL_BACKOFF, attemptNumber + 1);

        toast.showWarning(
          'Conversion Failed - Retrying',
          `Attempt ${attemptNumber + 1}/${maxAttempts}. Retrying in ${delay / 1000}s...`
        );

        setTimeout(() => {
          setRetryAttempt(attemptNumber + 1);
          handleProcess(attemptNumber + 1);
        }, delay);
      } else {
        setStep('configure');

        toast.showError(
          detailedError.message,
          detailedError.userMessage,
          detailedError.technicalDetails,
          {
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
   * Step 4: Poll status
   */
  const pollStatus = async (pollRequestId: string) => {
    console.log(`\n📊 POLLING STATUS`);
    console.log(`   Request ID: ${pollRequestId}`);
    console.log(`   Polling every 2 seconds...`);

    let pollCount = 0;

    return new Promise<void>((resolve, reject) => {
      const checkStatus = async () => {
        try {
          pollCount++;
          console.log(`   Poll #${pollCount} - GET /api/status/${pollRequestId}`);

          const response = await apiClient.get(`/status/${pollRequestId}`);
          const status: StatusResponse = response.data.data;

          console.log(`   State: ${status.state} (${status.progress}%)`);
          console.log(`   Message: ${status.message}`);

          setProcessingState(status.state);
          setProgress(status.progress);
          setStatusMessage(status.message);

          // Update UI based on state
          if (status.state === 'done') {
            console.log(`   ✅ Conversion complete!`);
            console.log(`   Output file token: ${status.outputFileToken}`);

            setOutputFileToken(status.outputFileToken!);
            setStep('complete');

            toast.showSuccess(
              'Conversion Complete',
              'Your Word document is ready for download'
            );

            resolve();
          } else if (status.state === 'failed') {
            console.error(`   ❌ Conversion failed: ${status.error}`);

            const detailedError = classifyError(
              { step: 'processing', message: status.error || 'Conversion failed' },
              { requestId: pollRequestId, state: status.state }
            );

            setError(detailedError);
            logError(detailedError);
            setStep('configure');

            toast.showError(
              'Conversion Failed',
              status.error || 'An error occurred during conversion',
              undefined,
              {
                label: 'Try Again',
                onClick: () => handleProcess(0),
              }
            );

            reject(new Error(status.error));
          } else {
            // Continue polling
            setTimeout(checkStatus, 2000);
          }
        } catch (err: any) {
          console.error(`   ❌ Status check failed:`, err);

          const detailedError = classifyError(err, {
            step: 'polling',
            requestId: pollRequestId,
            pollCount,
          });

          logError(detailedError);

          // Retry polling once on network error
          if (pollCount < 50) {
            // Max 100 seconds
            setTimeout(checkStatus, 2000);
          } else {
            setError(detailedError);
            reject(err);
          }
        }
      };

      checkStatus();
    });
  };

  /**
   * Step 5: Download result
   */
  const handleDownload = async () => {
    if (!outputFileToken) return;

    try {
      console.log('\n📥 DOWNLOADING FILE');
      console.log(`   GET /api/download/${outputFileToken}`);

      const response = await apiClient.get(`/download/${outputFileToken}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `converted.${outputFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      console.log(`   ✅ Download started`);
      toast.showSuccess('Download Started', 'Your file is being downloaded');
    } catch (err: any) {
      console.error('   ❌ Download failed');

      const detailedError = classifyError(err, {
        step: 'download',
        fileToken: outputFileToken,
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
   * Reset workflow
   */
  const handleReset = () => {
    console.log('\n🔄 RESETTING WORKFLOW');
    setStep('upload');
    setFile(null);
    setFileId(null);
    setFileMeta(null);
    setRequestId(null);
    setOutputFileToken(null);
    setProgress(0);
    setProcessingState('queued');
    setStatusMessage('');
    setError(null);
    setRetryAttempt(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="complete-pdf-to-word">
      <div className="workflow-header">
        <h1 className="workflow-title">PDF to Word Converter</h1>
        <p className="workflow-description">
          Convert PDF documents to editable Word files with OCR support
        </p>
      </div>

      <StepIndicator steps={steps} currentStep={currentStepIndex} />

      {/* Error Banner */}
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
            {error.context && <pre>{JSON.stringify(error.context, null, 2)}</pre>}
          </details>

          <div className="error-actions">
            {error.retryStrategy === RetryStrategy.REFRESH_FILE && (
              <button className="btn btn-primary" onClick={handleReset}>
                Select Different File
              </button>
            )}
            {error.canRetry && error.retryStrategy !== RetryStrategy.REFRESH_FILE && (
              <button
                className="btn btn-primary"
                onClick={() => (step === 'configure' ? handleProcess(0) : file && handleUpload(file, 0))}
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
            <h2>Upload Your PDF File</h2>
            <p className="step-description">
              Select a PDF file to convert to Word format
            </p>

            <div
              ref={dropZoneRef}
              className={`drop-zone ${isDragging ? 'dragging' : ''}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="file-input"
                className="file-input"
                onChange={handleFileInputChange}
                accept=".pdf"
              />

              <div className="drop-zone-content">
                <div className="drop-icon">📄</div>
                <h3>Drag & Drop PDF Here</h3>
                <p>or</p>
                <label htmlFor="file-input" className="btn btn-primary">
                  Browse Files
                </label>
                <p className="file-hint">Supported format: PDF • Max size: 200MB</p>
              </div>

              {uploading && (
                <div className="uploading-overlay">
                  <div className="spinner"></div>
                  <p>Uploading{retryAttempt > 0 && ` (Attempt ${retryAttempt + 1})`}...</p>
                </div>
              )}
            </div>

            {file && !uploading && (
              <div className="selected-file-info">
                <div className="file-icon-large">📄</div>
                <div className="file-details">
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{formatFileSize(file.size)}</div>
                  {fileMeta && (
                    <div className="file-meta">
                      {fileMeta.pages && <span>{fileMeta.pages} pages</span>}
                      {fileMeta.format && <span>• {fileMeta.format}</span>}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Configure Options */}
        {step === 'configure' && (
          <div className="workflow-step">
            <h2>Configure Conversion Options</h2>
            <p className="step-description">
              Customize how your PDF will be converted to Word
            </p>

            <div className="settings-panel">
              {/* Output Format */}
              <div className="setting-group">
                <label className="setting-label">Output Format</label>
                <div className="format-buttons">
                  <button
                    className={`format-btn ${outputFormat === 'docx' ? 'active' : ''}`}
                    onClick={() => setOutputFormat('docx')}
                  >
                    <div className="format-icon">📄</div>
                    <div className="format-name">Word 2007+</div>
                    <div className="format-ext">.docx</div>
                  </button>
                  <button
                    className={`format-btn ${outputFormat === 'doc' ? 'active' : ''}`}
                    onClick={() => setOutputFormat('doc')}
                  >
                    <div className="format-icon">📃</div>
                    <div className="format-name">Word 97-2003</div>
                    <div className="format-ext">.doc</div>
                  </button>
                </div>
              </div>

              {/* OCR Options */}
              <div className="setting-group">
                <label className="setting-checkbox">
                  <input
                    type="checkbox"
                    checked={ocrEnabled}
                    onChange={(e) => setOcrEnabled(e.target.checked)}
                  />
                  <span>Enable OCR for scanned PDFs</span>
                </label>
                <p className="setting-hint">
                  Extract text from images and scanned documents
                </p>
              </div>

              {ocrEnabled && (
                <div className="setting-group indent">
                  <label className="setting-label">OCR Language</label>
                  <select
                    className="setting-select"
                    value={ocrLanguage}
                    onChange={(e) => setOcrLanguage(e.target.value)}
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Other Options */}
              <div className="setting-group">
                <label className="setting-checkbox">
                  <input
                    type="checkbox"
                    checked={preserveLayout}
                    onChange={(e) => setPreserveLayout(e.target.checked)}
                  />
                  <span>Preserve original layout</span>
                </label>
              </div>

              {/* Password (optional) */}
              <div className="setting-group">
                <label className="setting-label">PDF Password (if protected)</label>
                <input
                  type="password"
                  className="setting-input"
                  placeholder="Enter password (optional)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Summary */}
              <div className="settings-summary">
                <h4>Conversion Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Output:</span>
                    <span className="summary-value">{outputFormat.toUpperCase()}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">OCR:</span>
                    <span className="summary-value">{ocrEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  {ocrEnabled && (
                    <div className="summary-item">
                      <span className="summary-label">Language:</span>
                      <span className="summary-value">
                        {languages.find((l) => l.code === ocrLanguage)?.name}
                      </span>
                    </div>
                  )}
                  <div className="summary-item">
                    <span className="summary-label">Layout:</span>
                    <span className="summary-value">
                      {preserveLayout ? 'Preserved' : 'Optimized'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={handleReset}>
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleProcess(0)}
                disabled={processing}
              >
                Start Conversion
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <div className="workflow-step">
            <h2>Converting Your PDF</h2>
            <p className="step-description">
              {stateLabels[processingState]}
            </p>

            <div className="processing-area">
              <div className="processing-state-indicator">
                <div className="state-steps">
                  {(['queued', 'processing', 'ocr', 'converting', 'finalizing', 'done'] as ProcessingState[]).map((state) => (
                    <div
                      key={state}
                      className={`state-step ${
                        state === processingState
                          ? 'active'
                          : ['queued', 'processing', 'ocr', 'converting', 'finalizing'].indexOf(state) <
                            ['queued', 'processing', 'ocr', 'converting', 'finalizing'].indexOf(processingState)
                          ? 'completed'
                          : ''
                      }`}
                    >
                      <div className="state-dot"></div>
                      <div className="state-label">{state}</div>
                    </div>
                  ))}
                </div>
              </div>

              <ProgressBar
                progress={progress}
                currentStep={statusMessage}
                showPercentage
              />
            </div>

            <div className="processing-info">
              <p>⏳ This may take a few moments depending on file size</p>
              <p>💡 Do not close this window or navigate away</p>
              {ocrEnabled && <p>🔍 OCR processing may take additional time</p>}
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && (
          <div className="workflow-step">
            <div className="success-icon">✅</div>
            <h2>Conversion Complete!</h2>
            <p className="step-description">
              Your PDF has been successfully converted to Word
            </p>

            <div className="complete-info">
              <div className="info-card">
                <div className="info-icon">📄</div>
                <div className="info-content">
                  <div className="info-label">Output Format</div>
                  <div className="info-value">{outputFormat.toUpperCase()}</div>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">📋</div>
                <div className="info-content">
                  <div className="info-label">Status</div>
                  <div className="info-value">Ready to Download</div>
                </div>
              </div>
            </div>

            <div className="complete-actions">
              <button className="btn btn-primary btn-large" onClick={handleDownload}>
                📥 Download Word Document
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                Convert Another PDF
              </button>
            </div>

            <div className="cleanup-notice">
              <p>🔒 Your files will be automatically deleted from our servers after download</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
