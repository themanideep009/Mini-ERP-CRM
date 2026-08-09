import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = 'Loading...', fullPage = false }) => {
  if (fullPage) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', background: 'var(--bg-base)' }}>
        <div className="spinner spinner-md" />
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{text}</span>
      </div>
    );
  }

  return (
    <div className="spinner-container">
      <div className="spinner spinner-md" />
      <span className="spinner-label">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
