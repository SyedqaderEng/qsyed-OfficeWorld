import React, { useState } from 'react';
import { ToolWorkflow } from '../../components/ToolWorkflow';
import './ToolPages.css';

export function PDFMergePage() {
  const [mergeOrder, setMergeOrder] = useState<'upload' | 'alphabetical' | 'reverse'>('upload');
  const [addPageNumbers, setAddPageNumbers] = useState(false);
  const [pageNumberPosition, setPageNumberPosition] = useState<'top' | 'bottom'>('bottom');

  const renderSettings = () => (
    <div className="tool-settings">
      <div className="setting-group">
        <label className="setting-label">Merge Order</label>
        <select
          className="setting-select"
          value={mergeOrder}
          onChange={(e) => setMergeOrder(e.target.value as any)}
        >
          <option value="upload">Upload order</option>
          <option value="alphabetical">Alphabetical (A-Z)</option>
          <option value="reverse">Reverse alphabetical (Z-A)</option>
        </select>
        <p className="setting-hint">
          Choose how files should be ordered in the merged PDF
        </p>
      </div>

      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={addPageNumbers}
            onChange={(e) => setAddPageNumbers(e.target.checked)}
          />
          <span>Add page numbers to merged PDF</span>
        </label>
      </div>

      {addPageNumbers && (
        <div className="setting-group indent">
          <label className="setting-label">Page Number Position</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="pageNumberPosition"
                value="top"
                checked={pageNumberPosition === 'top'}
                onChange={(e) => setPageNumberPosition(e.target.value as any)}
              />
              <span>Top of page</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="pageNumberPosition"
                value="bottom"
                checked={pageNumberPosition === 'bottom'}
                onChange={(e) => setPageNumberPosition(e.target.value as any)}
              />
              <span>Bottom of page</span>
            </label>
          </div>
        </div>
      )}

      <div className="settings-preview">
        <h4>Preview</h4>
        <div className="preview-content">
          <p>
            Files will be merged in{' '}
            <strong>
              {mergeOrder === 'upload' && 'upload order'}
              {mergeOrder === 'alphabetical' && 'alphabetical order (A-Z)'}
              {mergeOrder === 'reverse' && 'reverse alphabetical order (Z-A)'}
            </strong>
          </p>
          {addPageNumbers && (
            <p>
              Page numbers will appear at the <strong>{pageNumberPosition}</strong> of each page
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ToolWorkflow
      toolId="pdf-merge"
      toolName="PDF Merge"
      toolDescription="Combine multiple PDF files into a single document"
      acceptedFormats={['.pdf']}
      multipleFiles={true}
      onSettingsRender={renderSettings}
      defaultSettings={{
        mergeOrder,
        addPageNumbers,
        pageNumberPosition,
      }}
    />
  );
}
