import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllTools } from '../api/tools';
import './ToolsPage.css';

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  icon?: string;
  acceptedFormats: string[];
  multipleFiles: boolean;
}

const categoryInfo = {
  pdf: { name: 'PDF Tools', icon: '📄', color: '#ef4444' },
  word: { name: 'Word Tools', icon: '📝', color: '#3b82f6' },
  excel: { name: 'Excel Tools', icon: '📊', color: '#10b981' },
  image: { name: 'Image Tools', icon: '🖼️', color: '#f59e0b' },
  video: { name: 'Video Tools', icon: '🎬', color: '#8b5cf6' },
  audio: { name: 'Audio Tools', icon: '🎵', color: '#ec4899' },
  archive: { name: 'Archive Tools', icon: '📦', color: '#6366f1' },
  utility: { name: 'Utility Tools', icon: '🔧', color: '#14b8a6' },
};

export function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      console.log('\n🔍 Loading all tools...');
      const data = await getAllTools();
      setTools(data);
      console.log(`✅ Loaded ${data.length} tools`);
    } catch (error: any) {
      console.error('❌ Failed to load tools:', error);
      setError('Failed to load tools. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = !selectedCategory || tool.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toolsByCategory = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  const totalToolsCount = Object.keys(toolsByCategory).reduce(
    (count, category) => count + toolsByCategory[category].length,
    0
  );

  if (loading) {
    return (
      <div className="tools-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading tools...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tools-page">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadTools}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tools-page">
      <div className="tools-header">
        <h1 className="tools-title">All Tools</h1>
        <p className="tools-subtitle">
          Browse our collection of {tools.length} powerful document processing tools
        </p>
      </div>

      <div className="tools-filters">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filters">
          <button
            className={`category-filter ${!selectedCategory ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            All Categories ({tools.length})
          </button>
          {Object.entries(categoryInfo).map(([key, info]) => {
            const count = tools.filter((t) => t.category === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                className={`category-filter ${selectedCategory === key ? 'active' : ''}`}
                onClick={() => setSelectedCategory(key)}
                style={{
                  borderColor: selectedCategory === key ? info.color : undefined,
                  color: selectedCategory === key ? info.color : undefined,
                }}
              >
                {info.icon} {info.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {totalToolsCount === 0 ? (
        <div className="no-results">
          <p>No tools found matching your search.</p>
        </div>
      ) : (
        <div className="tools-content">
          {Object.entries(toolsByCategory).map(([category, categoryTools]) => {
            const info = categoryInfo[category as keyof typeof categoryInfo];
            if (!info) return null;

            return (
              <div key={category} className="category-section">
                <div className="category-header">
                  <h2 className="category-title" style={{ color: info.color }}>
                    {info.icon} {info.name}
                  </h2>
                  <span className="category-count">{categoryTools.length} tools</span>
                </div>

                <div className="tools-grid">
                  {categoryTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} categoryColor={info.color} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ToolCard({ tool, categoryColor }: { tool: Tool; categoryColor: string }) {
  // Map tool IDs to their routes
  const getToolRoute = (toolId: string) => {
    // For now, we have specific routes for our implemented tools
    const routeMap: Record<string, string> = {
      'pdf-split': '/tools/pdf-split',
      'pdf-merge': '/tools/pdf-merge',
      'pdf-compress': '/tools/pdf-compress',
      'pdf-to-word': '/tools/pdf-to-word',
      'pdf-ocr': '/tools/ocr',
    };

    return routeMap[toolId] || `/tools/${toolId}`;
  };

  return (
    <Link to={getToolRoute(tool.id)} className="tool-card">
      <div className="tool-icon" style={{ background: `${categoryColor}15` }}>
        <span style={{ color: categoryColor }}>
          {tool.icon || categoryInfo[tool.category as keyof typeof categoryInfo]?.icon || '🔧'}
        </span>
      </div>
      <div className="tool-info">
        <h3 className="tool-name">{tool.name}</h3>
        <p className="tool-description">{tool.description}</p>
        <div className="tool-formats">
          {tool.acceptedFormats.slice(0, 3).map((format) => (
            <span key={format} className="format-tag">
              {format}
            </span>
          ))}
          {tool.acceptedFormats.length > 3 && (
            <span className="format-tag">+{tool.acceptedFormats.length - 3}</span>
          )}
        </div>
      </div>
      <div className="tool-arrow" style={{ color: categoryColor }}>
        →
      </div>
    </Link>
  );
}
