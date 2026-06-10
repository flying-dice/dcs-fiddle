import { useLocation } from "react-use";
import { useState } from "react";
import { BehaviorSubject } from "rxjs";
import { useEnvironment } from "../context/environment";

const link$ = new BehaviorSubject("");

/**
 * @param editor {monaco.editor.IStandaloneCodeEditor}
 */
export const useShareModal = (valueProvider) => {
  const { environment } = useEnvironment();

  const url = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    const _url = new URL(url.origin);
    _url.searchParams.set("command", btoa(valueProvider()));
    _url.searchParams.set("env", environment.id);
    environment.selectedState &&
      _url.searchParams.set("state", environment.selectedState);

    link$.next(_url.href);
    setIsOpen(true);
  };

  return {
    link$,
    isOpen,
    open: handleOpen,
    close: () => setIsOpen(false),
  };
};
