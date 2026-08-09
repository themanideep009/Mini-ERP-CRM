import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let cls = 'badge-secondary';

  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'CONFIRMED':
    case 'IN':
      cls = 'badge-success';
      break;
    case 'LEAD':
    case 'DRAFT':
      cls = 'badge-warning';
      break;
    case 'INACTIVE':
    case 'CANCELLED':
    case 'OUT':
      cls = 'badge-danger';
      break;
    case 'WHOLESALE':
      cls = 'badge-primary';
      break;
    case 'DISTRIBUTOR':
      cls = 'badge-accent';
      break;
    default:
      cls = 'badge-secondary';
  }

  return <span className={`badge ${cls}`}>{status}</span>;
};

export default StatusBadge;
