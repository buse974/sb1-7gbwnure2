import React from 'react';
import { Routine } from '../../types';

interface FrequencyBadgeProps {
  frequency: Routine['frequency'];
  customInterval?: number;
}

const FrequencyBadge: React.FC<FrequencyBadgeProps> = ({ frequency, customInterval }) => {
  const getFrequencyStyle = () => {
    switch (frequency) {
      case 'daily':
        return 'bg-purple-100 text-purple-800';
      case 'weekly':
        return 'bg-blue-100 text-blue-800';
      case 'monthly':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrequencyLabel = () => {
    switch (frequency) {
      case 'daily':
        return 'Quotidienne';
      case 'weekly':
        return 'Hebdomadaire';
      case 'monthly':
        return 'Mensuelle';
      case 'custom':
        return `Tous les ${customInterval} jours`;
      default:
        return 'Personnalisée';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFrequencyStyle()}`}>
      {getFrequencyLabel()}
    </span>
  );
};

export default FrequencyBadge;