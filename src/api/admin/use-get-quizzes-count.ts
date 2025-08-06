import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/api/api-client";

interface UseGetQuizzesCountResponse {
  data: number;
}

export const useGetQuizzesCount = () => {
  const query = useQuery<UseGetQuizzesCountResponse, Error>({
    queryKey: ["quizzes_count"],
    queryFn: async (): Promise<UseGetQuizzesCountResponse> => {
      const response = await apiRequest("GET", "/quizzes/count");

      return await response.json();
    },

    // initialData: { data: 0 },
  });

  return query;
};
