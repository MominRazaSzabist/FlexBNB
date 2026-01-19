// components/MessageModal/FloatingMessageButton.tsx
'use client';

import { useState } from 'react';

interface FloatingMessageButtonProps {
  onClick: () => void;
  unreadCount?: number;
}

const FloatingMessageButton = ({ onClick, unreadCount = 0 }: FloatingMessageButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
          Need help? Chat with us!
          <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
      
      {/* Main Button */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
        
        {/* Online indicator */}
        <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
      </button>
    </div>
  );
};

export default FloatingMessageButton;