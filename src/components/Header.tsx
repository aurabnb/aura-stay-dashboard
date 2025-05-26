
import React from 'react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src="/lovable-uploads/99705421-813e-4d11-89a5-90bffaa2147a.png" 
                alt="AURA" 
                className="h-8 w-auto"
              />
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a
              href="#"
              className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium font-urbanist transition-colors"
            >
              Home
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium font-urbanist transition-colors"
            >
              Projects
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium font-urbanist transition-colors"
            >
              Roadmap
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium font-urbanist transition-colors"
            >
              Contact
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium font-urbanist transition-colors"
            >
              Notion
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium font-urbanist transition-colors"
            >
              Blog
            </a>
          </nav>

          <div className="flex items-center">
            <button className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium font-urbanist transition-colors">
              Buy $AURA
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
