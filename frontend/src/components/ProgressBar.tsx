import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  progress: number; // 0-100
  currentStep?: string;
  estimatedTime?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'error';
}

export function ProgressBar({
  progress,
  currentStep,
  estimatedTime,
  showPercentage = true,
  variant = 'default',
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="progress-bar-container">
      {currentStep && (
        <div className="progress-step">
          <span className="step-text">{currentStep}</span>
          {estimatedTime && (
            <span className="estimated-time">⏱ {estimatedTime}</span>
          )}
        </div>
      )}

      <div className="progress-bar-wrapper">
        <div className={`progress-bar-track ${variant}`}>
          <div
            className={`progress-bar-fill ${variant}`}
            style={{ width: `${clampedProgress}%` }}
          >
            {showPercentage && clampedProgress > 10 && (
              <span className="progress-percentage">{Math.round(clampedProgress)}%</span>
            )}
          </div>
        </div>
        {showPercentage && clampedProgress <= 10 && (
          <span className="progress-percentage-outside">
            {Math.round(clampedProgress)}%
          </span>
        )}
      </div>
    </div>
  );
}

interface StepIndicatorProps {
  steps: string[];
  currentStep: number; // 0-based index
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="step-indicator">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <div key={index} className="step-item">
            <div
              className={`step-circle ${
                isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'
              }`}
            >
              {isCompleted ? '✓' : index + 1}
            </div>
            <div className="step-label">{step}</div>
            {index < steps.length - 1 && (
              <div
                className={`step-connector ${isCompleted ? 'completed' : ''}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
