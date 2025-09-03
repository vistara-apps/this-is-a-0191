import React from 'react';

interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'white';
  text?: string;
  fullScreen?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'medium',
  color = 'primary',
  text,
  fullScreen = false
}) => {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };
  
  const colorClasses = {
    primary: 'border-primary/30 border-t-primary',
    white: 'border-white/30 border-t-white'
  };
  
  const textColorClasses = {
    primary: 'text-primary',
    white: 'text-white'
  };
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
        <div className="text-center">
          <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin mx-auto`}></div>
          {text && (
            <p className={`mt-4 font-medium ${textColorClasses[color]}`}>{text}</p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}></div>
      {text && (
        <p className={`mt-2 text-sm font-medium ${textColorClasses[color]}`}>{text}</p>
      )}
    </div>
  );
};

