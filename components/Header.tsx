import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="sticky top-0 z-20 p-4 bg-black/20 backdrop-blur-lg">
      <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan font-display">
        {title}
      </h1>
    </header>
  );
};

export default Header;