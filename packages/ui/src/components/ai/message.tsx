import type { ComponentProps, HTMLAttributes } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";
import { format, isToday, isYesterday, isThisYear } from "date-fns";

export type AIMessageProps = HTMLAttributes<HTMLDivElement> & {
  from: "user" | "assistant";
  timestamp?: number; // Unix timestamp from Convex (_creationTime)
};

export const AIMessage = ({
  className,
  from,
  timestamp,
  ...props
}: AIMessageProps) => (
  <div
    className={cn(
      "group flex w-full items-end justify-end gap-2 py-2",
      from === "user" ? "is-user" : "is-assistant flex-row-reverse justify-end",
      "[&>div]:max-w-[80%]",
      className
    )}
    {...props}
  />
);

export type AIMessageContentProps = HTMLAttributes<HTMLDivElement> & {
  timestamp?: number;
  from?: "user" | "assistant";
};

export const AIMessageContent = ({
  children,
  className,
  timestamp,
  from,
  ...props
}: AIMessageContentProps) => {
  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);

    if (isToday(date)) {
      // Today: just show time "9:45 PM"
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      // Yesterday: "Yesterday, 9:45 PM"
      return `Yesterday, ${format(date, "h:mm a")}`;
    } else if (isThisYear(date)) {
      // This year: "Jan 5, 9:45 PM"
      return format(date, "MMM d, h:mm a");
    } else {
      // Other years: "Jan 5, 2023, 9:45 PM"
      return format(date, "MMM d, yyyy, h:mm a");
    }
  };

  return (
    <div
      className={cn(
        "break-words",
        "flex gap-2 flex-wrap rounded-lg border border-border px-3 py-2 text-sm",
        "bg-background text-foreground",
        "group-[.is-user]:border-transparent group-[.is-user]:bg-gradient-to-b group-[.is-user]:from-primary group-[.is-user]:to-[#2884D1] group-[.is-user]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <div className="is-user:dark">{children}</div>
      {timestamp && (
        <div
          className={cn(
            "mt-1 text-xs opacity-60",
            from === "user"
              ? "self-end text-primary-foreground"
              : "self-start text-muted-foreground"
          )}
        >
          {formatTimestamp(timestamp)}
        </div>
      )}
    </div>
  );
};

export type AIMessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const AIMessageAvatar = ({
  src,
  name,
  className,
  ...props
}: AIMessageAvatarProps) => (
  <Avatar className={cn("size-8", className)} {...props}>
    <AvatarImage alt="" className="mt-0 mb-0" src={src} />
    <AvatarFallback>{name?.slice(0, 2) || "ME"}</AvatarFallback>
  </Avatar>
);
