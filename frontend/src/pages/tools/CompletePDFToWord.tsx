import React, { useState, useRef, useCallback } from 'react';
import { useToast } from '../../components/Toast';
import { ProgressBar, StepIndicator } from '../../components/ProgressBar';
import { PageGrid, Page } from '../../components/PageGrid';
import { validateFile, formatFileSize } from '../../utils/fileValidation';
import { classifyError, logError, isRetryable, getRetryDelay, DetailedError, RetryStrategy } from '../../utils/errorHandling';
import { uploadFile } from '../../api/upload';
import { processTool } from '../../api/tools';
import { pollJobStatus } from '../../api/jobs';
import { downloadFile } from '../../api/download';
import './CompletePDFToWord.css';

type WorkflowStep = 'intake' | 'preview' | 'configure' | 'processing' | 'complete';

export function CompletePDFToWordPage() {
  const [step, setStep] = useState<WorkflowStep>('intake');
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);

  // Settings
  const [outputFormat, setOutputFormat] = useState<'docx' | 'doc'>('docx');
  const [ocrEnabled, setOcrEnabled] = useState(false);
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [includeImages, setIncludeImages] = useState(true);
  const [pageRange, setPageRange] = useState<'all' | 'selected'>('all');

  // Processing state
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [outputFileId, setOutputFileId] = useState<string | null>(null);
  const [error, setError] = useState<DetailedError | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const steps = ['Select File', 'Preview & Select Pages', 'Configure Options', 'Processing', 'Download'];
  const currentStepIndex = ['intake', 'preview', 'configure', 'processing', 'complete'].indexOf(step);

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
   * Handle file selection
   */
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileSelected(e.target.files[0]);
    }
  };

  /**
   * Validate and process selected file
   */
  const handleFileSelected = async (selectedFile: File) => {
    console.log('\n📁 FILE SELECTED:', selectedFile.name);
    setError(null);

    // Validate file
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

    // Auto-proceed to upload
    await handleUpload(selectedFile);
  };

  /**
   * Upload file with retry
   */
  const handleUpload = async (fileToUpload: File, attemptNumber: number = 0) => {
    setUploading(true);
    setError(null);

    try {
      console.log(`\n📤 UPLOAD ATTEMPT #${attemptNumber + 1}`);
      console.log(`   File: ${fileToUpload.name} (${formatFileSize(fileToUpload.size)})`);

      const result = await uploadFile(fileToUpload);

      console.log(`   ✅ Upload complete! File ID: ${result.fileId}`);
      setFileId(result.fileId);
      setRetryAttempt(0);

      // Generate mock preview pages
      await generatePreview(result.fileId);

      setStep('preview');
      toast.showSuccess('Upload Complete', 'Generating preview...');
    } catch (err: any) {
      console.error('   ❌ Upload failed');

      const detailedError = classifyError(err, {
        step: 'upload',
        fileName: fileToUpload.name,
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
   * Generate preview (mock for now - backend would provide real thumbnails)
   */
  const generatePreview = async (uploadedFileId: string) => {
    console.log('\n🖼️  GENERATING PREVIEW');
    console.log(`   File ID: ${uploadedFileId}`);

    // Mock: Generate 10 pages as example
    // In production, backend would return actual thumbnail URLs
    const mockPages: Page[] = Array.from({ length: 10 }, (_, i) => ({
      id: `page-${i + 1}`,
      pageNumber: i + 1,
      thumbnailUrl: `https://via.placeholder.com/150x200/667eea/ffffff?text=Page+${i + 1}`,
      width: 612,
      height: 792,
      selected: false,
    }));

    setPages(mockPages);
    console.log(`   ✅ Generated ${mockPages.length} page previews`);
  };

  /**
   * Handle page selection
   */
  const handlePageSelect = (pageId: string) => {
    setSelectedPages((prev) => {
      const newSet = new Set(prev);
      newSet.add(pageId);
      return newSet;
    });

    setPages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, selected: true } : p))
    );
  };

  const handlePageDeselect = (pageId: string) => {
    setSelectedPages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(pageId);
      return newSet;
    });

    setPages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, selected: false } : p))
    );
  };

  const handleSelectAll = () => {
    const allPageIds = new Set(pages.map((p) => p.id));
    setSelectedPages(allPageIds);
    setPages((prev) => prev.map((p) => ({ ...p, selected: true })));
  };

  const handleDeselectAll = () => {
    setSelectedPages(new Set());
    setPages((prev) => prev.map((p) => ({ ...p, selected: false })));
  };

  /**
   * Process with retry
   */
  const handleProcess = async (attemptNumber: number = 0) => {
    if (!fileId) return;

    setProcessing(true);
    setError(null);
    setProgress(0);
    setStep('processing');

    try {
      console.log(`\n🔧 PROCESSING ATTEMPT #${attemptNumber + 1}`);
      console.log('   Tool: PDF to Word (pdf-to-word)');
      console.log('   Settings:', {
        outputFormat,
        pageRange,
        selectedPages: pageRange === 'selected' ? Array.from(selectedPages) : 'all',
        ocrEnabled,
        preserveLayout,
        includeImages,
      });

      const settings: any = {
        outputFormat,
        ocrEnabled,
        preserveLayout,
        includeImages,
      };

      if (pageRange === 'selected' && selectedPages.size > 0) {
        settings.pages = Array.from(selectedPages)
          .map((id) => parseInt(id.replace('page-', '')))
          .sort((a, b) => a - b);
      }

      const jobId = await processTool('pdf-to-word', {
        fileIds: fileId,
        settings,
      });

      console.log(`   ✅ Job created: ${jobId}`);

      const result = await pollJobStatus(jobId, (status) => {
        console.log(`   Progress: ${status.progress}% - ${status.currentStep}`);
        setProgress(status.progress);
        setCurrentStep(status.currentStep);
      });

      console.log(`   ✅ Processing complete!`);
      setOutputFileId(result.outputFileId!);
      setStep('complete');
      setRetryAttempt(0);

      toast.showSuccess(
        'Conversion Complete',
        'Your PDF has been converted to Word successfully'
      );
    } catch (err: any) {
      console.error('   ❌ Processing failed');

      const detailedError = classifyError(err, {
        step: 'processing',
        toolId: 'pdf-to-word',
        fileId,
        settings: { outputFormat, pageRange, ocrEnabled, preserveLayout, includeImages },
        attempt: attemptNumber + 1,
      });

      setError(detailedError);
      logError(detailedError);

      const maxAttempts = 2;
      if (isRetryable(detailedError, maxAttempts, attemptNumber + 1)) {
        const delay = getRetryDelay(RetryStrategy.EXPONENTIAL_BACKOFF, attemptNumber + 1);

        toast.showWarning(
          'Processing Failed - Retrying',
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
          detailedError.retryStrategy === RetryStrategy.REFRESH_FILE
            ? {
                label: 'Upload New File',
                onClick: handleReset,
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
   * Download result
   */
  const handleDownload = async () => {
    if (!outputFileId) return;

    try {
      console.log('\n📥 DOWNLOADING FILE');
      await downloadFile(outputFileId, `converted.${outputFormat}`);
      toast.showSuccess('Download Started', 'Your file is being downloaded');
    } catch (err: any) {
      const detailedError = classifyError(err, { step: 'download', outputFileId });
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
    setStep('intake');
    setFile(null);
    setFileId(null);
    setPages([]);
    setSelectedPages(new Set());
    setProgress(0);
    setCurrentStep('');
    setOutputFileId(null);
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
          Convert PDF documents to editable Word files with advanced options
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
        {/* Step 1: File Intake */}
        {step === 'intake' && (
          <div className="workflow-step">
            <h2>Select Your PDF File</h2>
            <p className="step-description">
              Choose a PDF file to convert to Word format
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
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Preview & Select Pages */}
        {step === 'preview' && (
          <div className="workflow-step">
            <h2>Preview & Select Pages</h2>
            <p className="step-description">
              Review your PDF and select which pages to convert
            </p>

            <div className="page-range-selector">
              <label className="radio-option">
                <input
                  type="radio"
                  name="pageRange"
                  value="all"
                  checked={pageRange === 'all'}
                  onChange={() => setPageRange('all')}
                />
                <span>Convert all pages ({pages.length} pages)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="pageRange"
                  value="selected"
                  checked={pageRange === 'selected'}
                  onChange={() => setPageRange('selected')}
                />
                <span>Convert selected pages only</span>
              </label>
            </div>

            {pages.length > 0 && (
              <PageGrid
                pages={pages}
                onPageSelect={handlePageSelect}
                onPageDeselect={handlePageDeselect}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                showControls={pageRange === 'selected'}
              />
            )}

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={handleReset}>
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setStep('configure')}
                disabled={pageRange === 'selected' && selectedPages.size === 0}
              >
                Continue to Settings
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Configure Options */}
        {step === 'configure' && (
          <div className="workflow-step">
            <h2>Configure Conversion Options</h2>
            <p className="step-description">
              Customize how your PDF will be converted
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

              {/* Options */}
              <div className="setting-group">
                <label className="setting-label">Conversion Options</label>

                <label className="setting-checkbox">
                  <input
                    type="checkbox"
                    checked={preserveLayout}
                    onChange={(e) => setPreserveLayout(e.target.checked)}
                  />
                  <span>Preserve original layout</span>
                </label>

                <label className="setting-checkbox">
                  <input
                    type="checkbox"
                    checked={includeImages}
                    onChange={(e) => setIncludeImages(e.target.checked)}
                  />
                  <span>Include images</span>
                </label>

                <label className="setting-checkbox">
                  <input
                    type="checkbox"
                    checked={ocrEnabled}
                    onChange={(e) => setOcrEnabled(e.target.checked)}
                  />
                  <span>Enable OCR for scanned PDFs</span>
                </label>
              </div>

              {/* Summary */}
              <div className="settings-summary">
                <h4>Conversion Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Output Format:</span>
                    <span className="summary-value">{outputFormat.toUpperCase()}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Pages:</span>
                    <span className="summary-value">
                      {pageRange === 'all'
                        ? `All ${pages.length} pages`
                        : `${selectedPages.size} selected pages`}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Layout:</span>
                    <span className="summary-value">
                      {preserveLayout ? 'Preserved' : 'Optimized for editing'}
                    </span>
                  </div>
                  {ocrEnabled && (
                    <div className="summary-item">
                      <span className="summary-label">OCR:</span>
                      <span className="summary-value">Enabled</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep('preview')}>
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

        {/* Step 4: Processing */}
        {step === 'processing' && (
          <div className="workflow-step">
            <h2>Converting Your PDF</h2>
            <p className="step-description">
              Please wait while we convert your PDF to Word
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
              <p>⏳ This may take a few moments depending on file size and options selected</p>
              <p>💡 Do not close this window or navigate away</p>
              {ocrEnabled && <p>🔍 OCR processing may take additional time</p>}
            </div>
          </div>
        )}

        {/* Step 5: Complete */}
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
                  <div className="info-label">Pages Converted</div>
                  <div className="info-value">
                    {pageRange === 'all' ? pages.length : selectedPages.size}
                  </div>
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
          </div>
        )}
      </div>
    </div>
  );
}
