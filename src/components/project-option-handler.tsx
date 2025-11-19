import { Button } from "@/components/ui/button";
import { EllipsisVerticalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Props {
  onReAssign: () => void;
  onDelete: () => void;
  isResign?: boolean;
  iconColor: "dark" | "light";
}

export const ProjectOptionsHandler = ({
  onDelete,
  onReAssign,
  isResign = true,
  iconColor,
}: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "absolute top-2 right-2 hover:bg-neutral-700 hover:text-neutral-300",
            iconColor === "light" ? "text-neutral-300" : "text-neutral-800"
          )}
        >
          <EllipsisVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {isResign && (
          <DropdownMenuItem onClick={onReAssign}>Re-Assign</DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onDelete} variant="destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
