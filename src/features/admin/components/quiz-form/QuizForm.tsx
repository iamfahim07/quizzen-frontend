import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { useGetTopics } from "@/api/use-get-topics";
import { useCreateQuizzes } from "@/features/admin/api/use-create-quizzes";
import { useUpdateQuiz } from "@/features/admin/api/use-update-quiz";

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

import { quizFormSchema } from "@/features/admin/components/quiz-form/quiz-form.schemas";
import type {
  QuestionForm,
  QuizFormData,
  QuizFormProps,
} from "@/features/admin/components/quiz-form/quiz-form.types";
import type { QuestionType } from "@/types";

export const QuizForm = ({
  topic,
  editingQuiz,
  onCancel,
  setIsQuizDialogOpen,
}: QuizFormProps) => {
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
      if (name && name.startsWith("quizzes")) {
        form.trigger("quizValidationSummary");
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

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
    append(defaultQuiz);
  };

  const removeQuestion = (index: number) => {
    remove(index);
  };

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
    const { quizzes } = data;

    const validQuestions = quizzes.map((q) => {
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
                              {...field}
                              placeholder={`Option ${optionIndex + 1}`}
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
                              onClick={() =>
                                swapQuizOptions(
                                  quizIndex,
                                  optionIndex,
                                  optionIndex + 1
                                )
                              }
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
};
