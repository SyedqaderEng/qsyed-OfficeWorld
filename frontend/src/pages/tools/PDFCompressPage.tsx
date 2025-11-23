import React, { useState } from 'react';
import { ToolWorkflow } from '../../components/ToolWorkflow';
import './ToolPages.css';

export function PDFCompressPage() {
  const [quality, setQuality] = useState<'screen' | 'ebook' | 'printer' | 'prepress'>('ebook');
  const [optimizeImages, setOptimizeImages] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(true);

  const qualityInfo = {
    screen: {
      dpi: 72,
      description: 'Lowest quality, smallest size - ideal for screen viewing',
      reduction: '~70-80%',
    },
    ebook: {
      dpi: 150,
      description: 'Good quality, moderate size - recommended for most use cases',
      reduction: '~50-60%',
    },
    printer: {
      dpi: 300,
      description: 'High quality, larger size - suitable for printing',
      reduction: '~30-40%',
    },
    prepress: {
      dpi: 300,
      description: 'Maximum quality, minimal compression - for professional printing',
      reduction: '~10-20%',
    },
  };

  const currentQuality = qualityInfo[quality];

  const renderSettings = () => (
    <div className="tool-settings">
      <div className="setting-group">
        <label className="setting-label">Compression Quality</label>
        <div className="quality-options">
          {Object.entries(qualityInfo).map(([key, info]) => (
            <label
              key={key}
              className={`quality-card ${quality === key ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="quality"
                value={key}
                checked={quality === key}
                onChange={(e) => setQuality(e.target.value as any)}
                style={{ display: 'none' }}
              />
              <div className="quality-name">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
              <div className="quality-dpi">{info.dpi} DPI</div>
              <div className="quality-reduction">{info.reduction} smaller</div>
            </label>
          ))}
        </div>
        <p className="setting-hint">{currentQuality.description}</p>
      </div>

      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={optimizeImages}
            onChange={(e) => setOptimizeImages(e.target.checked)}
          />
          <span>Optimize embedded images</span>
        </label>
        <p className="setting-hint">
          Reduces image quality and resolution to decrease file size
        </p>
      </div>

      <div className="setting-group">
        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={removeDuplicates}
            onChange={(e) => setRemoveDuplicates(e.target.checked)}
          />
          <span>Remove duplicate resources</span>
        </label>
        <p className="setting-hint">
          Removes duplicate fonts, images, and other embedded resources
        </p>
      </div>

      <div className="settings-preview compression-preview">
        <h4>Expected Results</h4>
        <div className="preview-content">
          <div className="compression-stat">
            <div className="stat-label">Quality Level</div>
            <div className="stat-value">{quality.toUpperCase()}</div>
          </div>
          <div className="compression-stat">
            <div className="stat-label">DPI</div>
            <div className="stat-value">{currentQuality.dpi}</div>
          </div>
          <div className="compression-stat">
            <div className="stat-label">Expected Reduction</div>
            <div className="stat-value">{currentQuality.reduction}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ToolWorkflow
      toolId="pdf-compress"
      toolName="PDF Compress"
      toolDescription="Reduce PDF file size while maintaining quality"
      acceptedFormats={['.pdf']}
      multipleFiles={false}
      onSettingsRender={renderSettings}
      defaultSettings={{
        quality,
        optimizeImages,
        removeDuplicates,
      }}
    />
  );
}
