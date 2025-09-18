import { useEffect, useState } from "react";

/**
 * Debounce a rapidly changing value. Returns the latest value
 * only after `delay` ms have elapsed without further changes.
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
