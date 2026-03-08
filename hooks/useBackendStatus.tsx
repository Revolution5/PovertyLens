'use client';

import { useState, useEffect } from 'react';

interface Status {
  isOnline: boolean;
  checking: boolean;
}

const useBackendStatus = () => {
  const [status, setStatus] = useState<Status>({
    isOnline: true,
    checking: true
  });

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch('http://localhost:4000/api/health', {
          signal: controller.signal,
        }).catch(() => null);
        
        clearTimeout(timeoutId);

        if (response && response.ok) {
          setStatus({
            isOnline: true,
            checking: false
          });
        } else {
          setStatus({
            isOnline: false,
            checking: false
          });
        }
      } catch {
        setStatus({
          isOnline: false,
          checking: false
        });
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  return status;
};

export default useBackendStatus;