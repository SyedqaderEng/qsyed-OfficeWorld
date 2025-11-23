import React, { useState } from 'react';
import { ToolWorkflow } from '../../components/ToolWorkflow';
import './ToolPages.css';

export function PDFToWordPage() {
  const [outputFormat, setOutputFormat] = useState<'docx' | 'doc'>('docx');
  const [ocrEnabled, setOcrEnabled] = useState(false);
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [includeImages, setIncludeImages] = useState(true);
  const [pageRange, setPageRange] = useState<'all' | 'custom'>('all');
  const [customPages, setCustomPages] = useState('');

  const renderSettings = () => (
    <div className="tool-settings">
      <div className="setting-group">
        <label className="setting-label">Output Format</label>
        <div className="format-grid">
          <label className={`format-card ${outputFormat === 'docx' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="outputFormat"
              value="docx"
              checked={outputFormat === 'docx'}
              onChange={(e) => setOutputFormat(e.target.value as any)}
              style={{ display: 'none' }}
            />
            <div className="format-icon">📄</div>
            <div className="format-name">Word 2007+</div>
            <div className="format-ext">.docx</div>
          </label>
          <label className={`format-card ${outputFormat === 'doc' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="outputFormat"
              value="doc"
              checked={outputFormat === 'doc'}
              onChange={(e) => setOutputFormat(e.target.value as any)}
              style={{ display: 'none' }}
            />
            <div className="format-icon">📃</div>
            <div className="format-name">Word 97-2003</div>
            <div className="format-ext">.doc</div>
          </label>
        </div>
      </div>

      <div className="setting-group">
        <label className="setting-label">Page Range</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="pageRange"
              value="all"
              checked={pageRange === 'all'}
              onChange={(e) => setPageRange(e.target.value as any)}
            />
            <span>Convert all pages</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="pageRange"
              value="custom"
              checked={pageRange === 'custom'}
              onChange={(e) => setPageRange(e.target.value as any)}
            />
            <span>Custom page range</span>
          </label>
        </div>
      </div>

      {pageRange === 'custom' && (
        <div className="setting-group indent">
          <label className="setting-label">Pages</label>
          <input
            type="text"
            className="setting-input"
            placeholder="e.g., 1-5, 10, 15-20"
            value={customPages}
            onChange={(e) => setCustomPages(e.target.value)}
          />
          <p className="setting-hint">
            Enter page numbers separated by commas, use hyphens for ranges
          </p>
        </div>
      )}

      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={preserveLayout}
            onChange={(e) => setPreserveLayout(e.target.checked)}
          />
          <span>Preserve original layout</span>
        </label>
        <p className="setting-hint">
          Attempts to maintain the original PDF layout in Word
        </p>
      </div>

      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={includeImages}
            onChange={(e) => setIncludeImages(e.target.checked)}
          />
          <span>Include images</span>
        </label>
        <p className="setting-hint">
          Extract and embed images from PDF into Word document
        </p>
      </div>

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
          Extract text from images and scanned documents (may increase processing time)
        </p>
      </div>

      <div className="settings-preview">
        <h4>Conversion Summary</h4>
        <div className="preview-content">
          <p>Output: <strong>{outputFormat.toUpperCase()}</strong> format</p>
          <p>Pages: <strong>{pageRange === 'all' ? 'All pages' : customPages || 'Not specified'}</strong></p>
          <p>Layout: <strong>{preserveLayout ? 'Preserved' : 'Optimized for editing'}</strong></p>
          {ocrEnabled && <p>OCR: <strong>Enabled</strong></p>}
        </div>
      </div>
    </div>
  );

  return (
    <ToolWorkflow
      toolId="pdf-to-word"
      toolName="PDF to Word"
      toolDescription="Convert PDF documents to editable Word files (.docx or .doc)"
      acceptedFormats={['.pdf']}
      multipleFiles={false}
      onSettingsRender={renderSettings}
      defaultSettings={{
        outputFormat,
        ocrEnabled,
        preserveLayout,
        includeImages,
        pageRange,
        customPages,
      }}
    />
  );
}
