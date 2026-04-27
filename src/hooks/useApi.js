/**
 * useApi.js — Generic data-fetching hook
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(getCars, { params });
 *
 * - Runs on mount and whenever `deps` change
 * - Returns { data, loading, error, refetch }
 * - Does NOT show toasts — callers decide what to display
 */

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * @param {Function} apiFn   — service function that returns a Promise
 * @param {Array}    deps    — re-fetch when these change (default: [])
 * @param {boolean}  skip    — set true to skip initial fetch
 */
export default function useApi(apiFn, deps = [], skip = false) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError]     = useState(null);
  const mountedRef            = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      if (mountedRef.current) setData(result);
      return result;
    } catch (err) {
      // Preserve full error object including status
      if (mountedRef.current) {
        setError(err);
      }
      throw err;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (!skip) execute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute]);

  return { 
    data, 
    loading, 
    error, 
    status: error?.status || error?.statusCode,
    refetch: execute 
  };
}
