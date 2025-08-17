import { useState, useCallback } from 'react';

interface UseApiCallState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiCallReturn<T> extends UseApiCallState<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

/**
 * Custom hook for handling API calls with loading, error, and success states
 */
export function useApiCall<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  initialData: T | null = null
): UseApiCallReturn<T> {
  const [state, setState] = useState<UseApiCallState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const result = await apiFunction(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null });
  }, [initialData]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
  };
}

/**
 * Custom hook for handling multiple API calls
 */
export function useMultipleApiCalls() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const executeAll = useCallback(async (calls: Record<string, () => Promise<any>>) => {
    setLoading(true);
    setErrors({});
    
    const results: Record<string, any> = {};
    const errorMap: Record<string, string> = {};
    
    await Promise.allSettled(
      Object.entries(calls).map(async ([key, apiCall]) => {
        try {
          results[key] = await apiCall();
        } catch (error: any) {
          errorMap[key] = error.response?.data?.message || error.message || 'An error occurred';
        }
      })
    );
    
    setLoading(false);
    setErrors(errorMap);
    
    return { results, errors: errorMap };
  }, []);

  return {
    loading,
    errors,
    executeAll,
  };
}

/**
 * Custom hook for periodic API calls (like polling)
 */
export function usePeriodicApiCall<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  interval: number = 30000, // 30 seconds default
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (...args: any[]) => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setData(result);
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiFunction, enabled]);

  // Set up interval
  useState(() => {
    if (!enabled) return;
    
    // Initial fetch
    fetchData();
    
    // Set up interval
    const intervalId = setInterval(() => {
      fetchData();
    }, interval);
    
    return () => clearInterval(intervalId);
  });

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

export default useApiCall;
