import React from "react";

interface TypingCursorProps {
  isVisible?: boolean;
}

export function TypingCursor({ isVisible = true }: TypingCursorProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <span className="animate-blink inline-block" aria-hidden="true">
      ▍
    </span>
  );
}

export default TypingCursor;