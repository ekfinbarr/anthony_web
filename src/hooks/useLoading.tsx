import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Reset loading state asynchronously (lint rule blocks sync setState in effects).
    const start = setTimeout(() => setIsLoading(true), 0);

    // Simulate loading time or wait for actual data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Adjust timing as needed

    return () => {
      clearTimeout(start);
      clearTimeout(timer);
    };
  }, [location.pathname]);

  return { isLoading };
};
