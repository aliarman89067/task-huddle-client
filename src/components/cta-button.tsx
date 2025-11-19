import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface Props {
  title: string;
  onClick: () => void;
  classNames?: string;
}

export const CTAButton = ({ title, onClick, classNames }: Props) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group w-full py-4 rounded-lg text-white relative bg-primary flex items-center justify-center text-center ring-1 ring-primary ring-offset-0 hover:ring-offset-2 hover:ring-2 transition-all duration-300 ease-in-out cursor-pointer overflow-hidden active:opacity-90",
        classNames
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium text-lg">{title}</span>
        <ArrowRight className="size-5 transform group-hover:translate-x-0.5 transition-all duration-500 ease-in-out" />
      </div>
      <div className="h-[200px] w-[45px] absolute -top-20 -left-24 rotate-[40deg] bg-white/20 group-hover:left-[110%] transition-all duration-500 ease-in-out" />
    </div>
  );
};
