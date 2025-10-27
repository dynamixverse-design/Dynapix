import React from 'react';

interface FilterPreviewProps {
  imageSrc: string;
  filter: { name: string; value: string };
  isActive: boolean;
  onClick: () => void;
}

const FilterPreview: React.FC<FilterPreviewProps> = ({ imageSrc, filter, isActive, onClick }) => (
    <div className="text-center cursor-pointer flex-shrink-0" onClick={onClick}>
        <div className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${isActive ? 'border-brand-cyan shadow-glow-cyan' : 'border-white/20'}`}>
            <img src={imageSrc} className="w-full h-full object-cover" style={{ filter: filter.value }} alt={`${filter.name} preview`}/>
        </div>
        <p className={`text-xs mt-1.5 font-semibold transition-colors ${isActive ? 'text-brand-cyan' : 'text-gray-300'}`}>{filter.name}</p>
    </div>
);

export default FilterPreview;
