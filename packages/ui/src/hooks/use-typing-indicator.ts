// packages/ui/src/hooks/use-typing-indicator.ts
import { useEffect, useRef } from "react";

export const useTypingIndicator = (
  onTypingChange: (isTyping: boolean) => void,
  delay: number = 1000,
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTypingStart = () => {
    // ✅ No early return guard — just clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    onTypingChange(true);

    timeoutRef.current = setTimeout(() => {
      onTypingChange(false);
      timeoutRef.current = null;
    }, delay);
  };

  const handleTypingStop = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    onTypingChange(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { handleTypingStart, handleTypingStop };
};
