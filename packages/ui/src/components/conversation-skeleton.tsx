import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function ConversationSkeleton() {
  return (
    <Button variant="outline" className="h-20 w-full justify-between group">
      <div className="flex w-full flex-col gap-4 overflow-hidden text-start">
        <div className="flex w-full items-center justify-between gap-x-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex w-full items-center justify-between gap-x-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
    </Button>
  );
}
