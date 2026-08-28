import { useState, useEffect } from 'react';

export interface CountdownResult {
  seconds: number;
  formatted: string;
  isExpired: boolean;
}

export function useCountdown(initialSeconds: number): CountdownResult {
  const [seconds, setSeconds] = useState<number>(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const minutes = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  const isExpired = seconds <= 0;

  return {
    seconds,
    formatted,
    isExpired,
  };
}
