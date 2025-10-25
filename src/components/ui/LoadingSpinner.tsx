import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-church-gold/20 rounded-full animate-spin">
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-church-gold rounded-full animate-spin"></div>
        </div>
        {/* Inner pulse */}
        <div className="absolute inset-2 bg-church-gold rounded-full animate-pulse opacity-20"></div>
        {/* Center dot */}
        <div className="absolute inset-6 bg-church-charcoal rounded-full"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
