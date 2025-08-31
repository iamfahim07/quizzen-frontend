import { useEffect, useRef, useState } from "react";

import { TIME_LIMIT_PER_QUIZ } from "@/config";

import type { Quiz } from "@/types";

export const useTimer = (currentQuiz: Quiz) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getDuration = () => Number(TIME_LIMIT_PER_QUIZ - timeLeft);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return getDuration();
  };

  useEffect(() => {
    if (!currentQuiz?.options?.length) return;

    setTimeLeft(TIME_LIMIT_PER_QUIZ);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime > 1) {
          return prevTime - 1;
        }
        clearInterval(timerRef.current!);
        timerRef.current = null;
        return 0;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuiz]);

  return { timeLeft, setTimeLeft, getDuration, stopTimer };
};
