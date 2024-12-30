import React, { ReactNode } from 'react';

interface DetailSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const DetailSection: React.FC<DetailSectionProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      {children}
    </div>
  );
};

export default DetailSection;