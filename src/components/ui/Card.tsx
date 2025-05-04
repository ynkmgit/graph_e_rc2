import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  accent?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'none';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  accent = 'none' 
}) => {
  const accentColors = {
    primary: 'border-t-indigo-600',
    success: 'border-t-emerald-600',
    warning: 'border-t-amber-500',
    danger: 'border-t-red-600',
    info: 'border-t-blue-500',
    none: ''
  };

  const accentClass = accent !== 'none' 
    ? `border-t-4 ${accentColors[accent]} rounded-t-lg` 
    : '';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${accentClass} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`px-4 py-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`px-4 py-2 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`px-4 py-4 ${className}`}>
      {children}
    </div>
  );
};
