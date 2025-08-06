import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/api/api-client";

import type { Quiz } from "@/types";

interface UseGetQuizzesResponse {
  data: Quiz[];
}

export const useGetQuizzes = (topicId: string, source?: string) => {
  const query = useQuery<UseGetQuizzesResponse, Error>({
    queryKey: [`quizzes_${topicId}`],
    queryFn: async (): Promise<UseGetQuizzesResponse> => {
      const response = await apiRequest("GET", `/quizzes/${topicId}`);

      return await response.json();
    },
    enabled: source !== "ai",
    // initialData: { data: [] },
  });

  return query;
};
