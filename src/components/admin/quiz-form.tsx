import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { useCreateQuizzes } from "@/api/admin/use-create-quizzes";
import { useUpdateQuiz } from "@/api/admin/use-update-quiz";
import { useGetTopics } from "@/api/use-get-topics";

import { SpinnerLoader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";
import type { QuestionType, Quiz, TopicResponse } from "@/types";
import { useEffect } from "react";

interface QuizFormProps {
  topic: TopicResponse | null;
  editingQuiz?: Quiz | null;
  onCancel: () => void;
  setIsQuizDialogOpen: (open: boolean) => void;
}

interface QuestionForm {
  readonly id?: string;
  question: string;
  options: string[];
  correctAnswers: number[];
  type: QuestionType;
}

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

// Main form schema with a custom refinement for conditional validation
const quizFormSchema = z
  .object({
    topicId: z.string().trim().min(1, "Please select a topic."),
    quizValidationSummary: z.string().optional(),
    quizzes: z
      .array(questionSchema)
      .min(1, "At least one question is required."),
    // .refine(
    //   (quizzes) => {
    //     return quizzes.every(
    //       (q) => q.type === "sortable" || q.correctAnswers.length > 0
    //     );
    //   },
    //   (quizzes) => {
    //     const errorIndices = quizzes
    //       .map((q, index) =>
    //         q.type === "multiple-choice" && q.correctAnswers.length === 0
    //           ? index + 1
    //           : null
    //       )
    //       .filter(Boolean);

    //     const message =
    //       errorIndices.length === 1
    //         ? `Question ${errorIndices[0]}: Multiple-choice questions must have at least one correct answer selected.`
    //         : `Questions ${errorIndices.join(", ")}: Multiple-choice questions must have at least one correct answer selected.`;

    //     return { message };
    //   }
    // ),
  })
  .superRefine(({ quizzes }, ctx) => {
    const errorIndices: number[] = [];

    quizzes.forEach((quiz, index) => {
      let hasError = false;

      // Check question
      if (!quiz.question || quiz.question.trim().length === 0) {
        hasError = true;
      }

      // Check options
      if (
        !quiz.options ||
        quiz.options.length !== 4 ||
        quiz.options.some((opt) => !opt || opt.trim().length === 0)
      ) {
        hasError = true;
      }

      // Check correct answers for multiple-choice
      if (
        quiz.type === "multiple-choice" &&
        (!quiz.correctAnswers || quiz.correctAnswers.length === 0)
      ) {
        hasError = true;
      }

      if (hasError) {
        errorIndices.push(index + 1); // +1 for human-readable numbering
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
// Infer the TypeScript type from the schema
export type QuizFormData = z.infer<typeof quizFormSchema>;

export default function QuizForm({
  topic,
  editingQuiz,
  onCancel,
  setIsQuizDialogOpen,
}: QuizFormProps) {
  const editQuiz = editingQuiz
    ? {
        id: editingQuiz?._id,
        question: editingQuiz?.question,
        options: editingQuiz?.options.map((o) => o.value),
        correctAnswers: editingQuiz?.isSortQuiz
          ? []
          : editingQuiz?.options.reduce<number[]>(
              (arr, val, i) => (val.isCorrect ? [...arr, i] : arr),
              []
            ),
        type: editingQuiz?.isSortQuiz
          ? "sortable"
          : ("multiple-choice" as QuestionType),
      }
    : null;

  const defaultQuiz: QuestionForm = {
    question: "",
    options: ["", "", "", ""],
    correctAnswers: [],
    type: "multiple-choice",
  };

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      topicId: topic?._id || "",
      quizzes: [editQuiz ?? defaultQuiz],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "quizzes",
  });

  const watchedQuizzes = form.watch("quizzes");

  useEffect(() => {
    const subscription = form.watch((_, { name }) => {
      // Trigger custom validation when quiz-related fields change
      if (name && name.startsWith("quizzes")) {
        form.trigger("quizValidationSummary");
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // const [topicId, setTopicId] = useState(topic?._id || "");
  // const [quizzes, setQuizzes] = useState<QuestionForm[]>([
  //   editQuiz ?? defaultQuiz,
  // ]);

  const { data: { data: topicsData } = { data: [] } } = useGetTopics();

  const { isPending: isCreatePending, mutate: createQuizzes } =
    useCreateQuizzes(form.getValues("topicId"), () =>
      setIsQuizDialogOpen(false)
    );

  const { isPending: isUpdatePending, mutate: updateQuiz } = useUpdateQuiz(
    form.getValues("topicId"),
    () => setIsQuizDialogOpen(false)
  );

  const isPending = isCreatePending || isUpdatePending;

  const addQuestion = () => {
    // setQuizzes([
    //   ...quizzes,
    //   {
    //     question: "",
    //     options: ["", "", "", ""],
    //     correctAnswers: [],
    //     type: "multiple-choice",
    //   },
    // ]);
    append(defaultQuiz);
  };

  const removeQuestion = (index: number) => {
    // setQuizzes(quizzes.filter((_, i) => i !== index));
    remove(index);
  };

  // const updateQuestion = (
  //   index: number,
  //   field: keyof QuestionForm,
  //   value: string | number | unknown[]
  // ) => {
  //   const updated = quizzes.map((q, i) =>
  //     i === index ? { ...q, [field]: value } : q
  //   );
  //   setQuizzes(updated);
  // };

  // const updateQuestionOption = (
  //   quizIndex: number,
  //   optionIndex: number,
  //   value: string
  // ) => {
  //   const updated = quizzes.map((q, i) =>
  //     i === quizIndex
  //       ? {
  //           ...q,
  //           options: q.options.map((opt, oi) =>
  //             oi === optionIndex ? value : opt
  //           ),
  //         }
  //       : q
  //   );
  //   setQuizzes(updated);
  // };

  // const moveOption = (
  //   quizIndex: number,
  //   optionIndex: number,
  //   direction: "up" | "down"
  // ) => {
  //   const question = quizzes[quizIndex];
  //   if (!question) return;

  //   const newIndex = direction === "up" ? optionIndex - 1 : optionIndex + 1;
  //   if (newIndex < 0 || newIndex >= question.options.length) return;

  //   const newOptions = [...question.options];
  //   [newOptions[optionIndex], newOptions[newIndex]] = [
  //     newOptions[newIndex],
  //     newOptions[optionIndex],
  //   ];

  //   updateQuestion(quizIndex, "options", newOptions);
  // };

  const swapQuizOptions = (
    quizIndex: number,
    currentIndex: number,
    newIndex: number
  ) => {
    const currentQuiz = form.getValues("quizzes");
    const currentQuestion = currentQuiz[quizIndex];
    if (
      !currentQuestion ||
      newIndex < 0 ||
      newIndex >= currentQuestion.options.length
    )
      return;

    const currentOptions = form.getValues(`quizzes.${quizIndex}.options`);

    const newOptions = [...currentOptions];
    [newOptions[currentIndex], newOptions[newIndex]] = [
      newOptions[newIndex],
      newOptions[currentIndex],
    ];
    form.setValue(`quizzes.${quizIndex}.options`, newOptions);
  };

  const onSubmit = (data: QuizFormData) => {
    // e.preventDefault();

    // if (!topicId) return;

    const { quizzes } = data;

    const validQuestions = quizzes
      // .filter((q) => q.question.trim() && q.options.every((opt) => opt.trim()))
      .map((q) => {
        const isSortable = q.type === "sortable";

        return {
          question: q.question,
          isSortQuiz: isSortable,
          isMultiple: isSortable ? false : q.correctAnswers.length > 1,
          options: q.options.map((option, index) => ({
            value: option,
            isCorrect: isSortable ? false : q.correctAnswers.includes(index),
            position: isSortable ? index + 1 : null,
          })),
        };
      });

    // if (quizzes.length !== validQuestions.length) {
    //   alert("Empty field detected, Please fill out the empty field.");
    //   return;
    // }

    const payload = validQuestions.map((q) => ({
      id: editingQuiz?._id,
      ...q,
    }));

    return editingQuiz?._id
      ? updateQuiz(payload)
      : createQuizzes(validQuestions);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>

        <Controller
          control={form.control}
          name="topicId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isPending || !!topic?._id}
              // required
            >
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {topicsData.map((topic) => (
                  <SelectItem
                    key={topic._id}
                    value={topic._id ?? ""}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <span>{topic.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.topicId && (
          <p className="text-sm text-[var(--destructive)]">
            {form.formState.errors.topicId.message}
          </p>
        )}
      </div>

      {/* Questions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quiz Questions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="max-md:px-2 space-y-6">
          {fields.map((quiz, quizIndex) => (
            <Card
              key={quiz.id}
              className="bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4"
            >
              <div className="space-y-7">
                <div className="space-y-3">
                  <div className="flex items-center-safe justify-between">
                    <Label>Question {!editingQuiz?._id && quizIndex + 1}</Label>

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer group/trash_btn"
                        onClick={() => removeQuestion(quizIndex)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4 group-hover/trash_btn:text-red-500" />
                      </Button>
                    )}
                  </div>

                  <Controller
                    control={form.control}
                    name={`quizzes.${quizIndex}.question`}
                    render={({ field }) => (
                      <Textarea
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enter your question"
                        // required
                        disabled={isPending}
                      />
                    )}
                  />
                  {form.formState.errors.quizzes?.[quizIndex]?.question && (
                    <p className="text-sm text-[var(--destructive)]">
                      {
                        form.formState.errors.quizzes[quizIndex]?.question
                          ?.message
                      }
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="quizType">Quiz Type</Label>

                  <Controller
                    control={form.control}
                    name={`quizzes.${quizIndex}.type`}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          field.onChange(v);
                          form.trigger(`quizzes.${quizIndex}.correctAnswers`);
                        }}
                        disabled={isPending}
                      >
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="multiple-choice"
                            className="cursor-pointer"
                          >
                            Multiple Choice
                          </SelectItem>
                          <SelectItem
                            value="sortable"
                            className="cursor-pointer"
                          >
                            Sortable
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {form.formState.errors.quizzes?.[quizIndex]
                    ?.correctAnswers && (
                    <p className="text-sm text-[var(--destructive)]">
                      {
                        form.formState.errors.quizzes[quizIndex].correctAnswers
                          .message
                      }
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>
                    {watchedQuizzes[quizIndex]?.type === "sortable"
                      ? "Answer Options (in correct order)"
                      : "Answer Options"}
                  </Label>
                  {watchedQuizzes[quizIndex].options.map((_, optionIndex) => (
                    <>
                      <div
                        key={optionIndex}
                        className="flex items-center space-x-2"
                      >
                        <Controller
                          control={form.control}
                          name={`quizzes.${quizIndex}.options.${optionIndex}`}
                          render={({ field }) => (
                            <Input
                              // {...form.register(
                              //   `quizzes.${quizIndex}.options.${optionIndex}`
                              // )}
                              {...field}
                              // value={option}
                              // onChange={(e) =>
                              //   updateQuestionOption(
                              //     quizIndex,
                              //     optionIndex,
                              //     e.target.value
                              //   )
                              // }
                              placeholder={`Option ${optionIndex + 1}`}
                              // required
                              disabled={isPending}
                            />
                          )}
                        />

                        {watchedQuizzes[quizIndex]?.type === "sortable" ? (
                          <div className="flex flex-col space-y-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              // onClick={() =>
                              //   moveOption(quizIndex, optionIndex, "up")
                              // }
                              onClick={() =>
                                swapQuizOptions(
                                  quizIndex,
                                  optionIndex,
                                  optionIndex - 1
                                )
                              }
                              disabled={isPending || optionIndex === 0}
                              className="h-6 w-6 p-0 cursor-pointer"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              // onClick={() =>
                              //   moveOption(quizIndex, optionIndex, "down")
                              // }
                              onClick={() =>
                                swapQuizOptions(
                                  quizIndex,
                                  optionIndex,
                                  optionIndex + 1
                                )
                              }
                              // disabled={
                              //   isPending ||
                              //   optionIndex === quiz.options.length - 1
                              // }
                              disabled={
                                isPending ||
                                optionIndex ===
                                  watchedQuizzes[quizIndex].options.length - 1
                              }
                              className="h-6 w-6 p-0 cursor-pointer"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <input
                              type="checkbox"
                              checked={form
                                .getValues(
                                  `quizzes.${quizIndex}.correctAnswers`
                                )
                                .includes(optionIndex)}
                              onChange={(e) => {
                                const currentAnswers =
                                  form.getValues(
                                    `quizzes.${quizIndex}.correctAnswers`
                                  ) || [];
                                // if (e.target.checked) {
                                //   updateQuestion(quizIndex, "correctAnswers", [
                                //     ...currentAnswers,
                                //     optionIndex,
                                //   ]);
                                // } else {
                                //   updateQuestion(
                                //     quizIndex,
                                //     "correctAnswers",
                                //     currentAnswers.filter(
                                //       (i) => i !== optionIndex
                                //     )
                                //   );
                                // }
                                const newAnswers = e.target.checked
                                  ? [...currentAnswers, optionIndex]
                                  : currentAnswers.filter(
                                      (i) => i !== optionIndex
                                    );

                                form.setValue(
                                  `quizzes.${quizIndex}.correctAnswers`,
                                  newAnswers,
                                  {
                                    shouldValidate: true,
                                  }
                                );

                                // form.trigger(
                                //   `quizzes.${quizIndex}.correctAnswers`
                                // );
                              }}
                              className="w-4 h-4 cursor-pointer"
                              disabled={isPending}
                            />
                            <Label
                              className={cn(
                                "text-sm",
                                form.formState.errors.quizzes?.[quizIndex]
                                  ?.correctAnswers &&
                                  "text-[var(--destructive)]"
                              )}
                            >
                              Correct
                            </Label>
                          </>
                        )}
                      </div>
                      {form.formState.errors.quizzes?.[quizIndex]?.options?.[
                        optionIndex
                      ] && (
                        <p className="text-sm text-[var(--destructive)]">
                          {
                            form.formState.errors.quizzes?.[quizIndex]
                              ?.options?.[optionIndex].message
                          }
                        </p>
                      )}
                    </>
                  ))}
                </div>
              </div>
            </Card>
          ))}
          {form.formState.errors.topicId && (
            <p className="text-sm text-[var(--destructive)] text-center">
              {form.formState.errors.topicId.message}
            </p>
          )}

          {form.formState.errors.quizValidationSummary && (
            <p className="text-sm text-[var(--destructive)] text-center">
              {form.formState.errors.quizValidationSummary.message}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 space-x-2 pt-4">
        <Button
          type="button"
          onClick={addQuestion}
          size="sm"
          className={cn(
            "w-full bg-violet-600 hover:bg-violet-500 cursor-pointer",
            editingQuiz?._id && "hidden"
          )}
          disabled={isPending || !!editingQuiz?._id}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>

        <div className="w-full flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-1/2 cursor-pointer"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-1/2 bg-violet-600 hover:bg-violet-500 cursor-pointer"
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center justify-center">
                <SpinnerLoader className="text-white mr-2" /> Processing...
              </span>
            ) : editingQuiz ? (
              "Update Quiz"
            ) : (
              "Create Quiz"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
