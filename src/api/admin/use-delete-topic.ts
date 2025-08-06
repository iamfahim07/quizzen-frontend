import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiRequest } from "@/api/api-client";

interface DeleteTopicID {
  topicId: string;
}

export const useDeleteTopic = (title: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<DeleteTopicID, Error, DeleteTopicID>({
    mutationFn: async ({ topicId }: DeleteTopicID) => {
      const response = await apiRequest("DELETE", "/topics", { topicId });

      return await response.json();
    },
    onSuccess: () => {
      toast.success(`${title} topic deleted`);

      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
    onError: () => {
      toast.error(`Failed to delete ${title} topic`);
    },
  });

  return mutation;
};
