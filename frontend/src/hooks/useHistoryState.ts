import { useCallback, useRef, useState } from "react";

export type SetStateAction<T> = T | ((prev: T) => T);

export interface UseHistoryStateReturn<T> {
  state: T;
  set: (next: SetStateAction<T>) => void;
  reset: (value: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

// State container with undo/redo capabilities.
export const useHistoryState = <T>(
  initial: T | (() => T),
): UseHistoryStateReturn<T> => {
  const [state, setState] = useState<T>(initial);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);

  const set = useCallback((next: SetStateAction<T>): void => {
    setState((prev) => {
      const value =
        typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
      if (value === prev) return prev;
      past.current.push(prev);
      if (past.current.length > 100) past.current.shift();
      future.current = [];
      return value;
    });
  }, []);

  const undo = useCallback((): void => {
    setState((prev) => {
      if (past.current.length === 0) return prev;
      const previous = past.current.pop()!;
      future.current.push(prev);
      return previous;
    });
  }, []);

  const redo = useCallback((): void => {
    setState((prev) => {
      if (future.current.length === 0) return prev;
      const next = future.current.pop()!;
      past.current.push(prev);
      return next;
    });
  }, []);

  const reset = useCallback((value: T): void => {
    past.current = [];
    future.current = [];
    setState(value);
  }, []);

  return {
    state,
    set,
    reset,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
};
