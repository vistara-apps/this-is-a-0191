import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

type AsyncFunction<T, Args extends any[]> = (...args: Args) => Promise<T>;

export function useAsync<T, Args extends any[] = any[]>(
  asyncFunction: AsyncFunction<T, Args>,
  immediate = false,
  initialArgs?: Args
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args) => {
      setState({ data: null, isLoading: true, error: null });
      
      try {
        const result = await asyncFunction(...args);
        setState({ data: result, isLoading: false, error: null });
        return result;
      } catch (error) {
        setState({ data: null, isLoading: false, error: error instanceof Error ? error : new Error(String(error)) });
        throw error;
      }
    },
    [asyncFunction]
  );

  // Execute the function immediately if requested
  useState(() => {
    if (immediate && initialArgs) {
      execute(...initialArgs);
    }
  });

  return {
    ...state,
    execute,
    // Reset the state
    reset: useCallback(() => {
      setState({ data: null, isLoading: false, error: null });
    }, []),
    // Set the data manually
    setData: useCallback((data: T) => {
      setState(prevState => ({ ...prevState, data }));
    }, []),
    // Set the error manually
    setError: useCallback((error: Error) => {
      setState(prevState => ({ ...prevState, error, isLoading: false }));
    }, []),
  };
}

export default useAsync;

