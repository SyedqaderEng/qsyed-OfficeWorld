import React from 'react';
import './PageGrid.css';

export interface Page {
  id: string;
  pageNumber: number;
  thumbnailUrl: string;
  width: number;
  height: number;
  selected?: boolean;
}

interface PageGridProps {
  pages: Page[];
  onPageSelect?: (pageId: string) => void;
  onPageDeselect?: (pageId: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onPageReorder?: (fromIndex: number, toIndex: number) => void;
  selectionMode?: 'single' | 'multiple';
  showControls?: boolean;
}

export function PageGrid({
  pages,
  onPageSelect,
  onPageDeselect,
  onSelectAll,
  onDeselectAll,
  onPageReorder,
  selectionMode = 'multiple',
  showControls = true,
}: PageGridProps) {
  const selectedCount = pages.filter((p) => p.selected).length;

  const handlePageClick = (page: Page) => {
    if (page.selected && onPageDeselect) {
      onPageDeselect(page.id);
    } else if (!page.selected && onPageSelect) {
      onPageSelect(page.id);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));

    if (fromIndex !== toIndex && onPageReorder) {
      onPageReorder(fromIndex, toIndex);
    }
  };

  return (
    <div className="page-grid-container">
      {showControls && (
        <div className="page-grid-controls">
          <div className="selection-info">
            <span className="selected-count">
              {selectedCount} of {pages.length} pages selected
            </span>
          </div>
          <div className="selection-actions">
            <button
              className="control-btn"
              onClick={onSelectAll}
              disabled={selectedCount === pages.length}
            >
              Select All
            </button>
            <button
              className="control-btn"
              onClick={onDeselectAll}
              disabled={selectedCount === 0}
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      <div className="page-grid">
        {pages.map((page, index) => (
          <div
            key={page.id}
            className={`page-card ${page.selected ? 'selected' : ''}`}
            onClick={() => handlePageClick(page)}
            draggable={onPageReorder !== undefined}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className="page-number">Page {page.pageNumber}</div>
            <div className="page-thumbnail">
              <img
                src={page.thumbnailUrl}
                alt={`Page ${page.pageNumber}`}
                loading="lazy"
              />
            </div>
            {page.selected && (
              <div className="page-selected-indicator">
                <span className="checkmark">✓</span>
              </div>
            )}
            <div className="page-info">
              {page.width} × {page.height}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
