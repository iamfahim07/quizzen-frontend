import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiRequest } from "@/api/api-client";

import type { Quiz } from "@/types";

export const useCreateQuizzes = (
  topicId: string,
  onQuizzesCreateSuccess: () => void
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<Quiz[], Error, Quiz[]>({
    mutationFn: async (data: Quiz[]): Promise<Quiz[]> => {
      const response = await apiRequest("POST", `/quizzes/${topicId}`, data);

      return await response.json();
    },
    onSuccess: () => {
      onQuizzesCreateSuccess();
      toast.success("Quizzes created");

      queryClient.invalidateQueries({ queryKey: [`quizzes_${topicId}`] });
    },
    onError: () => {
      toast.error("Failed to create quizzes");
    },
  });

  return mutation;
};
