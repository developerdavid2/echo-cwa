import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { cn } from "@workspace/ui/lib/utils";

export function AIMessageSkeleton({
  from = "assistant",
}: {
  from?: "user" | "assistant";
}) {
  return (
    <AIMessage from={from} className="animate-pulse">
      {/* Message bubble with shimmer effect */}
      <div
        className={cn(
          "break-words",
          "flex flex-col gap-2 rounded-lg border px-3 py-2 text-sm",
          "border-border/50 bg-gray-200/60",
          "max-w-[80%]"
        )}
      >
        {/* Multiple skeleton lines for more realistic loading */}
        <div className="space-y-2">
          <div className="h-3 w-48 rounded-md bg-muted/30" />
          <div className="h-3 w-32 rounded-md bg-muted/30" />
        </div>
      </div>

      {/* Avatar skeleton - greyed out circle */}
      <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200/60" />
    </AIMessage>
  );
}
