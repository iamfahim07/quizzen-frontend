import { Edit, Trash2 } from "lucide-react";

import { useDeleteQuiz } from "@/api/admin/use-delete-quiz";
import { useGetQuizzes } from "@/api/use-get-quizzes";

import {
  EmptyStateComponent,
  ErrorComponent,
} from "@/components/fallback-component";
import { SpinnerLoader } from "@/components/loader";
import { Button } from "@/components/ui/button";

import { useConfirm } from "@/hooks/use-confirm";

import { cn } from "@/lib/utils";

import type { Quiz } from "@/types";

interface QuizzesListProps {
  topicId: string;
  searchTerm: string;
  onUpdateClick: (quiz: Quiz) => void;
}

export const QuizzesList = ({
  topicId,
  searchTerm,
  onUpdateClick,
}: QuizzesListProps) => {
  const {
    isPending,
    error,
    data: { data: fetchedQuizzes } = { data: [] },
    refetch,
  } = useGetQuizzes(topicId);

  const filteredQuizzes = fetchedQuizzes?.filter((quiz) =>
    quiz.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { mutate } = useDeleteQuiz(topicId);

  const [DeleteQuizDialog, confirmDeleteQuiz] = useConfirm(
    `Delete Quiz?`,
    "This action cannot be undone.",
    "destructive"
  );

  const handleDeleteQuiz = async (id: string) => {
    const ok = await confirmDeleteQuiz();
    if (!ok) return;

    mutate({ _id: id });
  };

  if (isPending) return <SpinnerLoader />;

  if (filteredQuizzes.length === 0) return <EmptyStateComponent />;

  if (error) return <ErrorComponent onRetry={refetch} isLoading={isPending} />;

  return (
    <div className="space-y-4">
      <DeleteQuizDialog />

      {filteredQuizzes.map((quiz, index) => (
        <div
          key={quiz._id}
          className="w-full flex p-4 rounded-lg border-l-4 bg-green-50 border-green-500 shadow"
        >
          <div className="w-full">
            <div className="mb-2">
              <h4 className="font-semibold text-gray-900">Quiz {index + 1}</h4>
            </div>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Question:</span> {quiz.question}
            </p>

            <p className="text-gray-600">
              <span className="font-semibold">
                {quiz.isSortQuiz ? "Correct sorting: " : "Options: "}
              </span>
              {quiz.options.map((option, index) => (
                <span
                  key={option._id}
                  className={cn(
                    "font-medium text-red-700",
                    quiz.isSortQuiz && "text-green-700",
                    !quiz.isSortQuiz && option.isCorrect && "text-green-700"
                  )}
                >
                  {index ? ", " : ""}
                  {option.value}
                </span>
              ))}
            </p>
          </div>

          <div className="w-fit flex flex-col justify-center-safe items-center-safe gap-3">
            <Button
              size="sm"
              variant="ghost"
              className="cursor-pointer"
              onClick={() => onUpdateClick(quiz)}
            >
              <Edit size={14} />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700 cursor-pointer"
              onClick={() => handleDeleteQuiz(quiz._id!)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
