'use client';

import React from 'react';

interface MenuButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className="menu-button p-2 rounded-lg hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300"
      aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
      aria-expanded={isOpen}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <div className={`w-5 h-0.5 bg-gray-700 transition-all duration-300 ${
          isOpen ? 'rotate-45 translate-y-1.5' : 'mb-1'
        }`} />
        <div className={`w-5 h-0.5 bg-gray-700 transition-all duration-300 ${
          isOpen ? 'opacity-0' : 'mb-1'
        }`} />
        <div className={`w-5 h-0.5 bg-gray-700 transition-all duration-300 ${
          isOpen ? '-rotate-45 -translate-y-1.5' : ''
        }`} />
      </div>
    </button>
  );
};

export default MenuButton;