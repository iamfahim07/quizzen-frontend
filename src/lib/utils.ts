import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// shuffle the elements of the array in a random order
export const shuffleArrayElement = (arr: unknown[]) => {
  const result = [...arr];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// seconds to minutes function
export function secondsToMinutes(seconds: number) {
  if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) {
    throw new Error("Please provide a valid non-negative number of seconds.");
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const paddedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${minutes}:${paddedSeconds}`;
}

export function generateUniqueId(prefix = "") {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 11);
  const extraRandom = Math.random().toString(36).substring(2, 5);
  return `${prefix}${timestamp}-${randomStr}${extraRandom}`;
}
