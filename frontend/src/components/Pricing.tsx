import React from 'react';
import { PRICING_PLANS } from '../constants/pricing';
import { useAuth } from '../context/AuthContext';
import './Pricing.css';

export function Pricing() {
  const { user, isAuthenticated } = useAuth();

  return (
    <section id="pricing" className="pricing-section">
      <div className="container">
        <h2 className="pricing-title">Choose Your Plan</h2>
        <p className="pricing-subtitle">
          Select the perfect plan for your file processing needs
        </p>

        <div className="pricing-grid">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`pricing-card ${
                isAuthenticated && user?.plan === plan.name ? 'current-plan' : ''
              } ${plan.name === 'Pro' ? 'featured' : ''}`}
            >
              {plan.name === 'Pro' && <div className="featured-badge">Popular</div>}
              {isAuthenticated && user?.plan === plan.name && (
                <div className="current-badge">Current Plan</div>
              )}

              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  {plan.price === 0 ? (
                    <span className="price-amount">Free</span>
                  ) : (
                    <>
                      <span className="price-currency">$</span>
                      <span className="price-amount">{plan.price}</span>
                      <span className="price-interval">/{plan.interval}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="plan-limits">
                <div className="limit-item">
                  <strong>{plan.maxRequests}</strong> requests/day
                </div>
                <div className="limit-item">
                  Max file size: <strong>{plan.maxFileSize}</strong>
                </div>
              </div>

              <ul className="plan-features">
                {plan.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`plan-button ${
                  isAuthenticated && user?.plan === plan.name ? 'current' : ''
                }`}
                disabled={isAuthenticated && user?.plan === plan.name}
              >
                {isAuthenticated && user?.plan === plan.name
                  ? 'Current Plan'
                  : plan.price === 0
                  ? 'Get Started'
                  : 'Upgrade Now'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
