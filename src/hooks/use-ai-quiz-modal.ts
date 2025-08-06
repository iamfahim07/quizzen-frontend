import { parseAsBoolean, useQueryState } from "nuqs";

export const useAIQuizModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "ai-generated-quiz",
    parseAsBoolean.withDefault(false)
  );

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    open,
    close,
  };
};
