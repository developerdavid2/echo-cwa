// packages/ui/src/hooks/use-scroll-to-bottom-observer.ts

import { useEffect, useRef, useState } from "react";

interface UseScrollToBottomObserverProps {
  enabled?: boolean;
  threshold?: number;
}

export const useScrollToBottomObserver = ({
  enabled = true,
  threshold = 200,
}: UseScrollToBottomObserverProps = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showButton, setShowButton] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "nearest" });
  };

  useEffect(() => {
    if (!enabled) {
      setShowButton(false);
      return;
    }

    if (enabled) {
      setShowButton(true);
    }

    const container = containerRef.current;
    if (!container || !bottomRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowButton(!entry?.isIntersecting);
        console.log(!entry);
      },
      {
        root: container,
        threshold: 0.9,
      }
    );

    observer.observe(bottomRef.current);

    return () => observer.disconnect();
  }, [enabled, threshold]); // Always same length and order

  return {
    containerRef,
    bottomRef,
    showButton,
    scrollToBottom,
  };
};
