import type { StateCreator } from "zustand";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Option, Quiz } from "@/types";

import { PARENT_STORAGE_KEY } from "@/config";

const KEY = PARENT_STORAGE_KEY;

interface ChatBody {
  role: "ai" | "user";
  text: string;
  attachments?: string[] | null;
}

interface ChatSliceState {
  allChatHistory: Record<string, ChatBody[]>;
  chatHistoryById: (id: string) => ChatBody[];
  setChatHistoryById: (id: string, msgObj: ChatBody) => void;
  removeChatHistoryById: (id: string) => void;
  clearAllChatHistory: () => void;
}

export interface QuizDataBody {
  conversationId: string;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  topic?: string;
  quizzes?: Quiz[];
}

interface QuizSliceState {
  allAIQuizData: QuizDataBody[];
  aiQuizDataById: (conversationId: string) => QuizDataBody | null;
  setAIQuizDataById: (data: QuizDataBody) => void;
  removeAIQuizDataById: (conversationId: string) => void;
  clearAIQuizData: () => void;
}

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

// Slice for chat history
const createChatSlice: StateCreator<ChatSliceState> = (set, get) => ({
  allChatHistory: {},
  chatHistoryById: (id) => get().allChatHistory[id] || [],

  setChatHistoryById: (id, msgObj) =>
    set((state) => ({
      allChatHistory: {
        ...state.allChatHistory,
        [id]: [...(state.allChatHistory[id] || []), msgObj],
      },
    })),

  removeChatHistoryById: (id) => {
    set((state) => {
      const cloneAllChatHistory = { ...state.allChatHistory };
      delete cloneAllChatHistory[id];

      return { allChatHistory: cloneAllChatHistory };
    });
  },

  clearAllChatHistory: () => set({ allChatHistory: {} }),
});

// Slice for quiz data
const createQuizSlice: StateCreator<QuizSliceState> = (set, get) => ({
  allAIQuizData: [],

  aiQuizDataById: (conversationId) =>
    get().allAIQuizData.find(
      (quizData) => quizData.conversationId === conversationId
    ) || null,

  setAIQuizDataById: (data) =>
    set((state) => {
      const existingIndex = state.allAIQuizData.findIndex(
        (quiz) => quiz.conversationId === data.conversationId
      );

      if (existingIndex >= 0) {
        // Update existing quiz
        const updated = [...state.allAIQuizData];
        updated[existingIndex] = data;
        return { allAIQuizData: updated };
      } else {
        // Add new quiz
        return { allAIQuizData: [...state.allAIQuizData, data] };
      }
    }),

  removeAIQuizDataById: (conversationId) =>
    set((state) => ({
      allAIQuizData: state.allAIQuizData.filter(
        (quiz) => quiz.conversationId !== conversationId
      ),
    })),

  clearAIQuizData: () => set({ allAIQuizData: [] }),
});

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
export const useAppStore = create<
  ChatSliceState & QuizSliceState & AnalysisSliceState
>()(
  persist(
    (...a) => ({
      ...createChatSlice(...a),
      ...createQuizSlice(...a),
      ...createAnalysisSlice(...a),
    }),
    { name: KEY, storage: createJSONStorage(() => sessionStorage) }
  )
);
