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

export function scrollToPosition(
  positionY: number,
  behavior: ScrollBehavior = "smooth"
) {
  window.scrollTo({
    top: positionY,
    behavior,
  });
}

export function generateUniqueId(prefix = "") {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 11);
  const extraRandom = Math.random().toString(36).substring(2, 5);
  return `${prefix}${timestamp}-${randomStr}${extraRandom}`;
}

export function makeDragImage(text: string) {
  const el = document.createElement("div");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  el.style.top = "-9999px";
  el.style.padding = "10px 20px";
  // el.style.font = "14px system-ui, -apple-system, 'Segoe UI', Roboto";
  el.style.fontSize = "14px";
  el.style.fontWeight = "500";
  el.style.background = "white";
  el.style.border = "1px solid oklch(44.6% 0.03 256.802)";
  el.style.borderRadius = "6px";
  el.style.boxShadow = "0 6px 18px rgba(0,0,0,0.12)";
  el.style.zIndex = "99999";
  el.textContent = text;
  document.body.appendChild(el);
  return el;
}
