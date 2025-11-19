import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/axios-instance";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EllipsisVerticalIcon,
  ListTodoIcon,
  PenIcon,
  PlusIcon,
} from "lucide-react";

type ResponseType = {
  id: string;
  text: string;
  isCompleted: boolean;
};
interface Props {
  organizationId: string;
}

export const MemberTaskList = ({ organizationId }: Props) => {
  const [tasks, setTasks] = useState<ResponseType[] | null>(null);
  const inputBoxRef = useRef<HTMLDivElement | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [text, setText] = useState("");

  // Queries
  const { data, isPending } = useQuery({
    queryKey: ["get-member-tasks"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/member/task/${organizationId}`);
      return res.data as ResponseType[];
    },
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (data) {
      setTasks(data);
    }
  }, [data]);
  // Mutations
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!text) {
        return toast.error("Please enter a task.");
      }
      const data = {
        organizationId,
        text,
      };
      const res = await axiosInstance.post("/member/task", data);
      return res.data as ResponseType;
    },
    onSuccess: (data) => {
      setTasks([data as ResponseType, ...(tasks || [])]);
      setIsCreating(false);
      setText("");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message || "Something went wrong!";
      toast.error(message);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const updatedData = tasks?.filter((task) => task.id !== taskId);
      setTasks(updatedData || []);
      const res = await axiosInstance.delete(`/member/task/${taskId}`);
      return taskId;
    },
    onSuccess: () => {},
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message || "Something went wrong!";
      toast.error(message);
    },
  });
  const completeMutation = useMutation({
    mutationFn: async (taskId: string) => {
      setTasks((prev) => {
        if (!prev) return prev;
        return prev.map((item) => {
          if (item.id === taskId) {
            return { ...item, isCompleted: !item.isCompleted };
          } else {
            return item;
          }
        });
      });
      const data = {
        taskId,
      };
      const res = await axiosInstance.put("/member/task/complete", data);
      return { data: res.data as ResponseType, taskId };
    },
    onSuccess: () => {},
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message || "Something went wrong!";
      toast.error(message);
    },
  });

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        inputBoxRef.current &&
        !inputBoxRef.current.contains(e.target as Node)
      ) {
        setIsCreating(false);
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && text.trim().length > 0) {
      createMutation.mutate();
    }
  };
  const handleCreate = () => {
    if (text.trim()) {
      createMutation.mutate();
    }
  };

  if (isPending) {
    return <div className="text-neutral-300">Loading your task...</div>;
  }
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <h2 className="text-white font-semibold text-base">Task</h2>
          <ListTodoIcon className="size-4 text-white" />
        </div>
        <Button size="sm" onClick={() => setIsCreating(!isCreating)}>
          Create <PlusIcon className="size-4" />
        </Button>
      </div>
      {isCreating && (
        <div
          ref={inputBoxRef}
          className="flex items-center justify-center gap-1 w-full mt-4"
        >
          <input
            type="text"
            autoFocus
            placeholder="Your new goal..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-10 rounded-lg border border-neutral-400 text-white text-sm outline-0 px-3"
            onKeyDown={handleKeyDown}
          />
          <button
            disabled={createMutation.isPending}
            onClick={handleCreate}
            className="px-4 h-10 bg-primary text-xs rounded-lg flex items-center gap-1 text-white hover:bg-primary/90 transition-all duration-300 cursor-pointer disabled:opacity-80"
          >
            <PenIcon className="size-3" />
          </button>
        </div>
      )}
      {tasks && tasks.length < 1 ? (
        <div className="h-full w-full flex flex-col items-center justify-center gap-2">
          <Image
            src="/images/note-book.png"
            alt="Notbook Image"
            width={100}
            height={100}
            className="object-contain"
          />
          <h3 className="text-neutral-200 text-lg font-semibold">
            No task found
          </h3>
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col gap-2.5 overflow-y-scroll sidebar-scrollbar-sm max-h-[600px] pr-2",
            isCreating ? "mt-0" : "mt-4"
          )}
        >
          {tasks?.map((task) => (
            <label
              key={task.id}
              htmlFor={task.id}
              className={cn(
                "relative flex items-center gap-3 bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg",
                task.isCompleted && "opacity-70"
              )}
            >
              <Dialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2">
                      <EllipsisVerticalIcon className="size-3 text-neutral-300" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right">
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(task.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Dialog>
              <Checkbox
                id={task.id}
                name={task.id}
                checked={task.isCompleted}
                onCheckedChange={() => completeMutation.mutate(task.id)}
              />
              <div className="flex flex-col items-start pr-2">
                <h3
                  className={cn(
                    "text-white font-semibold text-sm",
                    task.isCompleted && "line-through"
                  )}
                >
                  {task.text}
                </h3>
              </div>
            </label>
          ))}
        </div>
      )}
    </>
  );
};
