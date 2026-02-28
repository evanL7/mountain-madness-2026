import { useState, useEffect, useCallback } from 'react';

export function useApi(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(() => {
    setLoading(true);
    setError(null);
    return fetchFn()
      .then((result) => {
        setData(result);
        return result;
      })
      .catch((err) => {
        setError(err);
        return null;
      })
      .finally(() => setLoading(false));
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}
