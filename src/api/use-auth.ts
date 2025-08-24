import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiRequest } from "@/api/api-client";

import type { User } from "@/types";

interface LoginInput {
  username: string;
  password: string;
}

interface RegisterInput {
  fullName: string;
  email: string;
  username: string;
  password: string;
}

export interface GoogleAuthInput {
  clientId: string;
  credential: string;
  select_by: string;
}

export interface GetUserResponse {
  data: User;
}

export const useAuth = () => {
  const loginMutation = useMutation<GetUserResponse, Error, LoginInput>({
    mutationFn: async (credentials: LoginInput): Promise<GetUserResponse> => {
      const response = await apiRequest("POST", "/user/login", credentials);

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Login Successfull");
    },
    onError: () => {
      toast.error("Invalid credentials!");
    },
  });

  const getUser = useQuery<GetUserResponse, Error>({
    queryKey: ["user"],
    queryFn: async (): Promise<GetUserResponse> => {
      const response = await apiRequest("GET", "/user/verify-token");

      return response.json();
    },
    enabled: false,
    gcTime: 0,
    staleTime: 0,
  });

  const logoutMutation = useMutation<{ message: string }, Error>({
    mutationFn: async (): Promise<{ message: string }> => {
      const response = await apiRequest("POST", "/user/logout");

      return await response.json();
    },
  });

  const registerMutation = useMutation<GetUserResponse, Error, RegisterInput>({
    mutationFn: async (
      credentials: RegisterInput
    ): Promise<GetUserResponse> => {
      const response = await apiRequest("POST", "/user/register", credentials);

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Signup Successfull");
    },
    onError: () => {
      toast.error("Failed to Signup!");
    },
  });

  const googleAuthMutation = useMutation<
    GetUserResponse,
    Error,
    GoogleAuthInput
  >({
    mutationFn: async (
      credentials: GoogleAuthInput
    ): Promise<GetUserResponse> => {
      const response = await apiRequest(
        "POST",
        "/user/google-auth",
        credentials
      );

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Google Auth Successfull");
    },
    onError: () => {
      toast.error("Google Auth Failed!");
    },
  });

  return {
    loginMutation,
    getUser,
    logoutMutation,
    registerMutation,
    googleAuthMutation,
  };
};
