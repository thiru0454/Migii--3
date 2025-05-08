
import React from 'react';

type SpinnerSize = "sm" | "md" | "lg";
type SpinnerVariant = "default" | "overlay";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
  variant?: SpinnerVariant;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
  variant = "default",
  text,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  if (variant === "overlay") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50">
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
          <div className={`loader ${sizeClasses[size]} ${className}`} aria-label="Loading">
            <span className="sr-only">Loading</span>
          </div>
          {text && <p className="text-center font-medium">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className={`loader ${sizeClasses[size]}`} aria-label="Loading">
        <span className="sr-only">Loading</span>
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
