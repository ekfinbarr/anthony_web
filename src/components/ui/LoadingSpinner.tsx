import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  /** Cover the whole viewport (default) or render inline within the page flow. */
  fullScreen?: boolean;
  label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = true, label = 'Loading…' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center justify-center',
        fullScreen ? 'fixed inset-0 z-50 bg-white/80 backdrop-blur-sm' : 'min-h-[60vh] w-full'
      )}
    >
      <div className="relative" aria-hidden="true">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-church-gold/20 rounded-full animate-spin">
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-church-gold rounded-full animate-spin"></div>
        </div>
        {/* Inner pulse */}
        <div className="absolute inset-2 bg-church-gold rounded-full animate-pulse opacity-20"></div>
        {/* Center dot */}
        <div className="absolute inset-6 bg-church-charcoal rounded-full"></div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
