import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiRequest } from "@/api/api-client";

import type { TopicMutation, TopicResponse } from "@/types";

export const useUpdateTopic = (onTopicUpdateSuccess: () => void) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<TopicResponse, Error, TopicMutation>({
    mutationFn: async ({
      id,
      title,
      description,
      files = [],
    }: TopicMutation): Promise<TopicResponse> => {
      const formData = new FormData();
      formData.append("id", id!);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("quiz_image", files[0]);

      const response = await apiRequest("PUT", "/topics", formData);

      return await response.json();
    },
    onSuccess: () => {
      onTopicUpdateSuccess();
      toast.success("Topic updated");

      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
    onError: () => {
      toast.error("Failed to update topic");
    },
  });

  return mutation;
};
