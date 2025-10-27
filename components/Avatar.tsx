import React, { ReactNode } from 'react';

interface AvatarProps {
    src?: string | null;
    name?: string | null;
    size?: number;
    className?: string;
    children?: ReactNode; // For edit button etc.
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 96, className = '', children }) => {
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const sizeClass = `w-[${size}px] h-[${size}px]`;
  const fontClass = `text-[${Math.round(size / 2.5)}px]`;

  return (
    <div 
      className={`relative rounded-full flex items-center justify-center bg-gradient-to-br from-brand-purple to-brand-cyan text-white font-bold overflow-hidden ${sizeClass} ${className}`}
    >
      {src ? (
        <img src={src} alt={name || 'User Avatar'} className="w-full h-full object-cover" />
      ) : (
        <span className={fontClass}>
          {getInitials(name)}
        </span>
      )}
      {children}
    </div>
  );
};

export default Avatar;