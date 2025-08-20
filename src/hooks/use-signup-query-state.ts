import { parseAsBoolean, useQueryState } from "nuqs";

export const useSignupQueryState = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "sign-up",
    parseAsBoolean.withDefault(false)
  );

  const open = () => {
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  return {
    isOpen,
    open,
    close,
  };
};
