import React from 'react';
import { Link } from 'react-router-dom';
import { Pricing } from '../components/Pricing';
import './LandingPage.css';

export function LandingPage() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Transform Your Files
              <span className="hero-gradient"> Effortlessly</span>
            </h1>
            <p className="hero-description">
              Professional file processing tools for PDF, Word, Excel, Images, Videos, and more.
              192+ tools at your fingertips.
            </p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn btn-primary">
                Get Started Free
              </Link>
              <a href="#pricing" className="btn btn-secondary">
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Powerful File Processing</h2>
          <p className="section-subtitle">
            Everything you need to work with your files efficiently
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3 className="feature-title">PDF Tools</h3>
              <p className="feature-description">
                35+ PDF tools including merge, split, compress, convert, watermark, and more
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3 className="feature-title">Word Processing</h3>
              <p className="feature-description">
                25+ Word tools for conversion, merging, compression, and document management
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Excel & CSV</h3>
              <p className="feature-description">
                30+ tools for data processing, conversion, analysis, and spreadsheet management
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🖼️</div>
              <h3 className="feature-title">Image Tools</h3>
              <p className="feature-description">
                30+ image tools for resize, compress, convert, crop, filter, and enhancement
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎬</div>
              <h3 className="feature-title">Video Processing</h3>
              <p className="feature-description">
                20+ video tools for conversion, compression, trimming, merging, and editing
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎵</div>
              <h3 className="feature-title">Audio Tools</h3>
              <p className="feature-description">
                15+ audio tools for conversion, compression, editing, and enhancement
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3 className="feature-title">Archive Management</h3>
              <p className="feature-description">
                12+ tools for creating, extracting, and converting archives (ZIP, RAR, 7Z, TAR)
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔧</div>
              <h3 className="feature-title">Utility Tools</h3>
              <p className="feature-description">
                25+ utility tools including QR codes, hash generators, converters, and more
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <Pricing />

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-description">
            Join thousands of users who trust Qsyed for their file processing needs
          </p>
          <Link to="/signup" className="btn btn-primary btn-large">
            Start Processing Files Now
          </Link>
        </div>
      </section>
    </div>
  );
}
