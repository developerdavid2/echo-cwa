import { cn } from "@workspace/ui/lib/utils";

export const WidgetHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <header
      className={cn(
        "bg-gradient-to-r from-[#1e5799] via-50% via-[#2989d8] to-[#7db9e8] p-4 text-primary-foreground",
        className
      )}
    >
      {children}
    </header>
  );
};
