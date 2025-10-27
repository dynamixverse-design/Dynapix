import React from 'react';
import type { View } from '../types';
import HomeIcon from './icons/HomeIcon';
import GalleryIcon from './icons/GalleryIcon';
import ExploreIcon from './icons/ExploreIcon';
import ProfileIcon from './icons/ProfileIcon';
import SparklesIcon from './icons/SparklesIcon';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
}

const navItems: { view: View; label: string; icon: React.FC<any> }[] = [
  { view: 'promptBuilder', label: 'Home', icon: HomeIcon },
  { view: 'AIdeator', label: 'Ideator', icon: SparklesIcon },
  { view: 'gallery', label: 'Gallery', icon: GalleryIcon },
  { view: 'explore', label: 'Explore', icon: ExploreIcon },
  { view: 'settings', label: 'Profile', icon: ProfileIcon },
];

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const activeIndex = navItems.findIndex(item => item.view === currentView);

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-lg h-20 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl z-30 shadow-2xl">
      <div className="relative flex justify-around items-center h-full">
        {/* Active Indicator */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-brand-purple/40 to-brand-cyan/40 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{
            transform: `translateX(calc(${activeIndex * 100}% + ${activeIndex * (100 / navItems.length / (navItems.length -1))}px - 50% * ${ (navItems.length - 1 - 2 * activeIndex) / (navItems.length -1) } )) translateY(-50%)`,
            left: `${(100 / navItems.length) * (activeIndex + 0.5)}%`
          }}
        />

        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className="relative z-10 flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 transform focus:outline-none"
              aria-label={item.label}
            >
              <item.icon className={`w-7 h-7 transition-colors ${isActive ? 'text-brand-cyan' : 'text-gray-400'}`} />
              <span className={`text-xs mt-1 transition-all duration-300 font-medium ${isActive ? 'opacity-100 text-white' : 'opacity-0'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
