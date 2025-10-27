import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800/80 border border-white/20 rounded-2xl shadow-2xl w-full max-w-md m-4 animate-fade-in-up"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold font-display text-white">{title}</h2>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
