import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiRequest } from "@/api/api-client";

import type { Quiz } from "@/types";

export const useUpdateQuiz = (
  topicId: string,
  onQuizUpdateSuccess: () => void
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<Quiz[], Error, Quiz[]>({
    mutationFn: async (data: Quiz[]): Promise<Quiz[]> => {
      const response = await apiRequest("PUT", `/quizzes/${topicId}`, data);

      return await response.json();
    },
    onSuccess: () => {
      onQuizUpdateSuccess();
      toast.success("Quiz updated");

      queryClient.invalidateQueries({ queryKey: [`quizzes_${topicId}`] });
    },
    onError: () => {
      toast.error("Failed to update quiz");
    },
  });

  return mutation;
};
