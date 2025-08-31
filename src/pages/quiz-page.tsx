import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useGetQuizzes } from "@/api/use-get-quizzes";

import {
  EmptyStateComponent,
  ErrorComponent,
} from "@/components/fallback-component";
import { SpinnerLoader } from "@/components/loader";
import { QuizSkeletonLoader } from "@/components/skeleton-loaders";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

import { useAiQuizStore } from "@/hooks/use-ai-quiz-store";
import { useAnalysisStore } from "@/hooks/use-analysis-store";
import { useTimer } from "@/hooks/use-timer";

import { cn, scrollToPosition, shuffleArrayElement } from "@/lib/utils";

import { SCORE_PER_QUIZ } from "@/config";

import type { Option, Quiz } from "@/types";

export default function QuizPage() {
  const { topic_name, topic_id } = useParams({ strict: false });
  const { source } = useSearch({ from: "/quiz/$topic_name/$topic_id" });
  const navigate = useNavigate();

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [shuffleOptions, setShuffleOptions] = useState<Option[]>([]);
  const [submittedQuizData, setSubmittedQuizData] = useState<
    (Quiz & {
      isCorrect: boolean;
      selectedOptions: Option[];
    })[]
  >([]);
  const [userStats, setUserStats] = useState({ timeTaken: 0, score: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setUserAnalysisResultById } = useAnalysisStore();
  const { aiQuizDataById } = useAiQuizStore();

  const {
    isLoading,
    error,
    data: fetchedQuizzes,
    refetch,
  } = useGetQuizzes(topic_id!, source);

  // Use AI data if available, otherwise use fetched data
  const quizzes = useMemo(() => {
    const aiQuizData = aiQuizDataById(topic_id!);

    const isAIQuizData =
      source === "ai" && (aiQuizData?.quizzes?.length ?? 0) > 0;

    const sourceQuizzes = isAIQuizData
      ? aiQuizData?.quizzes
      : fetchedQuizzes?.data;
    return sourceQuizzes?.length ? shuffleArrayElement(sourceQuizzes) : [];
  }, [aiQuizDataById, topic_id, source, fetchedQuizzes]);

  const currentQuiz = useMemo(
    () => quizzes[currentQuizIndex] as Quiz,
    [quizzes, currentQuizIndex]
  );

  const { timeLeft, stopTimer } = useTimer(currentQuiz);

  const isDisabled = timeLeft === 0 || isSubmitting;

  const checkAnswers = (): { isCorrect: boolean } => {
    if (currentQuiz && !currentQuiz?.isSortQuiz) {
      const quizCorrectAnswerList =
        currentQuiz?.options.filter((option) => option.isCorrect) ?? [];

      if (quizCorrectAnswerList.length !== selectedOptions.length) {
        return { isCorrect: false };
      }

      const isUserCorrect = quizCorrectAnswerList.every((correctAnswer) =>
        selectedOptions.some(
          (selectedOption) => selectedOption._id === correctAnswer._id
        )
      );

      return { isCorrect: isUserCorrect };
    } else if (
      currentQuiz &&
      currentQuiz?.isSortQuiz &&
      selectedOptions.length > 0
    ) {
      const areOptionsInCorrectOrder = selectedOptions.every(
        (item, index) => item.position === index + 1
      );

      return {
        isCorrect: areOptionsInCorrectOrder,
      };
    }

    return { isCorrect: false };
  };

  const toggleClick = (option: Option) => {
    if (isDisabled) return;

    if (
      selectedOptions.some(
        (selectedOption) => selectedOption._id === option._id
      )
    ) {
      const newSelectedOptions = selectedOptions.filter(
        (selectedOption) => selectedOption._id !== option._id
      );
      return setSelectedOptions(newSelectedOptions);
    }

    setSelectedOptions((prev) => [...prev, option]);
  };

  const handleNextQuiz = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const duration = stopTimer();

      const { isCorrect } = checkAnswers();

      setUserStats((prev) => ({
        timeTaken: prev.timeTaken + duration,
        score: prev.score + (isCorrect ? Number(SCORE_PER_QUIZ) : 0),
      }));

      setSubmittedQuizData((prev) => [
        ...prev,
        {
          isCorrect,
          selectedOptions,
          ...currentQuiz,
        },
      ]);

      if (currentQuizIndex === quizzes.length - 1) {
        const nextSubmittedQuizData = [
          ...submittedQuizData,
          {
            isCorrect,
            selectedOptions,
            ...currentQuiz,
          },
        ];

        const nextUserStats = {
          timeTaken: userStats.timeTaken + duration,
          score: userStats.score + (isCorrect ? Number(SCORE_PER_QUIZ) : 0),
        };

        setUserAnalysisResultById(topic_id!, {
          submittedQuizData: nextSubmittedQuizData,
          userStats: nextUserStats,
        });

        navigate({
          to: "/analysis/$topic_name/$topic_id",
          params: {
            topic_name: topic_name!,
            topic_id: topic_id!,
          },
          search: { source },
        });
      } else {
        setCurrentQuizIndex(currentQuizIndex + 1);
        setSelectedOptions([]);
        scrollToPosition(80);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (isDisabled) return;

    const { source, destination } = result;

    if (!destination || destination.index === source.index) {
      return;
    }

    const reorderedOptions = Array.from(shuffleOptions);
    const [movedOption] = reorderedOptions.splice(source.index, 1);
    reorderedOptions.splice(destination.index, 0, movedOption);

    setShuffleOptions(reorderedOptions);
    setSelectedOptions(reorderedOptions);
  };

  useEffect(() => {
    if (!currentQuiz?.options?.length) return;

    const quizOptions = shuffleArrayElement(
      currentQuiz?.options || []
    ) as Option[];
    setShuffleOptions(quizOptions);

    if (currentQuiz?.isSortQuiz) {
      setSelectedOptions(quizOptions);
    }
  }, [currentQuiz]);

  if (isLoading) return <QuizSkeletonLoader />;

  if (error) return <ErrorComponent onRetry={refetch} isLoading={isLoading} />;

  if (!quizzes || quizzes.length === 0) {
    return <EmptyStateComponent />;
  }

  return (
    <main className="fade-in animate-in duration-500">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-4">
        <div className="w-full flex justify-between items-center bg-white/20 backdrop-blur-lg rounded-lg shadow-md border border-white/50 p-6 mb-6">
          <div>
            <h2 className="font-bold text-xl">{topic_name}</h2>
            <p className="text-sm text-muted-foreground">
              Question {currentQuizIndex + 1} of {quizzes.length}
            </p>
          </div>

          <div className="inline-flex items-center px-4 py-2 rounded-full font-semibold bg-green-100 text-green-800">
            <Clock className="size-5 mr-2" /> {timeLeft}{" "}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-8 pb-8">
        <div className="bg-white/20 rounded-lg shadow-md border border-white/50 pt-6 px-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            {currentQuiz?.question}
          </h2>

          {currentQuiz?.isSortQuiz ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId={currentQuiz._id!}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {shuffleOptions?.map((option, index) => (
                      <Draggable
                        key={option._id}
                        draggableId={option._id!}
                        index={index}
                        isDragDisabled={isDisabled}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "w-full h-auto mb-6 whitespace-normal break-words bg-white hover:bg-white hover:text-black border border-white/50 shadow py-[14px] px-6 justify-start cursor-grab",
                              "rounded-md text-sm font-medium",
                              snapshot.isDragging &&
                                "shadow-lg shadow-blue-500 ring-2 ring-blue-400",
                              timeLeft > 0 && "hover:shadow-blue-500",
                              isDisabled && "cursor-not-allowed opacity-40"
                            )}
                          >
                            <p className={cn("w-full text-start")}>
                              {option?.value}
                            </p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div>
              {shuffleOptions?.map((option) => (
                <Toggle
                  key={option?._id}
                  className={cn(
                    "w-full h-auto mb-6 whitespace-normal break-words bg-white hover:bg-white hover:text-black border border-white/50 shadow py-[14px] px-6 justify-start cursor-pointer data-[state=on]:text-white data-[state=on]:bg-green-500",
                    timeLeft > 0 && "hover:shadow-blue-500",
                    isDisabled && "cursor-not-allowed opacity-40"
                  )}
                  pressed={
                    !currentQuiz?.isSortQuiz &&
                    selectedOptions?.some(
                      (selectedOption) => selectedOption._id === option._id
                    )
                  }
                  onClick={
                    currentQuiz?.isSortQuiz
                      ? undefined
                      : () => toggleClick(option)
                  }
                  disabled={isDisabled}
                >
                  <p className={cn("w-full text-start")}>{option?.value}</p>
                </Toggle>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            className="w-full py-5 px-8 cursor-pointer"
            onClick={handleNextQuiz}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <SpinnerLoader className="text-white" />
                Processing...
              </>
            ) : (
              <>
                {currentQuizIndex < quizzes.length - 1
                  ? "Next Question"
                  : "Finish"}

                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </section>
    </main>
  );
}
