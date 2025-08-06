import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiRequest } from "@/api/api-client";

interface DeleteQuizID {
  _id: string;
}

export const useDeleteQuiz = (topicId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<DeleteQuizID, Error, DeleteQuizID>({
    mutationFn: async (data: DeleteQuizID) => {
      const response = await apiRequest("DELETE", `/quizzes/${topicId}`, data);

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Quiz deleted");

      queryClient.invalidateQueries({ queryKey: [`quizzes_${topicId}`] });
    },
    onError: () => {
      toast.error("Failed to delete quiz");
    },
  });

  return mutation;
};
