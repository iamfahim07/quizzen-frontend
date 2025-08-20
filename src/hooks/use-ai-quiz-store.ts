import type { StateCreator } from "zustand";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Quiz } from "@/types";

import { AI_CHAT_KEY, AI_QUIZ_KEY } from "@/config";

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
  description?: string;
  quizzes?: Quiz[];
}

interface QuizSliceState {
  allAIQuizData: QuizDataBody[];
  aiQuizDataById: (conversationId: string) => QuizDataBody | null;
  setAIQuizDataById: (data: QuizDataBody) => void;
  removeAIQuizDataById: (conversationId: string) => void;
  clearAIQuizData: () => void;
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

export const useAiChatStore = create<ChatSliceState>()(
  persist(
    (...a) => ({
      ...createChatSlice(...a),
    }),
    { name: AI_CHAT_KEY, storage: createJSONStorage(() => sessionStorage) }
  )
);

export const useAiQuizStore = create<QuizSliceState>()(
  persist(
    (...a) => ({
      ...createQuizSlice(...a),
    }),
    { name: AI_QUIZ_KEY, storage: createJSONStorage(() => localStorage) }
  )
);
