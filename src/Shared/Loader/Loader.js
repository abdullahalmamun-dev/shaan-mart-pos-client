import { useEffect, useState } from 'react';

const useLoader = () => {
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Default loading for 1 second
    const timeout = setTimeout(() => {
      if (navigator.onLine) {
        setLoading(false);
      }
    }, 1000);

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { loading, online };
};

export default useLoader;