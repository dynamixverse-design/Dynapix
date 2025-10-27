import React from 'react';

const DynapixLogo: React.FC<{ size?: number }> = ({ size = 80 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="splash-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
        </defs>
        <path d="M16 20H8C5.79 20 4 18.21 4 16V8C4 5.79 5.79 4 8 4h8c2.21 0 4 1.79 4 4v8c0 2.21-1.79 4-4 4z M8 2C4.69 2 2 4.69 2 8v8c0 3.31 2.69 6 6 6h8c3.31 0 6-2.69 6-6V8c0-3.31-2.69-6-6-6H8z" fill="url(#splash-logo-gradient)" fillRule="evenodd" />
        <path d="M12 7h-2v10h2c2.76 0 5-2.24 5-5s-2.24-5-5-5zm.5 8H12V9h.5c1.93 0 3.5 1.57 3.5 3.5S14.43 15 12.5 15z" fill="url(#splash-logo-gradient)" fillRule="evenodd"/>
    </svg>
);


const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#120a22] to-[#0a0118] animate-fadeOut">
      <div className="flex items-center justify-center animate-splash-fade-in" style={{ animationDelay: '200ms' }}>
        <DynapixLogo size={80} />
        <h1 className="text-6xl font-extrabold text-white font-display ml-6 tracking-wide">
          Dynapix
        </h1>
      </div>
       <p className="text-xl text-gray-300 mt-4 animate-splash-fade-in" style={{ animationDelay: '500ms' }}>
        Create Prompts. Create Magic.
      </p>

      <style>{`
        @keyframes fadeOut {
          0% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
        .animate-fadeOut {
          animation: fadeOut 3.5s forwards;
        }

        @keyframes splash-fade-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .animate-splash-fade-in {
            opacity: 0;
            animation-name: splash-fade-in;
            animation-duration: 0.8s;
            animation-fill-mode: forwards;
            animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
