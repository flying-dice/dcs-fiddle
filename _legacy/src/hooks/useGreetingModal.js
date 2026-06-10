import { useLocalStorage } from "react-use";
import { useState } from "react";

export const useGreetingModal = () => {
  const [dontShowAgainChecked, setDontShowAgainChecked] = useLocalStorage(
    "DONT_SHOW_AGAIN",
    false
  );
  const [isOpen, setIsOpen] = useState(dontShowAgainChecked ? false : true);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    dontShowAgainChecked,
    setDontShowAgainChecked,
  };
};
