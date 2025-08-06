import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

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
              // (arr, val, i) => (val.isCorrect ? arr.concat(i) : arr),
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

  const [topicId, setTopicId] = useState(topic?._id || "");
  const [quizzes, setQuizzes] = useState<QuestionForm[]>([
    editQuiz ?? defaultQuiz,
  ]);

  // const { data: responseData } = useGetTopics();
  const { data: { data: topicsData } = { data: [] } } = useGetTopics();
  // const topicsData = responseData?.data ?? [];

  const { isPending: isCreatePending, mutate: createQuizzes } =
    useCreateQuizzes(topicId, () => setIsQuizDialogOpen(false));

  const { isPending: isUpdatePending, mutate: updateQuiz } = useUpdateQuiz(
    topicId,
    () => setIsQuizDialogOpen(false)
  );

  const isPending = isCreatePending || isUpdatePending;

  const addQuestion = () => {
    setQuizzes([
      ...quizzes,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswers: [],
        type: "multiple-choice",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuizzes(quizzes.filter((_, i) => i !== index));
  };

  const updateQuestion = (
    index: number,
    field: keyof QuestionForm,
    value: string | number | unknown[]
  ) => {
    const updated = quizzes.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    );
    setQuizzes(updated);
  };

  const updateQuestionOption = (
    quizIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updated = quizzes.map((q, i) =>
      i === quizIndex
        ? {
            ...q,
            options: q.options.map((opt, oi) =>
              oi === optionIndex ? value : opt
            ),
          }
        : q
    );
    setQuizzes(updated);
  };

  const moveOption = (
    quizIndex: number,
    optionIndex: number,
    direction: "up" | "down"
  ) => {
    const question = quizzes[quizIndex];
    if (!question) return;

    const newIndex = direction === "up" ? optionIndex - 1 : optionIndex + 1;
    if (newIndex < 0 || newIndex >= question.options.length) return;

    const newOptions = [...question.options];
    [newOptions[optionIndex], newOptions[newIndex]] = [
      newOptions[newIndex],
      newOptions[optionIndex],
    ];

    updateQuestion(quizIndex, "options", newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!topicId) return;

    const validQuestions = quizzes
      .filter((q) => q.question.trim() && q.options.every((opt) => opt.trim()))
      .map((obj) => {
        const sortable = obj.type === "sortable";

        return {
          question: obj.question,
          isSortQuiz: sortable,
          isMultiple: sortable ? false : obj.correctAnswers.length > 1,
          options: obj.options.map((option, index) => ({
            value: option,
            isCorrect: sortable ? false : obj.correctAnswers.includes(index),
            position: sortable ? index + 1 : null,
          })),
        };
      });

    if (quizzes.length !== validQuestions.length) {
      alert("Empty field detected, Please fill out the empty field.");
      return;
    }

    // const payload: Quiz[] =
    //   editingQuiz?._id &&
    //   validQuestions.map((q) => ({ id: editingQuiz._id, ...q }));

    const payload = validQuestions.map((q) => ({
      id: editingQuiz?._id,
      ...q,
    }));

    return editingQuiz?._id
      ? updateQuiz(payload)
      : createQuizzes(validQuestions);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <Select
          value={topicId}
          onValueChange={setTopicId}
          disabled={isPending || !!topic?._id}
          required
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
      </div>

      {/* Questions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quiz Questions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="max-md:px-2 space-y-6">
          {quizzes.map((quiz, quizIndex) => (
            <Card key={quizIndex} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center-safe justify-between">
                  <Label>Question {!editingQuiz?._id && quizIndex + 1}</Label>

                  {quizzes.length > 1 && (
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

                <Textarea
                  value={quiz.question}
                  onChange={(e) =>
                    updateQuestion(quizIndex, "question", e.target.value)
                  }
                  placeholder="Enter your question"
                  required
                  disabled={isPending}
                />

                <div className="space-y-3">
                  <Label>
                    {quiz.type === "sortable"
                      ? "Answer Options (in correct order)"
                      : "Answer Options"}
                  </Label>
                  {quiz.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="flex items-center space-x-2"
                    >
                      <Input
                        value={option}
                        onChange={(e) =>
                          updateQuestionOption(
                            quizIndex,
                            optionIndex,
                            e.target.value
                          )
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                        required
                        disabled={isPending}
                      />
                      {quiz.type === "sortable" ? (
                        <div className="flex flex-col space-y-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              moveOption(quizIndex, optionIndex, "up")
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
                              moveOption(quizIndex, optionIndex, "down")
                            }
                            disabled={
                              isPending ||
                              optionIndex === quiz.options.length - 1
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
                            checked={quiz.correctAnswers.includes(optionIndex)}
                            onChange={(e) => {
                              const currentAnswers = quiz.correctAnswers;
                              if (e.target.checked) {
                                updateQuestion(quizIndex, "correctAnswers", [
                                  ...currentAnswers,
                                  optionIndex,
                                ]);
                              } else {
                                updateQuestion(
                                  quizIndex,
                                  "correctAnswers",
                                  currentAnswers.filter(
                                    (i) => i !== optionIndex
                                  )
                                );
                              }
                            }}
                            className="w-4 h-4 cursor-pointer"
                            disabled={isPending}
                          />
                          <Label className="text-sm">Correct</Label>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quizType">Quiz Type</Label>
                <Select
                  value={quiz.type}
                  onValueChange={(value: QuestionType) =>
                    updateQuestion(quizIndex, "type", value)
                  }
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
                    <SelectItem value="sortable" className="cursor-pointer">
                      Sortable
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          ))}
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
