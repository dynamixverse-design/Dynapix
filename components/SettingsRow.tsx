import React, { ReactNode } from 'react';

interface SettingsRowProps {
  icon: ReactNode;
  label: ReactNode;
  onClick?: () => void;
  action?: ReactNode;
  className?: string;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ icon, label, onClick, action, className }) => {
  const isClickable = !!onClick;
  
  const content = (
    <div className={`flex items-center w-full p-4 bg-black/20 rounded-xl transition-colors duration-200 ${isClickable ? 'hover:bg-black/40' : ''} ${className}`}>
      <div className="mr-4 text-brand-cyan">{icon}</div>
      <span className="flex-grow font-semibold text-gray-200">{label}</span>
      <div>{action}</div>
    </div>
  );

  if (isClickable) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return content;
};

export default SettingsRow;