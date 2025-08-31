import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/api/api-client";

import type { User } from "@/types";

interface useGetUsersResponse {
  data: User[];
}

export const useGetUsers = () => {
  const query = useQuery<useGetUsersResponse, Error>({
    queryKey: ["users"],
    queryFn: async (): Promise<useGetUsersResponse> => {
      const response = await apiRequest("GET", "/users");

      return await response.json();
    },
    // initialData: { data: [] },
  });

  return query;
};
