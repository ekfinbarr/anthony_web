import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);

    // Simulate loading time or wait for actual data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Adjust timing as needed

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return { isLoading };
};
