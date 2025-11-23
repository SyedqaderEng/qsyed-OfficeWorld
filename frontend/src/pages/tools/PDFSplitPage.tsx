import React, { useState } from 'react';
import { ToolWorkflow } from '../../components/ToolWorkflow';
import './ToolPages.css';

export function PDFSplitPage() {
  const [splitMode, setSplitMode] = useState<'pages' | 'range' | 'size'>('pages');
  const [pageRanges, setPageRanges] = useState<string>('');
  const [chunkSize, setChunkSize] = useState<number>(1);

  const renderSettings = () => (
    <div className="tool-settings">
      <div className="setting-group">
        <label className="setting-label">Split Mode</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="splitMode"
              value="pages"
              checked={splitMode === 'pages'}
              onChange={(e) => setSplitMode(e.target.value as any)}
            />
            <span>Extract specific pages</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="splitMode"
              value="range"
              checked={splitMode === 'range'}
              onChange={(e) => setSplitMode(e.target.value as any)}
            />
            <span>Split by page ranges</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="splitMode"
              value="size"
              checked={splitMode === 'size'}
              onChange={(e) => setSplitMode(e.target.value as any)}
            />
            <span>Split into equal chunks</span>
          </label>
        </div>
      </div>

      {splitMode === 'pages' && (
        <div className="setting-group">
          <label className="setting-label">Pages to Extract</label>
          <input
            type="text"
            className="setting-input"
            placeholder="e.g., 1,3,5-7,10"
            value={pageRanges}
            onChange={(e) => setPageRanges(e.target.value)}
          />
          <p className="setting-hint">
            Enter page numbers separated by commas. Use hyphens for ranges (e.g., 1-5)
          </p>
        </div>
      )}

      {splitMode === 'range' && (
        <div className="setting-group">
          <label className="setting-label">Page Ranges</label>
          <input
            type="text"
            className="setting-input"
            placeholder="e.g., 1-3,4-6,7-10"
            value={pageRanges}
            onChange={(e) => setPageRanges(e.target.value)}
          />
          <p className="setting-hint">
            Each range will become a separate PDF file
          </p>
        </div>
      )}

      {splitMode === 'size' && (
        <div className="setting-group">
          <label className="setting-label">Pages per File</label>
          <input
            type="number"
            className="setting-input"
            min="1"
            value={chunkSize}
            onChange={(e) => setChunkSize(parseInt(e.target.value))}
          />
          <p className="setting-hint">
            PDF will be split into chunks of this many pages
          </p>
        </div>
      )}

      <div className="settings-preview">
        <h4>Preview</h4>
        <div className="preview-content">
          {splitMode === 'pages' && (
            <p>
              {pageRanges || 'No pages specified'}
              {pageRanges && ` → ${pageRanges.split(',').length} separate file(s)`}
            </p>
          )}
          {splitMode === 'range' && (
            <p>
              {pageRanges || 'No ranges specified'}
              {pageRanges && ` → ${pageRanges.split(',').length} file(s)`}
            </p>
          )}
          {splitMode === 'size' && (
            <p>
              Split into chunks of {chunkSize} page{chunkSize !== 1 ? 's' : ''} each
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ToolWorkflow
      toolId="pdf-split"
      toolName="PDF Split"
      toolDescription="Split your PDF into multiple files by extracting specific pages or ranges"
      acceptedFormats={['.pdf']}
      multipleFiles={false}
      onSettingsRender={renderSettings}
      defaultSettings={{
        splitMode,
        pageRanges,
        chunkSize,
      }}
    />
  );
}
