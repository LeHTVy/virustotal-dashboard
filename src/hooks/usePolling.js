import { useState, useEffect, useCallback } from 'react';

const usePolling = (callback, interval = 60000) => {
  const [timeLeft, setTimeLeft] = useState(interval / 1000);
  const [isLoading, setIsLoading] = useState(false);

  const startPolling = useCallback(() => {
    setTimeLeft(interval / 1000);
  }, [interval]);

  const resetTimer = useCallback(() => {
    startPolling();
    setIsLoading(true);
    callback().finally(() => setIsLoading(false));
  }, [startPolling, callback]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          resetTimer();
          return interval / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interval, resetTimer]);

  const formattedTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft: formattedTime(),
    resetTimer,
    isLoading
  };
};

export default usePolling;