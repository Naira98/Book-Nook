import { useEffect, useState } from "react";

interface UseLoadingStateOptions {
  minDisplayTime?: number; // Minimum display time in milliseconds
  initialLoading?: boolean; // Initial loading state
}

interface UseLoadingStateReturn {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

export const useLoadingState = ({
  minDisplayTime = 3000,
  initialLoading = false,
}: UseLoadingStateOptions = {}): UseLoadingStateReturn => {
  const [loading, setLoading] = useState(initialLoading);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (loading && !startTime) {
      // Start loading
      setStartTime(Date.now());
      setShouldShow(true);
    } else if (!loading && startTime) {
      // Check if minimum time has passed
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

      if (remainingTime > 0) {
        // Wait for remaining time before hiding
        const timer = setTimeout(() => {
          setShouldShow(false);
          setStartTime(null);
        }, remainingTime);

        return () => clearTimeout(timer);
      } else {
        // Minimum time has passed, hide immediately
        setShouldShow(false);
        setStartTime(null);
      }
    }
  }, [loading, startTime, minDisplayTime]);

  const setLoadingState = (newLoading: boolean) => {
    setLoading(newLoading);
  };

  const startLoadingState = () => {
    setLoading(true);
  };

  const stopLoadingState = () => {
    setLoading(false);
  };

  return {
    isLoading: shouldShow,
    setLoading: setLoadingState,
    startLoading: startLoadingState,
    stopLoading: stopLoadingState,
  };
};
