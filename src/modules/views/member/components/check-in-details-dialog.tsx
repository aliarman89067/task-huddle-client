import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ClockIcon, MessageSquareIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

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
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  checkInData: ResponseType | null;
  setCheckInData: Dispatch<SetStateAction<ResponseType | null>>;
}

export const CheckInDetailsDialog = ({
  isOpen,
  setIsOpen,
  checkInData,
  setCheckInData,
}: Props) => {
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
    console.log("Diff ", diff);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 360000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `
            ${String(hours).padStart(2, "0")}
            :
            ${String(minutes).padStart(2, "0")}
        :
        ${String(seconds).padStart(2, "0")}
          `;
  };

  const totalBreakTime = (breakInTime: Date, breakOutTime: Date) => {
    const diff =
      new Date(breakOutTime).getTime() - new Date(breakInTime).getTime();
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
          {checkInData.type !== "Leave" ? (
            <div className="flex flex-col gap-2">
              <h3
                className={cn(
                  "text-3xl font-extrabold",
                  checkInData.isCheckInLate ? "text-rose-500" : "text-green-500"
                )}
              >
                {checkInData.isCheckInLate ? "Late" : "On Time"}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="w-full rounded-xl bg-primary/30 flex flex-col gap-2.5 py-4 px-3">
                  <h2 className="text-neutral-800 text-lg text-center font-semibold flex items-center gap-1 justify-center">
                    <ClockIcon size={18} /> Check In
                  </h2>
                  <h1 className="text-center font-bold text-neutral-900 text-2xl">
                    {checkInData.checkInTime
                      ? new Date(checkInData.checkInTime).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "-"}
                  </h1>
                  {checkInData?.checkInMessage && (
                    <div className="flex flex-col w-full bg-white p-2 rounded-lg">
                      <span className="text-sm text-neutral-700 font-medium flex items-center gap-1">
                        <MessageSquareIcon size={16} /> Check In Message
                      </span>
                      <p className="text-base text-neutral-800">
                        {checkInData.checkInMessage}
                      </p>
                    </div>
                  )}
                </div>
                <div className="w-full rounded-xl bg-primary/30 flex flex-col gap-2.5 py-4 px-3">
                  <h2 className="text-neutral-800 text-lg text-center font-semibold flex items-center gap-1 justify-center">
                    <ClockIcon size={18} /> Check Out
                  </h2>
                  <h1 className="text-center font-bold text-neutral-900 text-2xl">
                    {checkInData.checkOutTime
                      ? new Date(checkInData.checkOutTime).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "-"}
                  </h1>
                  {checkInData?.checkOutMessage && (
                    <div className="flex flex-col w-full bg-white p-2 rounded-lg">
                      <span className="text-sm text-neutral-700 font-medium flex items-center gap-1">
                        <MessageSquareIcon size={16} /> Check Out Message
                      </span>
                      <p className="text-base text-neutral-800">
                        {checkInData.checkOutMessage}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full px-4 py-2.5 rounded-xl bg-primary/30 flex flex-col items-center">
                <span className="flex items-center gap-2 text-neutral-800 text-lg font-semibold">
                  <ClockIcon size={18} /> Total Time
                </span>
                <h2 className="text-neutral-900 text-2xl font-bold">
                  {checkInData.type === "CheckIn" && "-"}
                  {checkInData.type === "Leave" && "-"}
                  {checkInData.type === "CheckOut" &&
                    getTotalTime({
                      checkInTime: checkInData.checkInTime!,
                      checkOutTime: checkInData.checkOutTime!,
                    })}
                </h2>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <span className="text-lg font-semibold text-neutral-800">
                  {checkInData?.breaks?.length || 0} Breaks
                </span>

                {getTotalBreaksTime(checkInData.breaks) === "-" ? (
                  <h3 className="text-xl text-center font-semibold text-neutral-700">
                    No Breaks
                  </h3>
                ) : (
                  <div className="flex flex-1 gap-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Break In Time</TableHead>
                          <TableHead>Break Out Time</TableHead>
                          <TableHead>Total Break Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {checkInData.breaks.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {item?.breakInTime
                                ? new Date(
                                    item.breakInTime
                                  ).toLocaleTimeString()
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {item?.breakOutTime
                                ? new Date(
                                    item.breakOutTime
                                  ).toLocaleTimeString()
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {item.breakInTime && item.breakOutTime
                                ? totalBreakTime(
                                    item.breakInTime,
                                    item.breakOutTime
                                  )
                                : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <div className="w-full px-4 py-2.5 rounded-xl bg-primary/30 flex flex-col items-center">
                  <span className="flex items-center gap-2 text-neutral-800 text-lg font-semibold">
                    <ClockIcon size={18} /> Total Break Time
                  </span>
                  <h2 className="text-neutral-900 text-2xl font-bold">
                    {getTotalBreaksTime(checkInData.breaks)}
                  </h2>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <span>
                  {new Date(checkInData?.createdAt || "").toLocaleDateString()}
                </span>
                <h3 className="text-3xl font-extrabold text-neutral-800">
                  Leave
                </h3>
              </div>
              <div className="w-full rounded-xl px-3 py-4 text-center bg-primary/30">
                {checkInData.reason ? checkInData.reason : "--"}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
