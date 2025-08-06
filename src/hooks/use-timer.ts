import { useEffect, useRef, useState } from "react";

import { TIME_LIMIT_PER_QUIZ } from "@/config";

import type { Quiz } from "@/types";

export const useTimer = (currentQuiz: Quiz) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const duration = Number(TIME_LIMIT_PER_QUIZ - timeLeft);

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
        return 0;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuiz]);

  return { timeLeft, setTimeLeft, duration };
};
