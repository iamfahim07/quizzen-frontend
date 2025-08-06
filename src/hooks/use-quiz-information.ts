import { create } from "zustand";

import type { Quiz } from "@/types";

interface QuizInformationState {
  submittedQuizData: (Quiz & {
    isCorrect: boolean;
    selectedOptions: number[];
  })[];
  setSubmittedQuizData: (
    obj: Quiz & {
      isCorrect: boolean;
      selectedOptions: number[];
    }
  ) => void;
  resetSubmittedQuizData: () => void;

  userStats: { timeTaken: number; score: number };
  setUserStats: (obj: { timeTaken: number; score: number }) => void;
  resetUserStats: () => void;
}

export const useQuizInformation = create<QuizInformationState>()((set) => ({
  submittedQuizData: [],
  setSubmittedQuizData: (newSubmittedQuizData) =>
    set((state) => ({
      submittedQuizData: [
        ...state.submittedQuizData,
        { ...newSubmittedQuizData },
      ],
    })),
  resetSubmittedQuizData: () =>
    set(() => ({
      submittedQuizData: [],
    })),

  userStats: { timeTaken: 0, score: 0 },
  setUserStats: ({ timeTaken = 0, score = 0 }) =>
    set((state) => ({
      userStats: {
        timeTaken: state.userStats.timeTaken + timeTaken,
        score: state.userStats.score + score,
      },
    })),
  resetUserStats: () =>
    set(() => ({
      userStats: { timeTaken: 0, score: 0 },
    })),
}));
