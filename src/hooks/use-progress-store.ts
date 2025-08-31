import { create } from "zustand";

interface ProgressStore {
  progress: number;
  intervalId: ReturnType<typeof setInterval> | null;
  // intervalId: NodeJS.Timeout | null;
  startProgress: () => void;
  setProgress: (value: number) => void;
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  progress: 0,
  intervalId: null,

  startProgress: () => {
    if (get().intervalId) return;

    const id = setInterval(() => {
      set((state) => {
        const next = Math.min(state.progress + 0.5, 95);
        if (next >= 95 && state.intervalId) {
          clearInterval(state.intervalId);
          return { progress: next, intervalId: null };
        }
        return { progress: next };
      });
    }, 100);

    set({ intervalId: id, progress: 0 });
  },

  setProgress: (value: number) => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ progress: value, intervalId: null });

    return new Promise<void>((res) => setTimeout(res, 200));
  },

  resetProgress: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ progress: 0, intervalId: null });
  },
}));
