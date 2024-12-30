import React, { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      {children}
    </div>
  );
};

export default FormSection;