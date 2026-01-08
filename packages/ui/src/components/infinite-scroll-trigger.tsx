import { forwardRef } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { LoaderIcon } from "lucide-react";

interface InfiniteScrollTriggerProps {
  isLoadingMore: boolean;
  canLoadMore: boolean;
  noMoreText?: string;
  className?: string;
}

/**
 * Sentry component for infinite scroll
 * This component should always be mounted when infinite scroll is active
 */
export const InfiniteScrollTrigger = forwardRef<
  HTMLDivElement,
  InfiniteScrollTriggerProps
>(
  (
    { isLoadingMore, canLoadMore, noMoreText = "No more items", className },
    ref
  ) => {
    // Always render to keep the observer active
    return (
      <div
        ref={ref}
        className={cn("flex w-full justify-center py-4", className)}
      >
        {isLoadingMore && (
          <LoaderIcon className="size-4 animate-spin text-muted-foreground" />
        )}
        {!isLoadingMore && !canLoadMore && noMoreText && (
          <p className="text-xs text-muted-foreground">{noMoreText}</p>
        )}
      </div>
    );
  }
);

InfiniteScrollTrigger.displayName = "InfiniteScrollTrigger";
