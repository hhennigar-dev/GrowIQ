import React from 'react';

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  subtitle, 
  children, 
  className = '',
  headerAction
}) => {
  return (
    <div className={`bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col ${className}`}>
      {(title || subtitle) && (
        <div className="flex items-start justify-between mb-6">
          <div>
            {title && <h3 className="text-lg font-bold text-gray-800 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};