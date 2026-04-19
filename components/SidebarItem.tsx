import React from 'react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive, onClick, count }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group mb-1
        ${isActive 
          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/10 font-medium' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }
      `}
    >
      <div className={`${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
        {icon}
      </div>
      <span className="text-[15px]">{label}</span>
      
      {/* Count Badge */}
      {count !== undefined && (
        <div className={`ml-auto px-2 py-0.5 text-xs rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
            {count}
        </div>
      )}
    </button>
  );
};