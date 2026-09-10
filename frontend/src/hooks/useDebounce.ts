import { useEffect, useState } from "react";

// Returns a debounced copy of a value after `delay` ms of stability.
export const useDebounce = <T>(value: T, delay: number = 400): T => {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
};
