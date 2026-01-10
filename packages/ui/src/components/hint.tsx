"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

interface HintProps {
  children: React.ReactNode;
  text: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export const Hint = ({
  children,
  text,
  side = "left", // Default to right for sidebar icons
  align = "center",
}: HintProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align}>
        <p className="text-sm">{text}</p>
      </TooltipContent>
    </Tooltip>
  );
};
