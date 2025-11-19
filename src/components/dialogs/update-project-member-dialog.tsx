import { ProgressBarAnimation } from "@/components/progress-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IPErrorMessage, tags } from "@/constant";
import { axiosInstance } from "@/lib/axios-instance";
import {
  UpdateProjectFormSchema,
  UpdateProjectFormSchemaType,
  UpdateProjectMemberFormSchema,
  UpdateProjectMemberFormSchemaType,
} from "@/lib/schema";
import { cn, getServerError } from "@/lib/utils";
import { organizationStore } from "@/zustand/member.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  differenceInCalendarDays,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  MessageCircleIcon,
  Users,
  XIcon,
} from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { fa } from "zod/v4/locales";
import { IPErrorDialog } from "./ip-error-dialog";

type ProjectType = {
  organizationId: string;
  id: string;
  title: string;
  description: string;
  tags: string[];
  percentage: number;
  status: "Pending" | "Working" | "Completed";
  members: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  }[];
  startDate: Date;
  deadLine: Date;
  createdAt: Date;
  updatedAt: Date;
};

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  project: Partial<ProjectType> | null;
  setProject: Dispatch<SetStateAction<null | Partial<ProjectType>>>;
}

export const UpdateProjectMemberDialog = ({
  isOpen,
  setIsOpen,
  project,
  setProject,
}: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { selectedOrganizationId } = organizationStore();

  const [serverError, setServerError] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const queryClient = useQueryClient();

  // Mutations
  const mutation = useMutation({
    mutationFn: async (
      data: UpdateProjectMemberFormSchemaType & {
        projectId: string;
        organizationId: string;
      }
    ) => {
      const res = await axiosInstance.put("/member/project", data);
      return res.data;
    },
    onSuccess: () => {
      setIsOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["get-member-projects"],
      });
      toast.success("Project updated successfully");
    },
    onError: (error: any) => {
      const message = error.response.data.message || "Something went wrong";
      if (message === IPErrorMessage) {
        setIsErrorOpen(true);
        return;
      }
      getServerError({ error, setServerError });
    },
  });
  const form = useForm<UpdateProjectMemberFormSchemaType>({
    resolver: zodResolver(UpdateProjectMemberFormSchema),
    defaultValues: {
      status: project?.status,
      percentage: project?.percentage,
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        status: project.status,
        percentage: project.percentage,
      });
    }
  }, [project]);

  const onSubmit = async (data: UpdateProjectMemberFormSchemaType) => {
    if (!project || !project.id) {
      toast.error("Project not found. Please reload page or sign in again.");
      return;
    }
    mutation.mutate({
      ...data,
      projectId: project.id || "",
      organizationId: selectedOrganizationId!,
    });
  };

  const getRemainingTime = () => {
    const days = differenceInCalendarDays(project?.deadLine!, new Date());
    const hours = differenceInHours(project?.deadLine!, new Date());
    const minutes = differenceInMinutes(project?.deadLine!, new Date());
    if (days > 0) {
      return `${days} ${days > 1 ? "Days Left" : "Days Left"}`;
    } else if (hours > 0 || minutes > 0) {
      return `${hours} ${hours > 1 ? "Hours" : "Hour"} and ${minutes} ${
        minutes > 1 ? "Minutes Left" : "Minute Left"
      }`;
    } else {
      return "Dead line crossed";
    }
  };

  if (!project || !selectedOrganizationId) return;
  return (
    <>
      <IPErrorDialog isOpen={isErrorOpen} setIsOpen={setIsErrorOpen} />
      <Dialog
        open={isOpen}
        onOpenChange={(value) => {
          setProject(null);
          setIsOpen(value);
        }}
      >
        <DialogContent className="overflow-y-scroll">
          <DialogHeader>
            <h1 className="text-neutral-800 font-bold font-sansitia text-2xl"></h1>
            <DialogTitle>Update Project</DialogTitle>
            <DialogDescription>
              Update a project by changing status or percentage.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col mt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="flex flex-col">
                  <div className="flex gap-2">
                    {project?.tags?.map((status, i) => (
                      <Badge key={i}>{status}</Badge>
                    ))}
                  </div>
                  <h3 className="text-neutral-800 font-semibold text-base">
                    {project.title}
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    {project.description}
                  </p>
                  <div className="flex flex-col mt-2">
                    <span className="text-neutral-600 text-sm flex items-center gap-1">
                      Deadline <CalendarIcon className="size-3" />
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-neutral-600 text-sm flex items-center gap-1">
                        {getRemainingTime()}
                      </span>
                      <div className="h-[1px] w-[30px] rounded-full bg-neutral-400" />
                      <span className="text-neutral-600 text-sm flex items-center gap-1">
                        {new Date(project.deadLine!).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-col">
                    <span className="text-neutral-600 text-sm flex items-center gap-1">
                      Members <Users className="size-3" />
                    </span>
                    <div className="flex items-center">
                      {project?.members?.map((member, memberIndex) => (
                        <Tooltip
                          key={memberIndex}
                          delayDuration={0}
                          disableHoverableContent
                        >
                          <TooltipTrigger
                            asChild
                            className={`-translate-x-[${memberIndex * 10}px]`}
                          >
                            <Avatar className="cursor-pointer">
                              <AvatarImage
                                src={member?.image || ""}
                                alt={`${member.name} image`}
                              />
                              <AvatarFallback className="bg-foreground text-white border-2 border-white">
                                {member.name.substring(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent className="bg-white border border-neutral-200 text-neutral-800">
                            <div className="flex items-center gap-1">
                              <Avatar className="w-9 h-9">
                                <AvatarImage
                                  src={member?.image || ""}
                                  alt={`${member.name} image`}
                                />
                                <AvatarFallback className="bg-foreground text-white border-2 border-white text-base">
                                  {member.name.substring(0, 1)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <h3 className="text-neutral-800 text-sm">
                                  {member.name}
                                </h3>
                                <p className="text-neutral-600 text-xs">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center justify-center gap-3">
                          <Input
                            type="range"
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                          <Input
                            type="number"
                            value={field.value}
                            min={0}
                            max={100}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            className="w-20 h-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <div
                          onClick={() => inputRef.current?.showPicker?.()}
                          className="relative"
                        >
                          <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {["Pending", "Working", "Completed"].map(
                                (status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  disabled={mutation.isPending}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {mutation.isPending ? "Updating..." : "Update"}
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
