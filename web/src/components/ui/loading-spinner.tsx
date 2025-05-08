
import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  text?: string;
  variant?: 'default' | 'overlay';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  color,
  className = '',
  text,
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
  };
  
  const colorClass = color || 'text-primary';
  
  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50">
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
          <div className={`loader ${sizeClasses[size]} ${colorClass} ${className}`} role="status">
            <span className="sr-only">Loading...</span>
          </div>
          {text && <p className="text-center font-medium">{text}</p>}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className={`loader ${sizeClasses[size]} ${colorClass}`} role="status">
        <span className="sr-only">Loading...</span>
      </div>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

// Create a fullscreen loading component for page transitions
export const PageLoadingSpinner: React.FC<{text?: string}> = ({ text = "Loading..." }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-lg font-medium">{text}</p>
    </div>
  </div>
);
