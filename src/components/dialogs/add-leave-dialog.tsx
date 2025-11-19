import { Dispatch, SetStateAction, useEffect } from "react";
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
import { LoaderIcon, ScrollTextIcon } from "lucide-react";

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
  const formSchema = z.object({
    reason: z.string().optional(),
  });

  type FormSchemaType = z.infer<typeof formSchema>;

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
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
      });
      return;
    }
    form.reset({
      reason: "",
    });
  }, [leaveData]);

  const handleRemoveLeave = () => {
    if (!selectedMember) {
      toast.error(
        "Member data not found. Please reload or login your account again."
      );
      return;
    }
    if (!leaveData) {
      toast.error(
        "Leave data not found. Please reload or login your account again."
      );
      return;
    }
    removeLeaveMutation.mutate({
      leaveId: leaveData.id,
      memberId: selectedMember.id,
    });
  };

  const onSubmit = async (data: FormSchemaType) => {
    if (!selectedMember) {
      toast.error(
        "Member data not found. Please reload or login your account again."
      );
      return;
    }
    if (leaveData) {
      const mutationData = {
        reason: data.reason,
        memberId: selectedMember.id,
        organizationId,
        leaveId: leaveData.id,
      };
      updateLeaveMutation.mutate(mutationData);
    } else {
      const mutationData = {
        reason: data.reason,
        memberId: selectedMember.id,
        organizationId,
      };
      createLeaveMutation.mutate(mutationData);
    }
  };

  return (
    <Dialog
      open={isDialogOpen && !!selectedMember}
      onOpenChange={setIsDialogOpen}
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
            {leaveData ? (
              <>
                <DialogHeader>
                  <DialogTitle>Update/Remove a Leave</DialogTitle>
                  <DialogDescription>
                    Change or remove leave record for{" "}
                    {selectedMember?.name || "this team member"}.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center">
                  <div className="bg-foreground rounded-xl px-4 py-5 flex flex-col items-center w-full">
                    <ScrollTextIcon className="size-24 text-white" />
                    <h2 className="text-base text-white">
                      Leave for today has already been created for{" "}
                      {selectedMember?.name || "this member"}
                    </h2>
                    <span className="text-neutral-200 text-base">
                      You can <b className="text-green-400">update</b> or{" "}
                      <b className="text-rose-400">delete</b>
                    </span>
                  </div>
                  <div className="flex flex-col w-full mt-4">
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
                          name="reason"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reason (optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Sick leave..."
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex items-center gap-3">
                          <Button
                            disabled={
                              createLeaveMutation.isPending ||
                              removeLeaveMutation.isPending
                            }
                          >
                            {createLeaveMutation.isPending
                              ? "Please wait..."
                              : "Update Today's Leave"}
                          </Button>
                          <Button
                            type="button"
                            onClick={handleRemoveLeave}
                            disabled={
                              createLeaveMutation.isPending ||
                              removeLeaveMutation.isPending
                            }
                            variant="destructive"
                          >
                            {removeLeaveMutation.isPending
                              ? "Please wait..."
                              : "Remove Today's Leave"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </div>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Add a Leave</DialogTitle>
                  <DialogDescription>
                    Fill out the details to record leave for{" "}
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
                      <Button disabled={createLeaveMutation.isPending}>
                        {createLeaveMutation.isPending
                          ? "Please wait..."
                          : "Add Today's Leave"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
