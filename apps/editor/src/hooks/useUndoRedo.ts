import { useCallback, useRef, useState } from "react";
import type { OverlayItem } from "../types/editor";

interface UndoRedoState {
  past: OverlayItem[][];
  present: OverlayItem[];
  future: OverlayItem[][];
}

export function useUndoRedo(initialState: OverlayItem[]) {
  const stateRef = useRef<UndoRedoState>({
    past: [],
    present: initialState,
    future: [],
  });

  const [, setUpdateTrigger] = useState(0);

  const canUndo = stateRef.current.past.length > 0;
  const canRedo = stateRef.current.future.length > 0;

  const pushHistory = useCallback((newPresent: OverlayItem[]) => {
    stateRef.current = {
      past: [...stateRef.current.past, stateRef.current.present],
      present: newPresent,
      future: [],
    };
    setUpdateTrigger((prev) => prev + 1);
  }, []);

  const undo = useCallback(() => {
    if (!canUndo) return;
    const newPast = stateRef.current.past.slice(0, -1);
    const newPresent = stateRef.current.past[stateRef.current.past.length - 1];
    stateRef.current = {
      past: newPast,
      present: newPresent,
      future: [stateRef.current.present, ...stateRef.current.future],
    };
    setUpdateTrigger((prev) => prev + 1);
    return newPresent;
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    stateRef.current = {
      past: [...stateRef.current.past, stateRef.current.present],
      present: stateRef.current.future[0],
      future: stateRef.current.future.slice(1),
    };
    setUpdateTrigger((prev) => prev + 1);
    return stateRef.current.present;
  }, [canRedo]);

  const getCurrentState = useCallback(() => {
    return stateRef.current.present;
  }, []);

  const setCurrentState = useCallback((state: OverlayItem[]) => {
    stateRef.current.present = state;
    setUpdateTrigger((prev) => prev + 1);
  }, []);

  return {
    canUndo,
    canRedo,
    pushHistory,
    undo,
    redo,
    getCurrentState,
    setCurrentState,
  };
}
