import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { HomeIcon, InboxIcon } from "lucide-react";

type WidgetScreen = "selection" | "inbox";

interface WidgetFooterProps {
  screen: WidgetScreen;
  onScreenChange: (screen: WidgetScreen) => void;
}

export const WidgetFooter = ({ screen, onScreenChange }: WidgetFooterProps) => {
  return (
    <footer className="flex items-center justify-between border-t bg-background">
      {/* Home */}
      <Button
        className="h-14 flex-1 rounded-none"
        onClick={() => onScreenChange("selection")}
        size="icon"
        variant="ghost"
      >
        <HomeIcon
          className={cn("size-5", screen === "selection" && "text-primary")}
        />
      </Button>

      {/* Inbox */}
      <Button
        className="h-14 flex-1 rounded-none"
        onClick={() => onScreenChange("inbox")}
        size="icon"
        variant="ghost"
      >
        <InboxIcon
          className={cn("size-5", screen === "inbox" && "text-primary")}
        />
      </Button>
    </footer>
  );
};
