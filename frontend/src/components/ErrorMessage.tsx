import React from 'react';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message = 'An error occurred', onRetry }) => {
  return (
    <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', filter: 'grayscale(30%)' }}>⚠️</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Something went wrong</div>
        <div style={{ fontSize: '0.855rem', color: 'var(--text-muted)', maxWidth: 380 }}>{message}</div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-outline-danger btn-sm">
          ↻ Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
