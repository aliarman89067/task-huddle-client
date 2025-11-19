import { useEffect, useState } from "react";
import { ArrowRightIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance";
import { organizationStore } from "@/zustand/member.store";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { IPErrorMessage } from "@/constant";
import { IPErrorDialog } from "@/components/dialogs/ip-error-dialog";

interface Props {
  organizationId: string;
}

type checkType = {
  id: string;
  isLate: boolean;
  type: "CheckIn" | "CheckOut";
  checkInTime: Date;
  checkOutTime: Date;
  memberId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};

export function CheckInBox({ organizationId }: Props) {
  const router = useRouter();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkedInTime, setCheckedInTime] = useState<Date | null>(null);
  const [message, setMessage] = useState("");
  const [timeElapsed, setTimeElapsed] = useState("00:00:00");
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const queryClient = useQueryClient();
  const { selectedOrganizationId } = organizationStore();

  // Queries
  const {
    data: check,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["get-check"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/member/check/${organizationId}`);
      return res.data as checkType;
    },
    retry: 1,
  });

  // Mutations
  const checkMutation = useMutation({
    mutationFn: async () => {
      const requestData = {
        organizationId: selectedOrganizationId,
        message,
        checkInDate: new Date(),
      };
      const res = await axiosInstance.post(`/member/check`, requestData);
      return res.data;
    },
    onSuccess(data: any) {
      queryClient.invalidateQueries({
        queryKey: [
          "get-check",
          "member-attendance-analytics",
          "member-checks-analytics",
        ],
      });
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
        toast.success(data.message, {
          description: `Total time ${timeElapsed}`,
        });
      }
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
    if (check && check.type === "CheckIn") {
      setIsCheckedIn(check.type === "CheckIn");
      setCheckedInTime(new Date(check.checkInTime));
    }
  }, [router, check]);

  useEffect(() => {
    if (isCheckedIn && checkedInTime) {
      const intervalId = setInterval(() => {
        const diff = Date.now() - checkedInTime.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 360000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeElapsed(`
            ${String(hours).padStart(2, "0")}
            :
            ${String(minutes).padStart(2, "0")}
        :
        ${String(seconds).padStart(2, "0")}
          `);
      }, 1000);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isCheckedIn, checkedInTime]);

  const handleCheck = () => {
    if (!isCheckedIn) {
      setTimeElapsed("00:00:00");
    }
    checkMutation.mutate();
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
            <span className="text-white font-extrabold text-4xl font-sansitia">
              {checkMutation.isPending ? (
                <>{isCheckedIn ? "Stopping..." : "Starting..."}</>
              ) : (
                timeElapsed
              )}
            </span>
            <Input
              value={message}
              onKeyDown={handleKeyDown}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-10 border border-neutral-400 rounded-lg text-neutral-100 text-sm! placeholder:text-neutral-400"
              placeholder="Add a short message (Optional)"
            />

            <button
              disabled={checkMutation.isPending}
              onClick={handleCheck}
              className="relative group w-[350px] h-[65px] cursor-pointer active:opacity-90"
            >
              <div
                className={cn(
                  "relative overflow-hidden rounded-xl h-full ring-0 ring-offset-0 hover:ring-1 hover:ring-offset-1 w-full p-0.5 transition-all duration-300 ease-in-out",
                  isCheckedIn ? "ring-rose-400" : "ring-white"
                )}
              >
                <div
                  className={cn(
                    "w-full h-full rounded-xl flex items-center justify-center gap-2",
                    isCheckedIn
                      ? "bg-rose-400 text-white"
                      : "bg-white text-neutral-800"
                  )}
                >
                  <span>{isCheckedIn ? "Check Out" : "Check In"}</span>
                  <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <div className="h-[200px] w-[45px] absolute -top-20 -left-20 rotate-[40deg] bg-foreground/10 group-hover:left-[105%] transition-all duration-500 ease-in-out z-10" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
