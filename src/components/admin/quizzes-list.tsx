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

  if (isPending) return <SpinnerLoader />;

  if (filteredQuizzes.length === 0) return <EmptyStateComponent />;

  if (error) return <ErrorComponent onRetry={refetch} isLoading={isPending} />;

  return (
    <div className="space-y-4">
      {filteredQuizzes.map((quiz, index) => (
        <div
          key={quiz._id}
          className="w-full flex p-4 rounded-lg border-l-4 bg-green-50 border-green-500 shadow"
        >
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-900">Quiz {index + 1}</h4>

              <div className="w-fit flex justify-center-safe items-center-safe gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="cursor-pointer"
                  onClick={() => onUpdateClick(quiz)}
                >
                  <Edit />
                </Button>

                <DeleteQuizButton topicId={topicId} quiz={quiz} />
              </div>
            </div>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Question:</span> {quiz.question}
            </p>

            <div className="text-gray-600">
              <p className="font-semibold">
                {quiz.isSortQuiz ? "Correct sorting: " : "Options: "}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-2">
                {quiz.options.map((option) => (
                  <div
                    key={option._id}
                    className={cn(
                      "py-1 px-2 rounded mt-1 font-medium text-red-700 border border-red-600",
                      quiz.isSortQuiz &&
                        "text-green-700 border border-green-600",
                      !quiz.isSortQuiz &&
                        option.isCorrect &&
                        "text-green-700 border border-green-600"
                    )}
                  >
                    {option.value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface DeleteQuizButtonProps {
  topicId: string;
  quiz: Quiz;
}

const DeleteQuizButton = ({ topicId, quiz }: DeleteQuizButtonProps) => {
  const endsWithPunctuation = [".", "!", "?"].some((p) =>
    quiz.question.endsWith(p)
  );

  const question = endsWithPunctuation
    ? `"${quiz.question.slice(0, -1)}" quiz?`
    : `"${quiz.question}" quiz?`;

  const [DeleteQuizDialog, confirmDeleteQuiz] = useConfirm(
    `Delete Quiz`,
    `Are you sure you want to delete ${question} This action cannot be undone.`,
    "destructive"
  );

  const { mutate } = useDeleteQuiz(topicId);

  const handleDeleteQuiz = async (id: string) => {
    const ok = await confirmDeleteQuiz();
    if (!ok) return;

    mutate({ _id: id });
  };

  return (
    <>
      <DeleteQuizDialog />
      <Button
        size="sm"
        variant="ghost"
        className="text-red-600 hover:text-red-700 cursor-pointer"
        onClick={() => handleDeleteQuiz(quiz._id!)}
      >
        <Trash2 />
      </Button>
    </>
  );
};
