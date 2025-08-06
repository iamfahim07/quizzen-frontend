import { useEffect } from "react";
import { create } from "zustand";

import { useAuth, type GetUserResponse } from "@/api/use-auth";

import type { User } from "@/types";
import type { UseQueryResult } from "@tanstack/react-query";

interface useAuthState {
  user: User | null;
  isLoading: boolean;
  initializeUser: (getUser: UseQueryResult<GetUserResponse, Error>) => void;
  setUser: (user: User) => void;
  reSetUser: () => void;
}

export const useAuthStore = create<useAuthState>()((set) => ({
  user: null,
  isLoading: true,
  initializeUser: async (getUser) => {
    try {
      const { data } = await getUser.refetch();
      const user = data?.data ?? null;
      set({ user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
  setUser: (user) => set({ user, isLoading: false }),
  reSetUser: () => set({ user: null, isLoading: false }),
}));

export const InitializeAuthStore = () => {
  const { getUser } = useAuth();

  useEffect(() => {
    useAuthStore.getState().initializeUser(getUser);
  }, [getUser]);

  return null;
};
