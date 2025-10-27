import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    title: "Engineer Prompts",
    description: "Generate powerful, detailed prompts for any creative field with precision.",
    icon: "✨",
  },
  {
    title: "Manifest Visions",
    description: "Turn your words into stunning, professional AI images instantly.",
    icon: "🎨",
  },
  {
    title: "Share Genius",
    description: "Explore, save, and share your creations with a vibrant community.",
    icon: "🌍",
  },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-between p-6 bg-gray-900 text-white text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            {/* You can add a subtle background pattern or animation here */}
        </div>
      
      {/* Spacer */}
      <div className="h-16"></div>
      
      <div key={currentSlide} className="flex-grow flex flex-col items-center justify-center transition-all duration-500">
        <div className="text-8xl mb-10 animate-fade-in-up" style={{ animationDelay: '100ms'}}>{slide.icon}</div>
        <h2 className="text-5xl font-extrabold font-display mb-4 animate-fade-in-up" style={{ animationDelay: '200ms'}}>{slide.title}</h2>
        <p className="text-lg text-gray-300 max-w-sm animate-fade-in-up" style={{ animationDelay: '300ms'}}>{slide.description}</p>
      </div>

      <div className="w-full max-w-sm pb-8">
        <div className="flex justify-center space-x-2.5 mb-10">
            {slides.map((_, index) => (
                <div key={index} className={`h-2 rounded-full transition-all duration-500 ${currentSlide === index ? 'bg-brand-cyan w-8' : 'bg-gray-600 w-2'}`}></div>
            ))}
        </div>
        <button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg hover:shadow-glow-purple transition-all duration-300 transform hover:scale-105 active:scale-100"
        >
          {currentSlide < slides.length - 1 ? 'Continue' : 'Get Started'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;