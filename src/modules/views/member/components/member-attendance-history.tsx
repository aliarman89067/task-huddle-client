"use client";
import {
  Calendar,
  CheckIcon,
  Clock,
  ClockIcon,
  EllipsisVerticalIcon,
  NotepadTextIcon,
  ScrollTextIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { useGetCheck } from "@/hooks/use-get-check";
import { CheckInDetailsDialog } from "./check-in-details-dialog";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Breaks = {
  id: string;
  type: "BreakIn" | "BreakOut";
  breakInTime: Date;
  breakOutTime: Date;
}[];

type ResponseType = {
  id: string;
  type?: string;
  createdAt: Date;
  checkInTime?: Date | null;
  checkOutTime?: Date | null;
  isCheckInLate?: boolean;
  isCheckOutEarly?: boolean;
  checkInDifference?: number | null;
  checkOutDifference?: number | null;
  checkInMessage?: string | null;
  checkOutMessage?: string | null;
  isGrace?: boolean;
  reason?: string | null;
  leaveDate?: Date | null;
  breaks: Breaks;
};

interface Props {
  organizationId: string;
}

export function MemberAttendanceHistory({ organizationId }: Props) {
  const queryClient = new QueryClient();
  const [selectedCheckIn, setSelectedCheckIn] = useState<ResponseType | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { refetch: checkRefetch } = useGetCheck(organizationId!);
  const [states, setStates] = useState({
    onTime: 0,
    lates: 0,
    leaves: 0,
  });
  const [duration, setDuration] = useState<
    "this week" | "this month" | "this year"
  >("this week");

  const { data, isPending, refetch } = useQuery({
    queryKey: ["member-attendance-history"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/member/check/check-attendance/${organizationId}?duration=${duration}`
      );
      return res.data as ResponseType[];
    },
  });
  const resumeCheckInMutation = useMutation({
    mutationFn: async (checkId: string) => {
      const response = await axiosInstance.post(
        "/member/check/resume-check-in",
        { checkId }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-check"],
      });
      queryClient.invalidateQueries({
        queryKey: ["member-attendance-analytics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["member-checks-analytics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["member-attendance-history"],
      });
      checkRefetch();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Something went wrong");
    },
  });

  useEffect(() => {
    if (data) {
      const leaves = data.filter(
        (item) => item && item.type === "Leave"
      ).length;
      const lates = data.filter(
        (item) => item && item.isCheckInLate && item.type !== "Leave"
      ).length;
      const onTime = data.filter(
        (item) => item && !item.isCheckInLate && item.type !== "Leave"
      ).length;
      setStates({ leaves, lates, onTime });
    }
  }, [data, isPending]);

  useEffect(() => {
    if (duration) {
      refetch();
    }
  }, [duration]);

  const getTotalTime = ({
    checkInTime,
    checkOutTime,
  }: {
    checkInTime: Date;
    checkOutTime: Date;
  }) => {
    const diff =
      new Date(checkOutTime).getTime() - new Date(checkInTime).getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `
            ${String(hours).padStart(2, "0")}
            :
            ${String(minutes).padStart(2, "0")}
        :
        ${String(seconds).padStart(2, "0")}
          `;
  };

  const getTotalBreaksTime = (breaks: Breaks) => {
    let diff = 0;

    breaks?.forEach((item) => {
      if (item.type === "BreakOut") {
        diff +=
          new Date(item.breakOutTime).getTime() -
          new Date(item.breakInTime).getTime();
      }
    });
    if (diff === 0) {
      return "-";
    }
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `
            ${String(hours).padStart(2, "0")}
            :
            ${String(minutes).padStart(2, "0")}
        :
        ${String(seconds).padStart(2, "0")}
          `;
  };

  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="shadow-medium">
      <CheckInDetailsDialog
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
        checkInData={selectedCheckIn}
        setCheckInData={setSelectedCheckIn}
      />
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Recent Attendance
          </CardTitle>
          <Select
            value={duration}
            defaultValue="week"
            onValueChange={(value) => setDuration(value as typeof duration)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this week">This Week</SelectItem>
              <SelectItem value="this month">This Month</SelectItem>
              <SelectItem value="this year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {data && data.filter((item) => item).length < 1 ? (
          <div className="flex flex-col gap-2 items-center justify-center">
            <Image
              src="/images/calendar.png"
              alt="Calendar Image"
              width={250}
              height={250}
              className="object-contain"
            />
            <h3 className="text-neutral-700 text-lg font-semibold">
              No attendance history found
            </h3>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-5 mb-4">
              <div className="relative w-full h-36 rounded-xl bg-neutral-800 flex flex-col pl-6 pt-6 gap-1 overflow-hidden">
                <CheckIcon className="text-green-500 size-[150px] absolute -right-[40px] -top-[40px] rotate-12" />
                <span className="text-white font-semibold text-xl">
                  On Time
                </span>
                <div className="flex items-center">
                  <span className="text-green-500 font-semibold text-4xl">
                    {states.onTime}
                  </span>
                  <CheckIcon className="text-green-500 size-9" />
                </div>
              </div>
              <div className="relative w-full h-36 rounded-xl bg-neutral-800 flex flex-col pl-6 pt-6 gap-1 overflow-hidden">
                <ClockIcon className="text-white size-[150px] absolute -right-[40px] -top-[40px] rotate-12" />
                <span className="text-white font-semibold text-xl">Lates</span>
                <div className="flex items-center">
                  <span className="text-white font-semibold text-4xl">
                    {states.lates}
                  </span>
                  <ClockIcon className="text-white size-9" />
                </div>
              </div>
              <div className="relative w-full h-36 rounded-xl bg-neutral-800 flex flex-col pl-6 pt-6 gap-1 overflow-hidden">
                <ScrollTextIcon className="text-rose-400 size-[150px] absolute -right-[40px] -top-[40px] rotate-12" />
                <span className="text-white font-semibold text-xl">Leave</span>
                <div className="flex items-center">
                  <span className="text-rose-400 font-semibold text-4xl">
                    {states.leaves}
                  </span>
                  <ScrollTextIcon className="text-rose-400 size-9" />
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Total Time</TableHead>
                  <TableHead>Breaks</TableHead>
                  <TableHead>Total Break Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Options</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <>
                  {data &&
                    data
                      .filter((item) => item)
                      .map((item, index) => {
                        return (
                          <TableRow
                            key={index}
                            className={cn(
                              selectedCheckIn?.id === item.id && "bg-primary/20"
                            )}
                          >
                            <TableCell className="font-medium">
                              {new Date(item.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {item.checkInTime
                                  ? new Date(
                                      item.checkInTime
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "-"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {item.checkOutTime
                                  ? new Date(
                                      item.checkOutTime
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "-"}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono">
                              {item.type === "CheckIn" && "-"}
                              {item.type === "Leave" && "-"}
                              {item.type === "CheckOut" &&
                                getTotalTime({
                                  checkInTime: item.checkInTime!,
                                  checkOutTime: item.checkOutTime!,
                                })}
                            </TableCell>
                            <TableCell className="font-mono">
                              {item?.breaks?.length || 0}
                            </TableCell>
                            <TableCell className="font-mono">
                              <div className="flex items-center gap-1">
                                {/* <Clock className="h-3 w-3 text-muted-foreground" /> */}
                                {getTotalBreaksTime(item.breaks)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {(item.type === "CheckIn" ||
                                item.type === "CheckOut") &&
                                !item.isCheckInLate && (
                                  <div className="flex items-center gap-1 text-green-500 text-sm">
                                    On Time <CheckIcon className="size-4" />
                                  </div>
                                )}
                              {(item.type === "CheckIn" ||
                                item.type === "CheckOut") &&
                                item.isCheckInLate && (
                                  <div className="flex items-center gap-1 text-neutral-800 text-sm">
                                    Late <ClockIcon className="size-4" />
                                  </div>
                                )}
                              {item.type === "Leave" && (
                                <div className="flex items-center gap-1 text-rose-500 text-sm">
                                  Leave <NotepadTextIcon className="size-4" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <EllipsisVerticalIcon />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        Resume Check In
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>

                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Are you sure you want to resume this
                                          Check In?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          If you continue, the check-in will be
                                          resumed.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>

                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            resumeCheckInMutation.mutate(
                                              item.id
                                            )
                                          }
                                        >
                                          Continue
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedCheckIn(item);
                                      setIsDetailsOpen(true);
                                    }}
                                  >
                                    View Full Details
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </>
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
