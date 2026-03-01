import { useEffect, useState } from "react";

const useVirtualKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);
    const isMobile = mobile;
    if (!isMobile) return;

    const updateKeyboardHeight = () => {
      if (!window.visualViewport) return;

      const viewportHeight = window.visualViewport.height;
      const windowHeight = window.innerHeight;
      const height = Math.max(0, windowHeight - viewportHeight);

      setKeyboardHeight(height);
      setIsKeyboardOpen(height > 0);
      document.documentElement.style.setProperty(
        "--keyboard-height",
        `${height}px`
      );
    };

    let focusInTimer: ReturnType<typeof setTimeout> | undefined;
    const handleFocusIn = (event: FocusEvent) => {
      if (!window.visualViewport) return;

      const target = event.target as HTMLElement;
      const isInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable;

      if (!isInput) return;

      clearTimeout(focusInTimer);
      focusInTimer = setTimeout(updateKeyboardHeight, 150);
    };

    let focusOutTimer: ReturnType<typeof setTimeout> | undefined;
    const handleFocusOut = (event: FocusEvent) => {
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      const isInputFocused =
        relatedTarget instanceof HTMLInputElement ||
        relatedTarget instanceof HTMLTextAreaElement ||
        relatedTarget?.isContentEditable;

      if (isInputFocused) return;

      clearTimeout(focusOutTimer);
      focusOutTimer = setTimeout(() => {
        setKeyboardHeight(0);
        setIsKeyboardOpen(false);
        document.documentElement.style.setProperty("--keyboard-height", "0px");
      }, 150);
    };

    document.documentElement.style.setProperty("--keyboard-height", "0px");

    window.visualViewport?.addEventListener("resize", updateKeyboardHeight);
    window.visualViewport?.addEventListener("scroll", updateKeyboardHeight);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      clearTimeout(focusInTimer);
      clearTimeout(focusOutTimer);
      window.visualViewport?.removeEventListener("resize", updateKeyboardHeight);
      window.visualViewport?.removeEventListener("scroll", updateKeyboardHeight);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      document.documentElement.style.removeProperty("--keyboard-height");
    };
  }, []);

  return { keyboardHeight, isKeyboardOpen, isMobile };
};

export { useVirtualKeyboard };
export default useVirtualKeyboard;