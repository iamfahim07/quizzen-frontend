import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useGetQuizzes } from "@/api/use-get-quizzes";

import {
  EmptyStateComponent,
  ErrorComponent,
} from "@/components/fallback-component";
import { QuizSkeletonLoader } from "@/components/skeleton-loaders";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

import { useAiQuizStore } from "@/hooks/use-ai-quiz-store";
import { useAnalysisStore } from "@/hooks/use-analysis-store";
import { useTimer } from "@/hooks/use-timer";

import { cn, makeDragImage, shuffleArrayElement } from "@/lib/utils";

import { SCORE_PER_QUIZ } from "@/config";

import type { Option, Quiz } from "@/types";

interface TouchMoveState {
  x: number;
  y: number;
}

interface TouchStartState extends TouchMoveState {
  index: number;
}

export default function QuizPage() {
  const { topic_name, topic_id } = useParams({ strict: false });
  const { source } = useSearch({ from: "/quiz/$topic_name/$topic_id" });
  const navigate = useNavigate();

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [shuffleOptions, setShuffleOptions] = useState<Option[]>([]);
  const [isDragging, setIsDragging] = useState<{
    status: boolean;
    draggingElementId: null | string;
  }>({
    status: false,
    draggingElementId: null,
  });
  const [submittedQuizData, setSubmittedQuizData] = useState<
    (Quiz & {
      isCorrect: boolean;
      selectedOptions: Option[];
    })[]
  >([]);
  const [userStats, setUserStats] = useState({ timeTaken: 0, score: 0 });
  // state variables for touch events
  const [touchStart, setTouchStart] = useState<TouchStartState | null>(null);
  const [touchMove, setTouchMove] = useState<TouchMoveState | null>(null);

  const dragAnswer = useRef(0);
  const dragOverAnswer = useRef(0);

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

  const { timeLeft, duration } = useTimer(currentQuiz);

  const handleSort = () => {
    const cloneOptions = [...shuffleOptions];

    [cloneOptions[dragAnswer.current], cloneOptions[dragOverAnswer.current]] = [
      cloneOptions[dragOverAnswer.current],
      cloneOptions[dragAnswer.current],
    ];

    setShuffleOptions(cloneOptions);
    setSelectedOptions(cloneOptions);
  };

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
    if (timeLeft === 0) return;

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

  const handleNextQuiz = () => {
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
    }
  };

  // Touch event handlers
  const handleTouchStart = (
    e: React.TouchEvent,
    index: number,
    optionId: string
  ) => {
    if (timeLeft > 0 && currentQuiz?.isSortQuiz) {
      dragAnswer.current = index;
      setIsDragging({
        status: true,
        draggingElementId: optionId ?? "",
      });

      const touch = e.touches[0];
      setTouchStart({
        x: touch.clientX,
        y: touch.clientY,
        index: index,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.touches[0];
    setTouchMove({
      x: touch.clientX,
      y: touch.clientY,
    });

    const elementBelow = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    );
    const dropTarget = elementBelow?.closest("[data-drop-target]");

    if (dropTarget) {
      const targetIndex = parseInt(
        dropTarget.getAttribute("data-index") ?? "0"
      );
      dragOverAnswer.current = targetIndex;
    }
  };

  const handleTouchEnd = () => {
    if (touchStart && touchMove) {
      handleSort();
    }

    setTouchStart(null);
    setTouchMove(null);
    setIsDragging({
      status: false,
      draggingElementId: null,
    });
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

          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <Clock size={18} className="mr-2" /> {timeLeft}{" "}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/20 backdrop-blur-lg rounded-lg shadow-md border border-white/50 p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            {currentQuiz?.question}
          </h2>

          <div className="flex flex-col gap-6">
            {shuffleOptions?.map((option, index) => (
              <Toggle
                key={option?._id}
                className={cn(
                  "w-full h-auto whitespace-normal break-words bg-white hover:bg-white hover:text-black border border-white/50 shadow py-[14px] px-6 justify-start cursor-pointer data-[state=on]:text-white data-[state=on]:bg-green-500",
                  timeLeft > 0 && "hover:shadow-blue-500",
                  timeLeft === 0 && "cursor-not-allowed opacity-40"
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
                // Add data attributes for touch handling
                data-drop-target={currentQuiz?.isSortQuiz ? "true" : undefined}
                data-index={index}
                draggable={
                  timeLeft > 0 && currentQuiz?.isSortQuiz ? true : false
                }
                onDragStart={(e) => {
                  dragAnswer.current = index;
                  setIsDragging({
                    status: true,
                    draggingElementId: option?._id ?? "",
                  });

                  const dragImg = makeDragImage(option?.value ?? "");

                  const elWidth = e.currentTarget.offsetWidth;

                  const dragImgXoffset =
                    dragImg.offsetWidth >= elWidth
                      ? dragImg.offsetWidth * 0.5
                      : dragImg.offsetWidth * 1;

                  e.dataTransfer.setDragImage(
                    dragImg,
                    dragImgXoffset,
                    dragImg.offsetHeight * 0.5
                  );

                  requestAnimationFrame(() => {
                    setTimeout(() => {
                      if (dragImg && dragImg.parentNode)
                        dragImg.parentNode.removeChild(dragImg);
                    }, 0);
                  });
                }}
                onDrag={() => (dragAnswer.current = index)}
                // onDragEnter={() => {
                //   dragOverAnswer.current = index;
                //   handleSort();
                // }}
                onDrop={() => {
                  dragOverAnswer.current = index;
                  handleSort();
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={() => {
                  setIsDragging({
                    status: false,
                    draggingElementId: null,
                  });
                }}
                // Touch events (for mobile)
                onTouchStart={(e) => handleTouchStart(e, index, option._id!)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <p
                  className={cn(
                    "w-full text-start",
                    isDragging.status &&
                      isDragging.draggingElementId === option?._id
                      ? "invisible"
                      : "visible"
                  )}
                >
                  {option?.value}
                </p>
              </Toggle>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            className="w-full py-5 px-8 cursor-pointer"
            onClick={handleNextQuiz}
          >
            {currentQuizIndex < quizzes.length - 1 ? "Next Question" : "Finish"}

            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>
    </main>
  );
}
