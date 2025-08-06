import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/api/api-client";

import type { TopicResponse } from "@/types";

interface UseGetTopicsResponse {
  data: TopicResponse[];
}

export const useGetTopics = () => {
  const query = useQuery<UseGetTopicsResponse, Error>({
    queryKey: ["topics"],
    queryFn: async (): Promise<UseGetTopicsResponse> => {
      const response = await apiRequest("GET", "/topics");

      return await response.json();
    },
    // initialData: { data: [] },
  });

  return query;
};
