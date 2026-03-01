import React from "react";

interface TypingCursorProps {
  isVisible?: boolean;
}

export function TypingCursor({ isVisible = true }: TypingCursorProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <span
      className="inline-block animate-[blink_1s_step-start_infinite] will-change-[opacity]"
      aria-hidden="true"
      style={{
        animationName: "blink",
        animationDuration: "1s",
        animationTimingFunction: "step-start",
        animationIterationCount: "infinite",
      }}
    >
      ▍
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}

export default TypingCursor;