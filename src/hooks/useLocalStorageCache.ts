import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook to sync state with localStorage for persistent filters and recent searches.
 */
export function useLocalStorageCache<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = localStorage.getItem(`fluxo_cache_${key}`);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "fluxo_cache_${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const nextValue = value instanceof Function ? value(prev) : value;
          if (typeof window !== "undefined") {
            localStorage.setItem(`fluxo_cache_${key}`, JSON.stringify(nextValue));
          }
          return nextValue;
        });
      } catch (error) {
        console.warn(`Error setting localStorage key "fluxo_cache_${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}
