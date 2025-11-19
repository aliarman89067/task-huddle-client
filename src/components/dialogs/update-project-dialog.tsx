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
import { tags } from "@/constant";
import { axiosInstance } from "@/lib/axios-instance";
import {
  UpdateProjectFormSchema,
  UpdateProjectFormSchemaType,
} from "@/lib/schema";
import { cn, getServerError } from "@/lib/utils";
import { organizationStore } from "@/zustand/member.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, MessageCircleIcon, XIcon } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  project: any;
  setProject: Dispatch<SetStateAction<any>>;
  members: any;
}

export const UpdateProjectDialog = ({
  isOpen,
  setIsOpen,
  project,
  setProject,
  members,
}: Props) => {
  const { selectedOrganizationId } = organizationStore();

  const [serverError, setServerError] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const queryClient = useQueryClient();

  // Mutations
  const mutation = useMutation({
    mutationFn: async (
      data: UpdateProjectFormSchemaType & {
        projectId: string;
        organizationId: string;
      }
    ) => {
      const res = await axiosInstance.put("/admin/projects", data);
      return res.data;
    },
    onSuccess: () => {
      setIsOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["get-projects"],
      });
      toast.success("Project updated successfully");
    },
    onError: (error: any) => {
      getServerError({ error, setServerError });
    },
  });
  const form = useForm<UpdateProjectFormSchemaType>({
    resolver: zodResolver(UpdateProjectFormSchema),
    defaultValues: {
      members: [],
      deadline: "",
      tags: [],
      description: "",
      title: "",
      status: "",
      percentage: 0,
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        members: project.members?.map((item: any) => item.id),
        deadline: new Date(project?.deadLine).toISOString()?.split("T")?.[0],
        tags: project.tags,
        description: project.description,
        title: project.title,
        status: project.status,
        percentage: project.percentage,
      });
    }
  }, [project]);

  const onSubmit = async (data: UpdateProjectFormSchemaType) => {
    mutation.mutate({
      ...data,
      projectId: project.id,
      organizationId: selectedOrganizationId!,
    });
  };

  if (!project || !selectedOrganizationId) return;
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        setProject(undefined);
        setIsOpen(value);
      }}
    >
      <DialogContent className="h-[95vh] overflow-y-scroll">
        <DialogHeader>
          <h1 className="text-neutral-800 font-bold font-sansitia text-2xl"></h1>
          <DialogTitle>Update Project</DialogTitle>
          <DialogDescription>
            Update a project by changing or adding more members, edit a project
            title and description, and change a deadline.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="members"
                render={({ field }) => {
                  const [isOpen, setIsOpen] = useState(false);
                  return (
                    <FormItem>
                      <FormLabel>Select Members (optional)</FormLabel>
                      <FormControl>
                        <Popover open={isOpen} onOpenChange={setIsOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              className="justify-between text-neutral-500 hover:text-neutral-600"
                            >
                              Select members...
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="w-[300px] p-0"
                          >
                            <Command>
                              <CommandInput
                                placeholder="Search members..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No member found.</CommandEmpty>
                                <CommandGroup>
                                  {members?.map(
                                    (member: any, index: number) => (
                                      <CommandItem
                                        key={index}
                                        value={member.member.id}
                                        onSelect={(currentValue) => {
                                          const isInclude = field.value.find(
                                            (item) => item === currentValue
                                          );
                                          if (isInclude) {
                                            const updatedMembers =
                                              field.value.filter(
                                                (item) => item !== currentValue
                                              );
                                            form.setValue(
                                              "members",
                                              updatedMembers,
                                              {
                                                shouldValidate: true,
                                              }
                                            );
                                          } else {
                                            const updatedMembers = [
                                              ...field.value,
                                              currentValue,
                                            ];
                                            form.setValue(
                                              "members",
                                              updatedMembers,
                                              {
                                                shouldValidate: true,
                                              }
                                            );
                                          }
                                          setIsOpen(false);
                                        }}
                                      >
                                        {member.member.name}
                                        <Check
                                          className={cn(
                                            "ml-auto",
                                            field.value.includes(
                                              member.member.id
                                            )
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    )
                                  )}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <div className="flex gap-4 flex-wrap">
                        {field.value.map((memberId, index) => {
                          const member = members.find(
                            (item: any) => item?.member?.id === memberId
                          );
                          if (!member) return;
                          return (
                            <div
                              key={index}
                              className="relative bg-neutral-200 rounded-md px-4 py-2 flex items-center gap-2"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedMembers = field.value.filter(
                                    (item) => item !== memberId
                                  );
                                  form.setValue("members", updatedMembers, {
                                    shouldValidate: true,
                                  });
                                }}
                                className="w-4 h-4 bg-rose-500 flex items-center justify-center rounded-full absolute -top-1 -left-1 cursor-pointer"
                              >
                                <XIcon className="text-white size-3" />
                              </button>
                              <span className="text-neutral-600 text-sm">
                                {member.member.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => {
                  const [isOpen, setIsOpen] = useState(false);
                  return (
                    <FormItem>
                      <FormLabel>Select Tags (optional)</FormLabel>
                      <FormControl>
                        <Popover open={isOpen} onOpenChange={setIsOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="justify-between text-neutral-500 hover:text-neutral-600"
                            >
                              Select tags...
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="w-[300px] p-0"
                          >
                            <Command>
                              <CommandInput
                                placeholder="Search tags..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No tag found.</CommandEmpty>
                                <CommandGroup>
                                  {tags.map((tag, index) => (
                                    <CommandItem
                                      key={index}
                                      value={tag}
                                      onSelect={(currentValue) => {
                                        const isInclude = field.value.find(
                                          (item) => item === currentValue
                                        );
                                        if (isInclude) {
                                          const updatedTags =
                                            field.value.filter(
                                              (item) => item !== currentValue
                                            );

                                          form.setValue("tags", updatedTags, {
                                            shouldValidate: true,
                                          });
                                        } else {
                                          if (field.value.length >= 3) {
                                            form.setError("tags", {
                                              message:
                                                "You can't add more than 3 tags!",
                                            });
                                            return;
                                          }
                                          const updatedTags = [
                                            ...field.value,
                                            currentValue,
                                          ];

                                          form.setValue("tags", updatedTags, {
                                            shouldValidate: true,
                                          });
                                        }
                                        setIsOpen(false);
                                      }}
                                    >
                                      {tag}
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          field.value.includes(tag)
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <div className="flex gap-4 flex-wrap">
                        {field.value.map((tag, index) => {
                          const member = tags.find((item) => item === tag);
                          if (!member) return;
                          return (
                            <div
                              key={index}
                              className="relative bg-neutral-200 rounded-md px-4 py-2 flex items-center gap-2"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedTags = field.value.filter(
                                    (item) => item !== tag
                                  );
                                  form.setValue("tags", updatedTags, {
                                    shouldValidate: true,
                                  });
                                }}
                                className="w-4 h-4 bg-rose-500 flex items-center justify-center rounded-full absolute -top-1 -left-1 cursor-pointer"
                              >
                                <XIcon className="text-white size-3" />
                              </button>
                              <span className="text-neutral-600 text-sm">
                                {tag}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DeadLine</FormLabel>
                    <FormControl>
                      <div
                        onClick={() => inputRef.current?.showPicker?.()}
                        className="relative"
                      >
                        <Input
                          ref={inputRef}
                          type="date"
                          value={field.value}
                          className="cursor-pointer"
                          onChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
  );
};
