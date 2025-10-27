import React from 'react';

interface HistoryPreviewProps {
  imageSrc: string;
  isActive: boolean;
  isOriginal: boolean;
  onClick: () => void;
}

const HistoryPreview: React.FC<HistoryPreviewProps> = ({ imageSrc, isActive, isOriginal, onClick }) => (
    <div 
        className="text-center cursor-pointer flex-shrink-0 group relative" 
        onClick={onClick}
    >
        <div className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${isActive ? 'border-brand-cyan shadow-glow-cyan scale-105' : 'border-white/20 group-hover:border-white/50'}`}>
            <img 
                src={imageSrc} 
                className="w-full h-full object-cover" 
                alt="History preview"
                loading="lazy"
            />
        </div>
        <p className={`text-xs mt-1.5 font-semibold transition-colors ${isActive ? 'text-brand-cyan' : 'text-gray-400'}`}>
            {isOriginal ? 'Original' : 'Edit'}
        </p>
    </div>
);

export default HistoryPreview;