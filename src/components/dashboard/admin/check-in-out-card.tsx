import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { axiosInstance } from "@/lib/axios-instance";
import { Breaks, ResponseType } from "@/lib/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  Calendar,
  CheckIcon,
  Clock,
  ClockIcon,
  EllipsisVerticalIcon,
  NotepadTextIcon,
  PencilIcon,
  ScrollTextIcon,
} from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

interface Props {
  selectedMember: string;
  setSelectedMember: Dispatch<SetStateAction<string>>;
  organizationData: any;
  duration: "today" | "this week" | "this month" | "this year";
  setDuration: Dispatch<
    SetStateAction<"today" | "this week" | "this month" | "this year">
  >;
  data: ResponseType[];
  states: {
    onTime: number;
    lates: number;
    leaves: number;
  };
  setSelectedCheckIn: Dispatch<SetStateAction<ResponseType | null>>;
  setIsEditOpen: Dispatch<SetStateAction<boolean>>;
  setIsDetailsOpen: Dispatch<SetStateAction<boolean>>;
  isTrashed: boolean;
}

export const CheckInOutCard = ({
  selectedMember,
  setSelectedMember,
  organizationData,
  duration,
  setDuration,
  data,
  states,
  setSelectedCheckIn,
  setIsDetailsOpen,
  setIsEditOpen,
  isTrashed,
}: Props) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({
      id,
      type,
    }: {
      id: string;
      type: "check" | "leave";
    }) => {
      const response = await axiosInstance.put(
        `/admin/checks/delete/${id}/${type}`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Check remove successfully");
      queryClient.invalidateQueries({
        queryKey: ["member-attendance-history"],
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong!";
      toast.error(errorMessage);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async ({
      id,
      type,
    }: {
      id: string;
      type: "check" | "leave";
    }) => {
      const response = await axiosInstance.put(
        `/admin/checks/restore/${id}/${type}`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Check remove successfully");
      queryClient.invalidateQueries({
        queryKey: ["member-attendance-history"],
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong!";
      toast.error(errorMessage);
    },
  });

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

  const getTotalBreakTime = (breaks: Breaks) => {
    let diff = 0;

    breaks?.forEach((item) => {
      if (item.type === "BreakOut") {
        diff +=
          new Date(item.breakOutTime).getTime() -
          new Date(item.breakInTime).getTime();
      }
    });
    if (diff === 0) {
      return "--";
    }
    console.log("Diff ", diff);
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

  console.log(data);

  return (
    <Card className="shadow-medium">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Recent Attendance
          </CardTitle>
          <div className="flex items-center gap-3">
            <Select
              value={selectedMember}
              defaultValue="all"
              onValueChange={setSelectedMember}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {organizationData?.members?.map((member: any) => (
                  <SelectItem value={member?.member?.email}>
                    {member?.member?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={duration}
              defaultValue="today"
              onValueChange={(value) => setDuration(value as typeof duration)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this week">This Week</SelectItem>
                <SelectItem value="this month">This Month</SelectItem>
                <SelectItem value="this year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                  <TableHead>Edited</TableHead>
                  <TableHead>Name</TableHead>
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
                          <TableRow key={index}>
                            <TableCell>
                              {item.isUpdate ? (
                                // <PencilIcon className="text-green-500 size-5" />
                                <Badge className="bg-foreground text-white flex items-center gap-1">
                                  <PencilIcon className="size-2.5" /> Edited
                                </Badge>
                              ) : (
                                "--"
                              )}
                            </TableCell>
                            <TableCell className="flex flex-col">
                              <Badge>{item.member.info[0].designation}</Badge>
                              {item.member.name}
                            </TableCell>

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
                                  : "--"}
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
                                  : "--"}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono">
                              {item.type === "CheckIn" && "--"}
                              {item.type === "Leave" && "--"}
                              {item.type === "CheckOut" &&
                                getTotalTime({
                                  checkInTime: item.checkInTime!,
                                  checkOutTime: item.checkOutTime!,
                                })}
                            </TableCell>
                            <TableCell className="font-mono">
                              {item.type === "Leave"
                                ? "--"
                                : item?.breaks?.length || 0}
                            </TableCell>
                            <TableCell className="font-mono">
                              <div className="flex items-center gap-1">
                                {/* <Clock className="h-3 w-3 text-muted-foreground" /> */}
                                {getTotalBreakTime(item.breaks)}
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
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedCheckIn(item);
                                      setIsEditOpen(true);
                                    }}
                                  >
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedCheckIn(item);
                                      setIsDetailsOpen(true);
                                    }}
                                  >
                                    View Full Details
                                  </DropdownMenuItem>
                                  {isTrashed ? (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        restoreMutation.mutate({
                                          id: item.id,
                                          type:
                                            item.type === "Leave"
                                              ? "leave"
                                              : "check",
                                        })
                                      }
                                    >
                                      Restore
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onClick={() =>
                                        deleteMutation.mutate({
                                          id: item.id,
                                          type:
                                            item.type === "Leave"
                                              ? "leave"
                                              : "check",
                                        })
                                      }
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  )}
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
};
