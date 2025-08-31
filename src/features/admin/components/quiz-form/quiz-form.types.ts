import { z } from "zod";

import { quizFormSchema } from "@/features/admin/components/quiz-form/quiz-form.schemas";
import type { QuestionType, Quiz, TopicResponse } from "@/types";

export interface QuizFormProps {
  topic: TopicResponse | null;
  editingQuiz?: Quiz | null;
  onCancel: () => void;
  setIsQuizDialogOpen: (open: boolean) => void;
}

export interface QuestionForm {
  readonly id?: string;
  question: string;
  options: string[];
  correctAnswers: number[];
  type: QuestionType;
}

export type QuizFormData = z.infer<typeof quizFormSchema>;
