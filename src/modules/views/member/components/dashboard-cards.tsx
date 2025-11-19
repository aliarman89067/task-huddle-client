import { axiosInstance } from "@/lib/axios-instance";
import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon, LoaderIcon, UserRoundCheckIcon } from "lucide-react";
import { ReactNode } from "react";
import CountUp from "react-countup";
import { IoChatbubblesOutline } from "react-icons/io5";
import { LuPuzzle } from "react-icons/lu";
import { MdAccessAlarms } from "react-icons/md";

interface Props {
  organizationId: string;
}

type ResponseType = {
  projects: number;
  pendingProjects: number;
  checkIn: number;
  lateCheckIn: number;
  totalAttendance: number;
  attendance: number;
  chats: number;
  unreadChats: number;
};

export const DashboardCards = ({ organizationId }: Props) => {
  const { data, isPending } = useQuery({
    queryKey: ["member-analytics-count"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/member/organizations/analytics-count/${organizationId}`
      );
      return res.data as ResponseType;
    },
  });

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-neutral-700 text-xl font-medium font-sansitia mb-2">
        Statistics
      </h3>
      <div className="grid grid-cols-4 gap-4">
        {/* Projects */}
        <div className="group min-h-36 group relative rounded-xl bg-[#FCF0E4] px-3 py-4 flex flex-col gap-2 hover:shadow-sm transition-all">
          <button className="cursor-pointer absolute top-4 right-4 z-1 w-12 h-12 bg-white rounded-full border border-neutral-100 flex items-center justify-center">
            <ArrowRightIcon className="-rotate-45 size-3 text-foreground group-hover:-translate-y-[2px] group-hover:translate-x-[2px] transition-all duration-300 ease-in-out" />
          </button>
          <span className="text-foreground text-base font-medium">
            Projects
          </span>
          <div className="flex items-center gap-2 mt-1">
            <LuPuzzle className="size-7 text-foreground group-hover:text-primary transition-all" />
            <h1 className="text-foreground text-4xl">
              <RenderTextAfterPending isPending={isPending}>
                <CountUp end={data?.projects || 0} duration={3} />
              </RenderTextAfterPending>
            </h1>
          </div>
          <button className="w-fit group flex items-center gap-1 bg-transparent border-none outline-0 cursor-pointer">
            {!isPending && (
              <span className="text-[#cb7a28] text-sm">
                {data?.pendingProjects || 0} projects is pending
              </span>
            )}
          </button>
        </div>
        {/* Check In */}
        <div className="group min-h-36 group relative rounded-xl bg-[#ECF5E7] px-3 py-4 flex flex-col gap-2 hover:shadow-sm transition-all">
          <button className="cursor-pointer absolute top-4 right-4 z-1 w-12 h-12 bg-white rounded-full border border-neutral-100 flex items-center justify-center">
            <ArrowRightIcon className="-rotate-45 size-3 text-foreground group-hover:-translate-y-[2px] group-hover:translate-x-[2px] transition-all duration-300 ease-in-out" />
          </button>
          <span className="text-foreground text-base font-medium">
            Check In
          </span>
          <div className="flex items-center gap-2 mt-1">
            <MdAccessAlarms className="size-7 text-foreground group-hover:text-primary transition-all" />
            <RenderTextAfterPending isPending={isPending}>
              <h1 className="text-foreground text-4xl">
                <CountUp end={data?.checkIn || 0} duration={3} />
              </h1>
            </RenderTextAfterPending>
          </div>
          <button className="w-fit group flex items-center gap-1 bg-transparent border-none outline-0 cursor-pointer">
            {!isPending && (
              <span className="text-[#3d6f22] text-sm">
                {data?.lateCheckIn || 0} lates
              </span>
            )}
          </button>
        </div>
        {/* Attendance */}
        <div className="group min-h-36 group relative rounded-xl bg-[#EBF0FE] px-3 py-4 flex flex-col gap-2 hover:shadow-sm transition-all">
          <button className="cursor-pointer absolute top-4 right-4 z-1 w-12 h-12 bg-white rounded-full border border-neutral-100 flex items-center justify-center">
            <ArrowRightIcon className="-rotate-45 size-3 text-foreground group-hover:-translate-y-[2px] group-hover:translate-x-[2px] transition-all duration-300 ease-in-out" />
          </button>
          <span className="text-foreground text-base font-medium">
            Attendance
          </span>
          <div className="flex items-center gap-2 mt-1">
            <UserRoundCheckIcon className="size-7 text-foreground group-hover:text-primary transition-all" />
            <div className="flex items-center gap-1">
              <RenderTextAfterPending isPending={isPending}>
                <h1 className="text-foreground text-4xl">
                  <CountUp end={data?.totalAttendance || 0} duration={3} />
                </h1>
                <h1 className="text-foreground text-4xl">\</h1>
                <h1 className="text-foreground text-4xl">
                  <CountUp end={data?.attendance || 0} duration={3} />
                </h1>
              </RenderTextAfterPending>
            </div>
          </div>
          <button className="w-fit group flex items-center gap-1 bg-transparent border-none outline-0 cursor-pointer">
            {!isPending && (
              <span className="text-[#192852] text-sm">
                {data?.attendance || 0} days attendance out of{" "}
                {data?.totalAttendance || 0}
              </span>
            )}
          </button>
        </div>
        {/* Chats */}
        <div className="relative group min-h-36 group rounded-xl bg-[#ECF5F4] px-3 py-4 flex flex-col gap-2 hover:shadow-sm transition-all">
          <div className="w-5 h-5 rounded-full bg-rose-400 absolute -top-2 -left-2" />
          <button className="cursor-pointer absolute top-4 right-4 z-1 w-12 h-12 bg-white rounded-full border border-neutral-100 flex items-center justify-center">
            <ArrowRightIcon className="-rotate-45 size-3 text-foreground group-hover:-translate-y-[2px] group-hover:translate-x-[2px] transition-all duration-300 ease-in-out" />
          </button>
          <span className="text-foreground text-base font-medium">Chats</span>
          <div className="flex items-center gap-2 mt-1">
            <IoChatbubblesOutline className="size-7 text-foreground group-hover:text-primary transition-all" />
            <div className="flex items-center gap-1">
              <RenderTextAfterPending isPending={isPending}>
                <h1 className="text-foreground text-4xl">
                  <CountUp end={data?.chats || 0} duration={3} />
                </h1>
              </RenderTextAfterPending>
            </div>
          </div>
          <button className="w-fit group flex items-center gap-1 bg-transparent border-none outline-0 cursor-pointer">
            {!isPending && (
              <span className="text-[#144f48] text-sm">
                {data?.unreadChats || 0} chats unseen
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
const RenderTextAfterPending = ({
  children,
  isPending,
}: {
  children: ReactNode;
  isPending: boolean;
}) => {
  if (isPending) {
    return (
      <span className="flex items-center gap-2 text-neutral-600 text-base">
        Loading <LoaderIcon className="size-5 animate-spin" />
      </span>
    );
  }
  return <>{children}</>;
};
