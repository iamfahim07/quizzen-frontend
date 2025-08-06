import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiRequest } from "@/api/api-client";

import { useAppStore } from "@/hooks/use-app-store";
import { useProgressStore } from "@/hooks/use-progress-store";

import type { Quiz } from "@/types";

interface GenerateAiQuizzesInput {
  prompt: string;
  conversationId: string;
  modifyExisting: boolean;
  files: File[];
}

interface GenerateAiQuizzesResponse {
  data: {
    conversationId: string;
    message: string;
    topic: string;
    quizData: Quiz[];
  };
}

export const useGenerateAiQuizzes = () => {
  const { setProgress } = useProgressStore();
  const { setChatHistoryById, setAIQuizDataById } = useAppStore();

  const mutation = useMutation<
    GenerateAiQuizzesResponse,
    Error,
    GenerateAiQuizzesInput
  >({
    mutationFn: async ({
      prompt,
      conversationId,
      modifyExisting,
      files,
    }: GenerateAiQuizzesInput): Promise<GenerateAiQuizzesResponse> => {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("conversationId", conversationId);
      formData.append("modifyExisting", modifyExisting.toString());

      if (files.length > 0) {
        files.forEach((file) => {
          formData.append("quiz_files", file);
        });
      }

      const response = await apiRequest("POST", "/generate-quiz", formData);

      return await response.json();
    },
    onSuccess: async ({ data }) => {
      const { conversationId, topic, quizData, message } = data;

      await setProgress(100);

      toast.success("Ai generated quizzes created");

      setAIQuizDataById({
        conversationId: conversationId,
        isPending: false,
        isSuccess: true,
        isError: false,
        topic: topic,
        quizzes: quizData,
      });

      setChatHistoryById(conversationId, {
        role: "ai",
        text: message,
      });
    },
    onError: () => {
      toast.error("Failed to create quizzes");
    },
  });

  return mutation;
};
