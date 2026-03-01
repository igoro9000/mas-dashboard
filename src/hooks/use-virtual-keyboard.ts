import { useEffect, useState } from "react";

const useVirtualKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
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
    const handleFocusIn = () => {
      if (!window.visualViewport) return;
      focusInTimer = setTimeout(updateKeyboardHeight, 100);
    };

    let focusOutTimer: ReturnType<typeof setTimeout> | undefined;
    const handleFocusOut = () => {
      focusOutTimer = setTimeout(() => {
        setKeyboardHeight(0);
        setIsKeyboardOpen(false);
        document.documentElement.style.setProperty("--keyboard-height", "0px");
      }, 100);
    };

    document.documentElement.style.setProperty("--keyboard-height", "0px");

    window.visualViewport?.addEventListener("resize", updateKeyboardHeight);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      clearTimeout(focusInTimer);
      clearTimeout(focusOutTimer);
      window.visualViewport?.removeEventListener("resize", updateKeyboardHeight);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      document.documentElement.style.removeProperty("--keyboard-height");
    };
  }, []);

  return { keyboardHeight, isKeyboardOpen };
};

export { useVirtualKeyboard };
export default useVirtualKeyboard;