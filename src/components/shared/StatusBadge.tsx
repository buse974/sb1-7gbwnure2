import React from 'react';

interface StatusBadgeProps {
  status: 'available' | 'in-progress' | 'pending' | 'completed' | 'paused';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
      case 'paused':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'completed':
        return 'Terminée';
      case 'in-progress':
        return 'En cours';
      case 'pending':
      case 'paused':
        return 'En pause';
      default:
        return 'Disponible';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle()}`}>
      {getStatusLabel()}
    </span>
  );
};

export default StatusBadge;