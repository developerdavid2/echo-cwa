"use client";

import { Button } from "@workspace/ui/components/button";
import { ArrowDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { forwardRef, useCallback } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { cn } from "@workspace/ui/lib/utils";

// AIConversation - wrapper with StickToBottom
export type AIConversationProps = ComponentProps<typeof StickToBottom>;

export const AIConversation = ({
  className,
  children,
  ...props
}: AIConversationProps) => (
  <StickToBottom
    className={cn("relative flex-1 overflow-hidden", className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  >
    {children}
    <AIConversationScrollButton />
  </StickToBottom>
);

// AIConversationContent - forwarded ref so parent can attach ref
export type AIConversationContentProps = ComponentProps<
  typeof StickToBottom.Content
>;

export const AIConversationContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto p-4", className)}
    {...props}
  />
));
AIConversationContent.displayName = "AIConversationContent";

// Scroll to bottom button - now in bottom-right, beautiful design
export const AIConversationScrollButton = () => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleClick = useCallback(() => {
    scrollToBottom("smooth");
  }, [scrollToBottom]);

  if (isAtBottom) return null;

  return (
    <Button
      onClick={handleClick}
      size="icon"
      variant="secondary"
      className="fixed bottom-20 right-4 z-50 
                 h-12 w-12 rounded-full shadow-2xl 
                 bg-background border border-border
                 flex items-center justify-center
                 hover:scale-110 transition-all duration-200"
    >
      <ArrowDownIcon className="h-6 w-6" />
      <span className="sr-only">Scroll to latest message</span>
    </Button>
  );
};
