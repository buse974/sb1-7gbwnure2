import React from 'react';
import { Play, Pause, CheckSquare } from 'lucide-react';

interface StatusButtonProps {
  action: 'take' | 'complete' | 'pause' | 'resume';
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

const StatusButton: React.FC<StatusButtonProps> = ({ action, onClick, disabled }) => {
  const getButtonConfig = () => {
    switch (action) {
      case 'take':
        return {
          icon: Play,
          label: 'Prendre',
          className: 'bg-green-600 hover:bg-green-700'
        };
      case 'complete':
        return {
          icon: CheckSquare,
          label: 'Terminer',
          className: 'bg-green-600 hover:bg-green-700'
        };
      case 'pause':
        return {
          icon: Pause,
          label: 'Pause',
          className: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'resume':
        return {
          icon: Play,
          label: 'Reprendre',
          className: 'bg-yellow-600 hover:bg-yellow-700'
        };
      default:
        return {
          icon: Play,
          label: 'Action',
          className: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const { icon: Icon, label, className } = getButtonConfig();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </button>
  );
};

export default StatusButton;