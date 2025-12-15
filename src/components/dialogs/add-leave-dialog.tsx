import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Textarea } from "../ui/textarea";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { axiosInstance } from "@/lib/axios-instance";
import {
  CircleAlertIcon,
  LoaderIcon,
  ScrollTextIcon,
  XIcon,
} from "lucide-react";
import { Input } from "../ui/input";

type MembersDataType = {
  id: string;
  name: string;
  image: string;
  email: string;
};

interface AddLeaveDialogProps {
  selectedMember: MembersDataType | null;
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  organizationId: string;
}

export const AddLeaveDialog = ({
  selectedMember,
  isDialogOpen,
  setIsDialogOpen,
  organizationId,
}: AddLeaveDialogProps) => {
  const [errors, setErrors] = useState<{
    type: "CHECK_EXIST";
    message: string;
  } | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const formSchema = z.object({
    leaveDates: z
      .array(z.string())
      .min(1, { message: "Please select atleast 1 date!" }),
    reason: z.string().optional(),
  });

  type FormSchemaType = z.infer<typeof formSchema>;

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      leaveDates: [],
    },
  });

  const queryClient = useQueryClient();

  // Queries
  const { data: leaveData, isPending: leavePending } = useQuery({
    queryKey: ["get-leave"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/members/leave/${selectedMember?.id}`
      );
      return res.data;
    },
    enabled: !!selectedMember,
  });

  // Mutations
  const createLeaveMutation = useMutation({
    mutationFn: async (data: {
      reason?: string;
      memberId: string;
      organizationId: string;
      leaveDates: string[];
      timezone: string;
    }) => {
      const res = await axiosInstance.post("/admin/members/leave", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-leave"],
      });
      toast.success(
        `Leave added successfully for ${selectedMember?.name || "this member"}`
      );
      setIsDialogOpen(false);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error?.response?.data.message || "Something went wrong";
      if (message.startsWith("A check is already exists at")) {
        setErrors({
          type: "CHECK_EXIST",
          message,
        });
        return;
      }
      toast.error(message);
    },
  });
  const updateLeaveMutation = useMutation({
    mutationFn: async (data: {
      leaveId: string;
      reason?: string;
      memberId: string;
      organizationId: string;
    }) => {
      const res = await axiosInstance.put("/admin/members/leave-update", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-leave"],
      });
      toast.success(
        `Leave added successfully for ${selectedMember?.name || "this member"}`
      );
      setIsDialogOpen(false);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error?.response?.data.message || "Something went wrong";
      toast.error(message);
    },
  });
  const removeLeaveMutation = useMutation({
    mutationFn: async (data: { memberId: string; leaveId: string }) => {
      const res = await axiosInstance.post("/admin/members/leave-remove", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-leave"],
      });
      toast.success(
        `Leave removed successfully for ${
          selectedMember?.name || "this member"
        }`
      );
      setIsDialogOpen(false);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error?.response?.data.message || "Something went wrong";
      toast.error(message);
    },
  });

  useEffect(() => {
    if (leaveData) {
      form.reset({
        reason: leaveData.reason || "",
        leaveDates: [],
      });
      return;
    }
    form.reset({
      reason: "",
      leaveDates: [],
    });
  }, [leaveData]);

  // const handleRemoveLeave = () => {
  //   if (!selectedMember) {
  //     toast.error(
  //       "Member data not found. Please reload or login your account again."
  //     );
  //     return;
  //   }
  //   if (!leaveData) {
  //     toast.error(
  //       "Leave data not found. Please reload or login your account again."
  //     );
  //     return;
  //   }
  //   removeLeaveMutation.mutate({
  //     leaveId: leaveData.id,
  //     memberId: selectedMember.id,
  //   });
  // };

  const onSubmit = async (data: FormSchemaType) => {
    if (!selectedMember) {
      toast.error(
        "Member data not found. Please reload or login your account again."
      );
      return;
    }

    const mutationData = {
      reason: data.reason,
      memberId: selectedMember.id,
      organizationId,
      leaveDates: data.leaveDates,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    createLeaveMutation.mutate(mutationData);
  };

  return (
    <Dialog
      open={isDialogOpen && !!selectedMember}
      onOpenChange={(value) => {
        if (!value) {
          form.reset({
            leaveDates: [],
            reason: "",
          });
        }
        setErrors(null);
        setIsDialogOpen(value);
      }}
    >
      <DialogContent>
        {leavePending ? (
          <div className="flex items-center justify-center w-full h-28">
            <div className="flex items-center gap-2">
              <span className="text-neutral-600 text-base">Loading</span>
              <LoaderIcon className="size-5 text-neutral-600 animate-spin" />
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add Leaves</DialogTitle>
              <DialogDescription>
                Fill out the details to record leaves for{" "}
                {selectedMember?.name || "this team member"}.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={selectedMember?.image}
                    alt={`${selectedMember?.name} image`}
                  />
                  <AvatarFallback>
                    {selectedMember?.name.substring(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-neutral-800 text-base font-semibold">
                  {selectedMember?.name}
                </h2>
              </div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="my-4 space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="leaveDates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leave Dates</FormLabel>
                        <FormControl>
                          <div className="flex flex-col">
                            <Input
                              onClick={() =>
                                dateInputRef?.current?.showPicker()
                              }
                              ref={dateInputRef}
                              type="date"
                              onChange={(e) => {
                                const date = new Date(
                                  e.target.value
                                ).toISOString();
                                const isExist = field.value.find(
                                  (item) => item === date
                                );
                                if (isExist) return;
                                field.onChange([
                                  new Date(e.target.value).toISOString(),
                                  ...field.value,
                                ]);
                              }}
                            />
                            <div className="flex flex-wrap gap-3 mt-3">
                              {field.value?.map((date, index) => (
                                <div
                                  key={index}
                                  onClick={() => {
                                    const updatedDates = field.value.filter(
                                      (_, i) => i !== index
                                    );
                                    field.onChange(updatedDates);
                                  }}
                                  className="relative px-7 py-2 rounded-lg bg-foreground text-white text-sm"
                                >
                                  <span className="cursor-pointer absolute -right-1 -top-1 bg-rose-400 hover:bg-rose-500 rounded-full w-5 h-5 flex items-center justify-center">
                                    <XIcon className="text-white size-4" />
                                  </span>
                                  {new Date(date).toLocaleDateString()}
                                </div>
                              ))}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Sick leave..."
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {errors && errors.type === "CHECK_EXIST" ? (
                    <span className="flex items-center gap-2 text-sm text-rose-400">
                      <CircleAlertIcon /> {errors.message}
                    </span>
                  ) : null}
                  <Button disabled={createLeaveMutation.isPending}>
                    {createLeaveMutation.isPending
                      ? "Please wait..."
                      : "Add Leaves"}
                  </Button>
                </form>
              </Form>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
