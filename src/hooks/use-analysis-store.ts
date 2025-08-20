import type { StateCreator } from "zustand";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Option, Quiz } from "@/types";

import { ANALYSIS_KEY } from "@/config";

interface AnalysisBody {
  submittedQuizData: (Quiz & {
    isCorrect: boolean;
    selectedOptions: Option[];
  })[];
  userStats: {
    timeTaken: number;
    score: number;
  };
}

interface AnalysisSliceState {
  userAnalysisResults: Record<string, AnalysisBody>;
  getUserAnalysisResultById: (id: string) => AnalysisBody;
  setUserAnalysisResultById: (id: string, dataObj: AnalysisBody) => void;
  removeUserAnalysisResultById: (id: string) => void;
  clearUserAnalysisResults: () => void;
}

// Slice for analysis data
const createAnalysisSlice: StateCreator<AnalysisSliceState> = (set, get) => ({
  userAnalysisResults: {},
  getUserAnalysisResultById: (id) => get().userAnalysisResults[id] || {},

  setUserAnalysisResultById: (id, dataObj) =>
    set((state) => ({
      userAnalysisResults: {
        ...state.userAnalysisResults,
        [id]: dataObj,
      },
    })),

  removeUserAnalysisResultById: (id) => {
    set((state) => {
      const cloneUserAnalysisResults = { ...state.userAnalysisResults };
      delete cloneUserAnalysisResults[id];

      return { userAnalysisResults: cloneUserAnalysisResults };
    });
  },

  clearUserAnalysisResults: () => set({ userAnalysisResults: {} }),
});

// Combine all slices into one store
export const useAnalysisStore = create<AnalysisSliceState>()(
  persist(
    (...a) => ({
      ...createAnalysisSlice(...a),
    }),
    { name: ANALYSIS_KEY, storage: createJSONStorage(() => sessionStorage) }
  )
);
