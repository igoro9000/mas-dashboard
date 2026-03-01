import React from "react";

const styles = `
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.typing-cursor {
  display: inline-block;
  animation: blink 1s step-start infinite;
  line-height: 1;
  vertical-align: text-bottom;
  margin-left: 1px;
}
`;

interface TypingCursorProps {
  isVisible?: boolean;
}

export function TypingCursor({ isVisible = true }: TypingCursorProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <>
      <style>{styles}</style>
      <span className="typing-cursor" aria-hidden="true">
        ▍
      </span>
    </>
  );
}

export default TypingCursor;