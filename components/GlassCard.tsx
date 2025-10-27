import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;