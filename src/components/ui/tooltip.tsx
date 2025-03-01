import React, { useState, ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  return (
    <div className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 ${getPositionClasses()} bg-gray-800 text-white rounded-md shadow-lg transition-opacity duration-200 opacity-100`}
        >
          <div className="relative">
            {position === 'top' && (
              <div className="absolute left-1/2 top-full transform -translate-x-1/2 border-8 border-transparent border-t-gray-800"></div>
            )}
            {position === 'bottom' && (
              <div className="absolute left-1/2 bottom-full transform -translate-x-1/2 border-8 border-transparent border-b-gray-800"></div>
            )}
            {position === 'left' && (
              <div className="absolute top-1/2 left-full transform -translate-y-1/2 border-8 border-transparent border-l-gray-800"></div>
            )}
            {position === 'right' && (
              <div className="absolute top-1/2 right-full transform -translate-y-1/2 border-8 border-transparent border-r-gray-800"></div>
            )}
            {content}
          </div>
        </div>
      )}
    </div>
  );
}; 