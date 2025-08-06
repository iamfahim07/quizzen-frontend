import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiRequest } from "@/api/api-client";

import type { TopicMutation, TopicResponse } from "@/types";

export const useCreateTopic = (onTopicCreateSuccess: () => void) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<TopicResponse, Error, TopicMutation>({
    mutationFn: async ({
      title,
      description,
      files,
    }: TopicMutation): Promise<TopicResponse> => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("quiz_image", files![0]);

      const response = await apiRequest("POST", "/topics", formData);

      return await response.json();
    },
    onSuccess: () => {
      onTopicCreateSuccess();
      toast.success("Topic created");

      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
    onError: () => {
      toast.error("Failed to create topic");
    },
  });

  return mutation;
};
