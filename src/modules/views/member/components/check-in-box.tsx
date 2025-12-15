import { useContext, useEffect, useRef, useState } from "react";
import { ArrowRightIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance";
import { organizationStore } from "@/zustand/member.store";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { IPErrorMessage } from "@/constant";
import { IPErrorDialog } from "@/components/dialogs/ip-error-dialog";
import { useGetCheck } from "@/hooks/use-get-check";
import { SocketContext } from "@/lib/socket-context";

interface Props {
  organizationId: string;
}

export function CheckInBox({ organizationId }: Props) {
  const router = useRouter();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkedInTime, setCheckedInTime] = useState<Date | null>(null);
  const [isBreakIn, setIsBreakIn] = useState(false);
  const [breakInTime, setBreakInTime] = useState<Date | null>(null);
  const [message, setMessage] = useState("");
  const [checkInTimeElapsed, setCheckInTimeElapsed] = useState("00:00:00");
  const [breakInTimeElapsed, setBreakInTimeElapsed] = useState("00:00:00");
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const queryClient = useQueryClient();
  const socket = useContext(SocketContext);
  const { selectedOrganizationId } = organizationStore();
  const { check, isPending, refetch } = useGetCheck(selectedOrganizationId!);

  const checkIntervalRef = useRef<any>(null);
  const BreakIntervalRef = useRef<any>(null);

  // Mutations
  const checkMutation = useMutation({
    mutationFn: async () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log(timezone);
      const requestData = {
        organizationId: selectedOrganizationId,
        message,
        checkInDate: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const res = await axiosInstance.post(`/member/check`, requestData);
      return res.data;
    },
    onSuccess: (data: any) => {
      if (data.type === "checkIn") {
        setIsCheckedIn(true);
        setCheckedInTime(new Date(data.checkInTime));
        toast.success(data.message, {
          description: `time ${new Date(
            data.checkInTime
          ).toLocaleTimeString()}`,
        });
      } else if (data.type === "checkOut") {
        setIsCheckedIn(false);
        setIsBreakIn(false);
        setBreakInTime(null); // Add this
        setBreakInTimeElapsed("00:00:00"); // Add this
        toast.success(data.message, {
          description: `Total time ${checkInTimeElapsed}`,
        });
      }
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
      refetch();
      setMessage("");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message || "Something went wrong";
      if (message === IPErrorMessage) {
        setIsErrorOpen(true);
        return;
      }
      toast.error(message);
    },
  });
  // Mutations
  const breakMutation = useMutation({
    mutationFn: async (checkId: string) => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const requestData = {
        organizationId: selectedOrganizationId,
        checkId,
        breakTime: new Date().toISOString(),
        timezone,
      };
      const res = await axiosInstance.post(`/member/break`, requestData);
      return res.data;
    },
    onSuccess: (data: any) => {
      if (data.type === "BreakIn") {
        setIsBreakIn(true);
        setBreakInTime(new Date(data.breakInTime));
        setBreakInTimeElapsed("00:00:00");
        toast.success(data.message);
      } else if (data.type === "BreakOut") {
        setIsBreakIn(false);
        setBreakInTime(null);
        toast.success(data.message, {
          description: `Total time ${breakInTimeElapsed}`,
        });
      }
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
      refetch();
      setMessage("");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message || "Something went wrong";
      if (message === IPErrorMessage) {
        setIsErrorOpen(true);
        return;
      }
      toast.error(message);
    },
  });

  useEffect(() => {
    if (!socket) return;
    const handleAutoCheckOut = () => {
      setIsCheckedIn(false);
      setIsBreakIn(false);
      setBreakInTime(null);
      setBreakInTimeElapsed("00:00:00");
      toast.success("Auto checkout successfully", {
        description: `Total time ${checkInTimeElapsed}`,
      });
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
    };

    socket.on("auto-check-out", handleAutoCheckOut);
    return () => {
      socket.off("auto-check-out", handleAutoCheckOut);
    };
  }, [socket, isCheckedIn, checkedInTime, checkInTimeElapsed]);

  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (BreakIntervalRef.current) {
        clearInterval(BreakIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (check && check?.breaks[0]?.type === "BreakIn") {
      setIsBreakIn(true);
      setIsCheckedIn(true);
      setCheckedInTime(new Date(check.checkInTime));
      setBreakInTime(new Date(check.breaks[0].breakInTime));
    } else if (check && check.type === "CheckIn") {
      setIsCheckedIn(check.type === "CheckIn");
      setCheckedInTime(new Date(check.checkInTime));
    }
  }, [router, check, isPending]);

  useEffect(() => {
    if (isCheckedIn && checkedInTime) {
      checkIntervalRef.current = setInterval(() => {
        const diff = Date.now() - checkedInTime.getTime();

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        setCheckInTimeElapsed(
          `${String(hours).padStart(2, "0")} : ${String(minutes).padStart(
            2,
            "0"
          )} : ${String(seconds).padStart(2, "0")}`
        );
      }, 1000);

      return () => {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      };
    } else {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  }, [isCheckedIn, checkedInTime]);

  useEffect(() => {
    if (isBreakIn && breakInTime) {
      BreakIntervalRef.current = setInterval(() => {
        const diff = Date.now() - breakInTime.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        setBreakInTimeElapsed(`
        ${String(hours).padStart(2, "0")}
        :
        ${String(minutes).padStart(2, "0")}
        :
        ${String(seconds).padStart(2, "0")}
      `);
      }, 1000);

      // Clear interval when break ends
      return () => {
        if (BreakIntervalRef.current) {
          clearInterval(BreakIntervalRef.current);
          BreakIntervalRef.current = null;
        }
      };
    } else {
      // Also clear interval when not in break
      if (BreakIntervalRef.current) {
        clearInterval(BreakIntervalRef.current);
        BreakIntervalRef.current = null;
      }
    }
  }, [isBreakIn, breakInTime]);

  const handleCheck = () => {
    if (!isCheckedIn) {
      setCheckInTimeElapsed("00:00:00");
    }
    checkMutation.mutate();
  };
  const handleBreak = (checkId: string) => {
    if (!isBreakIn) {
      setBreakInTimeElapsed("00:00:00");
    }
    breakMutation.mutate(checkId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      checkMutation.mutate();
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <IPErrorDialog isOpen={isErrorOpen} setIsOpen={setIsErrorOpen} />
      <h3 className="text-neutral-700 text-xl font-medium font-sansitia mb-2">
        Check In / Out
      </h3>
      <div className="w-full py-16 rounded-2xl bg-foreground flex items-center justify-center">
        {isPending ? (
          <div className="flex items-center gap-2 py-10">
            <span className="text-white">Loading</span>
            <LoaderIcon className="size-5 animate-spin text-white" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            {isBreakIn && (
              <div className="bg-white px-16 py-3 rounded-lg flex flex-col items-center justify-center">
                <span className="text-foreground font-semibold text-xl">
                  Break Time
                </span>
                <span className="text-foreground font-extrabold text-4xl font-sansitia">
                  {breakMutation.isPending ? (
                    <>{isBreakIn ? "Stopping..." : "Starting..."}</>
                  ) : (
                    breakInTimeElapsed
                  )}
                </span>
              </div>
            )}
            {!isBreakIn && (
              <>
                <span className="text-white font-extrabold text-4xl font-sansitia">
                  {checkMutation.isPending ? (
                    <>{isCheckedIn ? "Stopping..." : "Starting..."}</>
                  ) : (
                    checkInTimeElapsed
                  )}
                </span>
                <Input
                  value={message}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-10 border border-neutral-400 rounded-lg text-neutral-100 text-sm! placeholder:text-neutral-400"
                  placeholder="Add a short message (Optional)"
                />
              </>
            )}
            {isCheckedIn ? (
              <div className="flex items-center gap-3">
                <button
                  disabled={breakMutation.isPending}
                  onClick={() => handleBreak(check?.id!)}
                  className={cn(
                    "relative group w-[200px] h-[65px] cursor-pointer active:opacity-90",
                    breakMutation.isPending && "opacity-70 cursor-not-allowed"
                  )}
                >
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-xl h-full ring-0 ring-offset-0 hover:ring-1 hover:ring-offset-1 w-full p-0.5 transition-all duration-300 ease-in-out",
                      isBreakIn ? "ring-primary" : "ring-white"
                    )}
                  >
                    <div
                      className={cn(
                        "w-full h-full rounded-xl flex items-center justify-center gap-2",
                        isBreakIn
                          ? "bg-primary text-white"
                          : "bg-white text-neutral-800"
                      )}
                    >
                      <span>{isBreakIn ? "Break Out" : "Break In"}</span>
                      <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <div className="h-[200px] w-[45px] absolute -top-20 -left-20 rotate-[40deg] bg-foreground/10 group-hover:left-[105%] transition-all duration-500 ease-in-out z-10" />
                  </div>
                </button>
                <button
                  disabled={checkMutation.isPending}
                  onClick={handleCheck}
                  className={cn(
                    "relative group w-[200px] h-[65px] cursor-pointer active:opacity-90",
                    checkMutation.isPending && "opacity-70 cursor-not-allowed"
                  )}
                >
                  <div
                    className={cn(
                      "relative ring-rose-400 overflow-hidden rounded-xl h-full ring-0 ring-offset-0 hover:ring-1 hover:ring-offset-1 w-full p-0.5 transition-all duration-300 ease-in-out"
                    )}
                  >
                    <div
                      className={cn(
                        "w-full h-full bg-rose-400 text-white rounded-xl flex items-center justify-center gap-2"
                      )}
                    >
                      {checkMutation.isPending ? (
                        <span>Please Wait</span>
                      ) : (
                        <>
                          <span>Check Out</span>
                          <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-all duration-300" />
                        </>
                      )}
                    </div>
                    <div className="h-[200px] w-[45px] absolute -top-20 -left-20 rotate-[40deg] bg-foreground/10 group-hover:left-[105%] transition-all duration-500 ease-in-out z-10" />
                  </div>
                </button>
              </div>
            ) : (
              <button
                disabled={checkMutation.isPending}
                onClick={handleCheck}
                className={cn(
                  "relative group w-[350px] h-[65px] cursor-pointer active:opacity-90",
                  checkMutation.isPending && "opacity-70 cursor-not-allowed"
                )}
              >
                <div
                  className={cn(
                    "relative overflow-hidden ring-white rounded-xl h-full ring-0 ring-offset-0 hover:ring-1 hover:ring-offset-1 w-full p-0.5 transition-all duration-300 ease-in-out"
                  )}
                >
                  <div
                    className={cn(
                      "w-full h-full bg-white text-neutral-800 rounded-xl flex items-center justify-center gap-2"
                    )}
                  >
                    {checkMutation.isPending ? (
                      <span>Please Wait</span>
                    ) : (
                      <>
                        <span>Check In</span>
                        <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-all duration-300" />
                      </>
                    )}
                  </div>
                  <div className="h-[200px] w-[45px] absolute -top-20 -left-20 rotate-[40deg] bg-foreground/10 group-hover:left-[105%] transition-all duration-500 ease-in-out z-10" />
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
