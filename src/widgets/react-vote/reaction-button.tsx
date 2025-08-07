import React, { useState } from 'react';
import { Reaction } from './react-vote-types';

interface ReactionButtonProps {
  reaction: Reaction;
  isActive: boolean;
  showCount: boolean;
  darkMode: boolean;
  buttonSize: 'small' | 'medium' | 'large';
  animationsEnabled: boolean;
  primaryColor: string;
  onClick: () => void;
}

const ReactionButton: React.FC<ReactionButtonProps> = ({
  reaction,
  isActive,
  showCount,
  darkMode,
  buttonSize,
  animationsEnabled,
  primaryColor,
  onClick,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (animationsEnabled) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
    onClick();
  };

  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-3 py-2 text-base',
    large: 'px-4 py-3 text-lg'
  };

  const emojiSizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl'
  };

  const baseClasses = `
    flex items-center space-x-2 rounded-full border-2 transition-all duration-200 cursor-pointer
    ${sizeClasses[buttonSize]}
    ${animationsEnabled ? 'hover:scale-105 active:scale-95' : ''}
    ${isAnimating ? 'animate-bounce' : ''}
  `;

  const activeClasses = isActive
    ? `border-blue-500 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`
    : `${darkMode 
        ? 'border-gray-600 bg-gray-800 hover:border-gray-500' 
        : 'border-gray-300 bg-white hover:border-gray-400'
      }`;

  const textClasses = darkMode ? 'text-white' : 'text-gray-700';

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${activeClasses}`}
      title={`${reaction.label} (${reaction.count})`}
    >
      <span className={`${emojiSizeClasses[buttonSize]} ${isAnimating ? 'animate-pulse' : ''}`}>
        {reaction.emoji}
      </span>
      {showCount && (
        <span className={`font-medium ${textClasses} ${isActive ? 'text-blue-600' : ''}`}>
          {reaction.count > 0 ? reaction.count : ''}
        </span>
      )}
    </button>
  );
};

export default ReactionButton;