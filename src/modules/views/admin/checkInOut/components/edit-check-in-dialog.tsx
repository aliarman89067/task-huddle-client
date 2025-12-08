import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from "@/lib/axios-instance";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { toast } from "sonner";
import z from "zod";
import { ResponseType } from "@/lib/schema";

const formSchema = z.object({
  checkId: z.string(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  isLate: z.enum(["late", "on_time"]).optional(),
  isLeaveEarly: z.enum(["early", "on_time"]).optional(),
  breaks: z.array(
    z.object({
      breakId: z.string(),
      breakIn: z.string(),
      breakOut: z.string(),
    })
  ),
});

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  checkInData: ResponseType | null;
  setCheckInData: Dispatch<SetStateAction<ResponseType | null>>;
  refetch: () => void;
}

export const EditCheckInDialog = ({
  isOpen,
  setIsOpen,
  checkInData,
  setCheckInData,
  refetch,
}: Props) => {
  const queryClient = useQueryClient();
  const checkInRef = useRef<HTMLInputElement | null>(null);
  const checkOutRef = useRef<HTMLInputElement | null>(null);
  const [leaveText, setLeaveText] = useState("");

  const breakInRefs = useRef<HTMLInputElement[]>([]);
  const breakOutRefs = useRef<HTMLInputElement[]>([]);

  // Mutation
  const checkUpdateMutate = useMutation({
    mutationFn: async (
      data: z.infer<typeof formSchema> & { timezone: string }
    ) => {
      const response = await axiosInstance.put("/admin/checks/update", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Check in/out update successfully");
      queryClient.invalidateQueries({
        queryKey: ["member-attendance-history"],
      });
      refetch();
      setIsOpen(false);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong!";
      toast.error(errorMessage);
    },
  });
  const leaveUpdateMutate = useMutation({
    mutationFn: async (leaveId: string) => {
      const response = await axiosInstance.put("/admin/checks/update-leave", {
        leaveId,
        reason: leaveText,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Leave updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["member-attendance-history"],
      });
      refetch();
      setIsOpen(false);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong!";
      toast.error(errorMessage);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkId: "",
      checkIn: "",
      checkOut: "",
      isLate: undefined,
      isLeaveEarly: undefined,
      breaks: [],
    },
  });

  const getDateTime = (time?: Date | null) => {
    if (!time) return "";
    return dayjs(time).format("YYYY-MM-DDTHH:mm");
  };

  useEffect(() => {
    if (!checkInData) return;
    setLeaveText(checkInData?.reason || "");
    const isCheckInLate = JSON.stringify(checkInData.isCheckInLate);
    const isCheckOutEarly = JSON.stringify(checkInData.isCheckOutEarly);
    form.reset({
      checkId: checkInData.id,
      checkIn: getDateTime(checkInData.checkInTime) || undefined,
      checkOut: getDateTime(checkInData.checkOutTime) || undefined,
      isLate:
        isCheckInLate === "true"
          ? "late"
          : isCheckInLate === "false"
          ? "on_time"
          : undefined,
      isLeaveEarly:
        isCheckOutEarly === "true"
          ? "early"
          : isCheckInLate === "false"
          ? "on_time"
          : undefined,
      breaks:
        checkInData?.breaks?.map((item) => ({
          breakId: item.id,
          breakIn: getDateTime(item.breakInTime) || undefined,
          breakOut: getDateTime(item.breakOutTime) || undefined,
        })) || [],
    });
  }, [checkInData]);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    checkUpdateMutate.mutate({ ...data, timezone });
  };

  if (!checkInData) {
    setIsOpen(false);
    return;
  }
  console.log(checkInData);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        if (!value) {
          setCheckInData(null);
        }
        setIsOpen(value);
      }}
    >
      <DialogContent>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-2">
            <Avatar className="w-12 h-12">
              <AvatarImage
                src={checkInData.member?.image || ""}
                alt={`${checkInData.member.name} profile image`}
              />
              <AvatarFallback className="bg-neutral-800 text-white text-xl">
                {checkInData.member.name.substring(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Badge>{checkInData.member.info?.[0]?.designation}</Badge>
              <h3 className="text-neutral-800 font-semibold text-lg">
                {checkInData.member.name}
              </h3>
              <h3 className="text-neutral-600 text-sm">
                {checkInData.member.email}
              </h3>
            </div>
          </div>
          {checkInData.type === "Leave" && (
            <div className="flex flex-col gap-2 mt-3">
              <div className="flex flex-col">
                <span>
                  {new Date(checkInData?.createdAt || "").toLocaleDateString()}
                </span>
                <h3 className="text-3xl font-extrabold text-neutral-800">
                  Leave
                </h3>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  leaveUpdateMutate.mutate(checkInData.id);
                }}
              >
                <Input
                  disabled={leaveUpdateMutate.isPending}
                  placeholder="Sick Leave..."
                  value={leaveText}
                  onChange={(e) => setLeaveText(e.target.value)}
                />

                <div className="flex items-center gap-3 mt-3">
                  <Button
                    type="button"
                    disabled={leaveUpdateMutate.isPending}
                    onClick={() => setIsOpen(false)}
                    className="flex-1 bg-rose-400 hover:bg-rose-500"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={leaveUpdateMutate.isPending}
                    type="submit"
                    className="flex-1"
                  >
                    {leaveUpdateMutate.isPending ? "Updating..." : "Update"}
                  </Button>
                </div>
              </form>
            </div>
          )}
          {(checkInData.type === "CheckIn" ||
            checkInData.type === "CheckOut") && (
            <Form {...form}>
              <form
                className="flex flex-col gap-2 mt-4"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="checkIn"
                    render={({ field: { ref, ...rest } }) => (
                      <FormItem>
                        <FormLabel>Check In</FormLabel>
                        <FormControl>
                          <Input
                            onClick={() => checkInRef?.current?.showPicker()}
                            ref={checkInRef}
                            type="datetime-local"
                            {...rest}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="checkOut"
                    render={({ field: { ref, ...rest } }) => (
                      <FormItem>
                        <FormLabel>Check Out</FormLabel>
                        <FormControl>
                          <Input
                            onClick={() => checkOutRef?.current?.showPicker()}
                            ref={checkOutRef}
                            type="datetime-local"
                            {...rest}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <FormField
                    control={form.control}
                    name="isLate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check In Late</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(value) => field.onChange(value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="On Time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="on_time">On Time</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isLeaveEarly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check Out Early</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(value) => field.onChange(value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="On Time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="on_time">On Time</SelectItem>
                              <SelectItem value="early">Early</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-neutral-800 font-medium text-sm">
                    {checkInData?.breaks?.length || 0} Breaks
                  </span>
                  <FormField
                    control={form.control}
                    name="breaks"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-col gap-1 h-40 overflow-y-scroll sidebar-scrollbar-sm pr-1">
                            {field.value.map((item, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-2 gap-4"
                              >
                                <Input
                                  onClick={() =>
                                    breakInRefs.current[index].showPicker()
                                  }
                                  ref={(el) => {
                                    if (!el) return;
                                    breakInRefs.current[index] = el;
                                  }}
                                  value={item.breakIn}
                                  onChange={(e) => {
                                    const updatedValue = [...field.value];
                                    updatedValue[index].breakIn =
                                      e.target.value;
                                    field.onChange(updatedValue);
                                  }}
                                  type="datetime-local"
                                />
                                <Input
                                  onClick={() =>
                                    breakOutRefs.current[index].showPicker()
                                  }
                                  ref={(el) => {
                                    if (!el) return;
                                    breakOutRefs.current[index] = el;
                                  }}
                                  value={item.breakOut}
                                  onChange={(e) => {
                                    const updatedValue = [...field.value];
                                    updatedValue[index].breakOut =
                                      e.target.value;
                                    field.onChange(updatedValue);
                                  }}
                                  type="datetime-local"
                                />
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <Button
                    type="button"
                    disabled={checkUpdateMutate.isPending}
                    onClick={() => setIsOpen(false)}
                    className="flex-1 bg-rose-400 hover:bg-rose-500"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={checkUpdateMutate.isPending}
                    type="submit"
                    className="flex-1"
                  >
                    {checkUpdateMutate.isPending ? "Updating..." : "Update"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
