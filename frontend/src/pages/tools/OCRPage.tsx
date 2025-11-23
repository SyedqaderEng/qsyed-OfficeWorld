import React, { useState } from 'react';
import { ToolWorkflow } from '../../components/ToolWorkflow';
import './ToolPages.css';

export function OCRPage() {
  const [language, setLanguage] = useState('eng');
  const [outputFormat, setOutputFormat] = useState<'pdf' | 'text'>('pdf');
  const [autoRotate, setAutoRotate] = useState(true);
  const [deskew, setDeskew] = useState(true);
  const [removeNoise, setRemoveNoise] = useState(true);
  const [enhanceContrast, setEnhanceContrast] = useState(true);

  const languages = [
    { code: 'eng', name: 'English', flag: '🇺🇸' },
    { code: 'spa', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fra', name: 'French', flag: '🇫🇷' },
    { code: 'deu', name: 'German', flag: '🇩🇪' },
    { code: 'ita', name: 'Italian', flag: '🇮🇹' },
    { code: 'por', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'rus', name: 'Russian', flag: '🇷🇺' },
    { code: 'chi_sim', name: 'Chinese (Simplified)', flag: '🇨🇳' },
    { code: 'jpn', name: 'Japanese', flag: '🇯🇵' },
    { code: 'kor', name: 'Korean', flag: '🇰🇷' },
    { code: 'ara', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hin', name: 'Hindi', flag: '🇮🇳' },
  ];

  const renderSettings = () => (
    <div className="tool-settings">
      <div className="setting-group">
        <label className="setting-label">Document Language</label>
        <div className="language-grid">
          {languages.map((lang) => (
            <label
              key={lang.code}
              className={`language-option ${language === lang.code ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="language"
                value={lang.code}
                checked={language === lang.code}
                onChange={(e) => setLanguage(e.target.value)}
              />
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="setting-group">
        <label className="setting-label">Output Format</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="outputFormat"
              value="pdf"
              checked={outputFormat === 'pdf'}
              onChange={(e) => setOutputFormat(e.target.value as any)}
            />
            <span>Searchable PDF (recommended)</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="outputFormat"
              value="text"
              checked={outputFormat === 'text'}
              onChange={(e) => setOutputFormat(e.target.value as any)}
            />
            <span>Plain text file</span>
          </label>
        </div>
      </div>

      <div className="setting-group">
        <h3 className="setting-label">Image Preprocessing</h3>
        <p className="setting-hint">
          These options improve OCR accuracy for scanned documents
        </p>

        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(e) => setAutoRotate(e.target.checked)}
          />
          <span>Auto-rotate pages</span>
        </label>

        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={deskew}
            onChange={(e) => setDeskew(e.target.checked)}
          />
          <span>Deskew (straighten) pages</span>
        </label>

        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={removeNoise}
            onChange={(e) => setRemoveNoise(e.target.checked)}
          />
          <span>Remove background noise</span>
        </label>

        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={enhanceContrast}
            onChange={(e) => setEnhanceContrast(e.target.checked)}
          />
          <span>Enhance contrast</span>
        </label>
      </div>

      <div className="settings-preview">
        <h4>OCR Configuration</h4>
        <div className="preview-content">
          <p>
            Language: <strong>{languages.find((l) => l.code === language)?.name}</strong>
          </p>
          <p>
            Output: <strong>{outputFormat === 'pdf' ? 'Searchable PDF' : 'Plain Text'}</strong>
          </p>
          <p>
            Preprocessing:{' '}
            <strong>
              {[autoRotate && 'Auto-rotate', deskew && 'Deskew', removeNoise && 'Denoise', enhanceContrast && 'Enhance']
                .filter(Boolean)
                .join(', ') || 'None'}
            </strong>
          </p>
        </div>
      </div>

      <div className="ocr-info-box">
        <h4>ℹ️ About OCR Processing</h4>
        <ul>
          <li>OCR works best with high-quality scans (300 DPI or higher)</li>
          <li>Processing time depends on document length and quality</li>
          <li>For best results, ensure text is clear and not handwritten</li>
          <li>Searchable PDF format preserves the original appearance</li>
        </ul>
      </div>
    </div>
  );

  return (
    <ToolWorkflow
      toolId="pdf-ocr"
      toolName="PDF OCR"
      toolDescription="Extract text from scanned PDFs and images using Optical Character Recognition"
      acceptedFormats={['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.bmp']}
      multipleFiles={false}
      onSettingsRender={renderSettings}
      defaultSettings={{
        language,
        outputFormat,
        autoRotate,
        deskew,
        removeNoise,
        enhanceContrast,
      }}
    />
  );
}
