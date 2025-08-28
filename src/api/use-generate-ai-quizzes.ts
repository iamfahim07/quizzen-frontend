import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiRequest } from "@/api/api-client";

import { useAiChatStore, useAiQuizStore } from "@/hooks/use-ai-quiz-store";
import { useProgressStore } from "@/hooks/use-progress-store";

import type { Difficulty, Quiz } from "@/types";

interface GenerateAiQuizzesInput {
  prompt: string;
  difficulty: Difficulty;
  conversationId: string;
  modifyExisting: boolean;
  files: File[];
}

interface GenerateAiQuizzesResponse {
  data: {
    conversationId: string;
    message: string;
    topic: string;
    description: string;
    quizData: Quiz[];
  };
}

export const useGenerateAiQuizzes = () => {
  const { setProgress, resetProgress } = useProgressStore();
  const { setChatHistoryById } = useAiChatStore();
  const { setAIQuizDataById } = useAiQuizStore();

  const mutation = useMutation<
    GenerateAiQuizzesResponse,
    Error,
    GenerateAiQuizzesInput
  >({
    mutationFn: async ({
      prompt,
      difficulty,
      conversationId,
      modifyExisting,
      files,
    }: GenerateAiQuizzesInput): Promise<GenerateAiQuizzesResponse> => {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("difficulty", difficulty);
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
      const { conversationId, topic, description, quizData, message } = data;

      await setProgress(100);

      toast.success("Ai generated quizzes created");

      setAIQuizDataById({
        conversationId: conversationId,
        isPending: false,
        isSuccess: true,
        isError: false,
        ...(topic.length > 0 && { topic: topic }),
        ...(description.length > 0 && { description: description }),
        ...(quizData.length > 0 && { quizzes: quizData }),
      });

      setChatHistoryById(conversationId, {
        role: "ai",
        text: message,
      });
    },
    onError: (_, variables: GenerateAiQuizzesInput) => {
      toast.error("Failed to create quizzes");

      setAIQuizDataById({
        conversationId: variables.conversationId,
        isPending: false,
        isSuccess: false,
        isError: true,
      });

      setChatHistoryById(variables.conversationId, {
        role: "ai",
        text: "An error occurred. Please try again.",
        isError: true,
      });

      resetProgress();
    },
  });

  return mutation;
};
