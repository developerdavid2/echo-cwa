// packages/ui/src/components/typing-indicator.tsx
import { cn } from "../lib/utils";

export const TypingIndicator = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-1 py-1", className)}>
      <div className="flex space-x-1">
        <div
          className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "1.4s" }}
        />
        <div
          className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style={{ animationDelay: "200ms", animationDuration: "1.4s" }}
        />
        <div
          className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style={{ animationDelay: "400ms", animationDuration: "1.4s" }}
        />
      </div>
    </div>
  );
};
