import { z } from "zod";

const optionSchema = z.string().trim().min(1, "Option cannot be empty.");

const questionSchema = z
  .object({
    id: z.string().trim().optional(),
    question: z.string().trim().min(1, "Question is required."),
    options: z.array(optionSchema).length(4, "Must have exactly 4 options."),
    correctAnswers: z.array(z.number()),
    type: z.enum(["multiple-choice", "sortable"]),
  })
  .refine(
    (data) => {
      if (data.type === "multiple-choice") {
        return data.correctAnswers.length > 0;
      }
      return true;
    },
    {
      message:
        "Multiple-choice questions must have at least one correct answer selected.",
      path: ["correctAnswers"],
    }
  );

export const quizFormSchema = z
  .object({
    topicId: z.string().trim().min(1, "Please select a topic."),
    quizValidationSummary: z.string().optional(),
    quizzes: z
      .array(questionSchema)
      .min(1, "At least one question is required."),
  })
  .superRefine(({ quizzes }, ctx) => {
    const errorIndices: number[] = [];

    quizzes.forEach((quiz, index) => {
      let hasError = false;

      if (!quiz.question || quiz.question.trim().length === 0) {
        hasError = true;
      }

      if (
        !quiz.options ||
        quiz.options.length !== 4 ||
        quiz.options.some((opt) => !opt || opt.trim().length === 0)
      ) {
        hasError = true;
      }

      if (
        quiz.type === "multiple-choice" &&
        (!quiz.correctAnswers || quiz.correctAnswers.length === 0)
      ) {
        hasError = true;
      }

      if (hasError) {
        errorIndices.push(index + 1);
      }
    });

    if (errorIndices.length > 0) {
      const message =
        errorIndices.length === 1
          ? `Question ${errorIndices[0]} has blank fields.`
          : `Questions ${errorIndices.join(", ")} have blank fields.`;

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: ["quizValidationSummary"],
      });
    }
  });
