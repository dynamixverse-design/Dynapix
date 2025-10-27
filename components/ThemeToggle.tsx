import React from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center h-9 rounded-full w-16 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand-cyan ${
        theme === 'dark' ? 'bg-brand-purple' : 'bg-brand-cyan'
      }`}
    >
      <span
        className={`inline-flex items-center justify-center w-7 h-7 transform bg-white rounded-full transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] text-lg ${
          theme === 'dark' ? 'translate-x-[34px]' : 'translate-x-1'
        }`}
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
    </button>
  );
};

export default ThemeToggle;