import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const scrollToPricing = (e: React.MouseEvent) => {
    e.preventDefault();
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#pricing');
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-text">Qsyed</span>
          <span className="logo-subtitle">File Services</span>
        </Link>

        <button
          className="nav-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>

          <a href="#pricing" className="nav-link" onClick={(e) => {
            scrollToPricing(e);
            setIsMenuOpen(false);
          }}>
            Pricing
          </a>

          <Link to="/test" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            🧪 Test API
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>

              <div className="nav-user-info">
                <div className="user-plan-badge">
                  {user?.plan} Plan
                </div>
                <span className="user-name">{user?.name}</span>
              </div>

              <button className="nav-button logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="nav-button"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
