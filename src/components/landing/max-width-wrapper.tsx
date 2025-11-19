import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export const MaxWidthWrapper = ({ children, className }: Props) => {
  return (
    <div className={cn("max-w-6xl w-full mx-auto px-2", className)}>
      {children}
    </div>
  );
};
