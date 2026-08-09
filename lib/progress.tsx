"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const KEY = "dbt-onboarding-progress-v1";

type ProgressState = {
  /** completed page/lesson ids, e.g. "learn/why-dbt" or "course/git/branches" */
  done: string[];
  /** ticked checklist item ids */
  checks: string[];
  /** learner name, shown on certificates */
  name: string;
  /** per-lesson furthest revealed step index, keyed by lesson id */
  steps: Record<string, number>;
};

const EMPTY: ProgressState = { done: [], checks: [], name: "", steps: {} };

type ProgressContextValue = ProgressState & {
  ready: boolean;
  toggleDone: (id: string) => void;
  markDone: (id: string) => void;
  isDone: (id: string) => boolean;
  toggleCheck: (id: string) => void;
  isChecked: (id: string) => boolean;
  setName: (name: string) => void;
  setStep: (lessonId: string, step: number) => void;
  getStep: (lessonId: string) => number;
  resetCourse: (courseSlug: string) => void;
  reset: () => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        done: Array.isArray(parsed.done) ? parsed.done : [],
        checks: Array.isArray(parsed.checks) ? parsed.checks : [],
        name: typeof parsed.name === "string" ? parsed.name : "",
        steps:
          parsed.steps && typeof parsed.steps === "object" ? parsed.steps : {},
      };
    }
  } catch {
    /* corrupted storage — start fresh */
  }
  return EMPTY;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const restoreProgress = window.setTimeout(() => {
      setState(load());
      setReady(true);
    }, 0);

    return () => window.clearTimeout(restoreProgress);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  const toggleDone = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      done: s.done.includes(id) ? s.done.filter((d) => d !== id) : [...s.done, id],
    }));
  }, []);

  const markDone = useCallback((id: string) => {
    setState((s) =>
      s.done.includes(id) ? s : { ...s, done: [...s.done, id] },
    );
  }, []);

  const toggleCheck = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      checks: s.checks.includes(id)
        ? s.checks.filter((c) => c !== id)
        : [...s.checks, id],
    }));
  }, []);

  const setName = useCallback((name: string) => {
    setState((s) => ({ ...s, name }));
  }, []);

  const setStep = useCallback((lessonId: string, step: number) => {
    setState((s) =>
      (s.steps[lessonId] ?? 0) >= step
        ? s
        : { ...s, steps: { ...s.steps, [lessonId]: step } },
    );
  }, []);

  const isDone = useCallback((id: string) => state.done.includes(id), [state.done]);
  const isChecked = useCallback(
    (id: string) => state.checks.includes(id),
    [state.checks],
  );
  const getStep = useCallback(
    (lessonId: string) => state.steps[lessonId] ?? 0,
    [state.steps],
  );
  const resetCourse = useCallback((courseSlug: string) => {
    const donePrefix = `course/${courseSlug}/`;
    const stepPrefix = `${courseSlug}/`;

    setState((s) => ({
      ...s,
      done: s.done.filter((id) => !id.startsWith(donePrefix)),
      name: "",
      steps: Object.fromEntries(
        Object.entries(s.steps).filter(([id]) => !id.startsWith(stepPrefix)),
      ),
    }));
  }, []);
  const reset = useCallback(() => setState(EMPTY), []);

  return (
    <ProgressContext.Provider
      value={{
        ...state,
        ready,
        toggleDone,
        markDone,
        isDone,
        toggleCheck,
        isChecked,
        setName,
        setStep,
        getStep,
        resetCourse,
        reset,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
