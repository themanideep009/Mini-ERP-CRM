import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are no items to display at this time.',
  icon = '📂',
  actionText,
  onAction,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary mt-4">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
