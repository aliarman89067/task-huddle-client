import { ArrowRightIcon } from "lucide-react";
import { TbUsers } from "react-icons/tb";
import { LuPuzzle } from "react-icons/lu";
import { MdAccessAlarms } from "react-icons/md";
import { IoChatbubblesOutline } from "react-icons/io5";
import CountUp from "react-countup";
import { MemberStatusChart } from "../../member-status-chart";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartConfig } from "@/components/ui/chart";
import OrganizationInfo from "@/components/organization-info";
import { organizationStore } from "@/zustand/member.store";
import { useGetAdminOrganization } from "@/lib/common-query";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ResponseType = {
  members: number;
  pendingMembers: number;
  projects: number;
  pendingProjects: number;
  checks: number;
  checkInLate: number;
  checkInOnTime: number;
  chats: number;
  unreadChats: number;
};

let chartData: {
  month: string;
  Assigned?: number;
  Completed?: number;
  Late?: number;
  OnTime?: number;
}[] = [];

export const OrganizationsGrid = () => {
  const router = useRouter();
  const [duration, setDuration] = useState<"3 months" | "7 months" | "year">(
    "3 months"
  );
  const [chartType, setChartType] = useState<"projects" | "check-in">(
    "projects"
  );
  const { selectedOrganizationId } = organizationStore();
  const { data: organizationData } = useGetAdminOrganization({
    id: selectedOrganizationId!,
  });

  const {
    data: statesData,
    isPending: isStatesPending,
    error: isStatesError,
  } = useQuery({
    queryKey: ["get-admin-states"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/organizations/states/${selectedOrganizationId}`
      );
      return res.data as ResponseType;
    },
  });
  const { data, refetch: chartRefetch } = useQuery({
    queryKey: ["get-admin-analytics"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/${
          chartType === "check-in" ? "checks" : "projects"
        }/monthly-analytics/${selectedOrganizationId}?duration=${duration}`
      );
      return res.data as {
        assigned?: number;
        completed?: number;
        late?: number;
        onTime?: number;
        month: string;
      }[];
    },
  });

  useEffect(() => {
    chartRefetch();
  }, [chartType, duration]);

  if (chartType === "projects") {
    const filteredData =
      data?.map((project) => ({
        Assigned: project.assigned,
        Completed: project.completed,
        month: project.month,
      })) || [];
    chartData = filteredData;
  }
  if (chartType === "check-in") {
    const filteredData =
      data?.map((check) => ({
        Late: check.late,
        OnTime: check.onTime,
        month: check.month,
      })) || [];
    chartData = filteredData;
  }

  const chartConfig = {
    desktop: {
      label: chartType === "projects" ? "Assigned" : "Late",
      color: "var(--chart-2)",
    },
    mobile: {
      label: chartType === "projects" ? "Completed" : "OnTime",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  let assignedProject = chartData.reduce(
    (total, item) => (item.Assigned || 0) + total,
    0
  );
  let completedProject = chartData.reduce(
    (total, item) => (item.Completed || 0) + total,
    0
  );

  let onTime = chartData.reduce((total, item) => (item.OnTime || 0) + total, 0);
  let late = chartData.reduce((total, item) => (item.Late || 0) + total, 0);

  const message =
    chartType === "projects"
      ? `${completedProject} project${
          completedProject > 1 ? "s" : ""
        } completed out of ${assignedProject}`
      : `${onTime} Check In on Time and ${late} Late${late > 1 ? "s" : ""}`;

  const percentage =
    chartType === "projects"
      ? `${Math.floor((completedProject / assignedProject) * 100) || 0}%` +
        ` Project completed.`
      : `${Math.floor((onTime / (late + onTime)) * 100) || 0}%` +
        ` Check In is on Time.`;

  return (
    <div className="flex flex-col gap-4 w-full">
      <OrganizationInfo title={organizationData?.name} />
      <div className="grid grid-cols-[1fr_1.1fr] gap-5 w-full">
        <div className="w-full grid grid-cols-2 gap-2">
          {/* Members Box */}
          <div className="group min-h-36 group relative rounded-xl bg-[#FCF0E4] px-3 py-4 flex flex-col gap-2 hover:shadow-sm transition-all">
            <button
              onClick={() => router.push("/dashboard/members")}
              className="cursor-pointer absolute top-4 right-4 z-1 w-12 h-12 bg-white rounded-full border border-neutral-100 flex items-center justify-center"
            >
              <ArrowRightIcon className="-rotate-45 size-3 text-foreground group-hover:-translate-y-[2px] group-hover:translate-x-[2px] transition-all duration-300 ease-in-out" />
            </button>
            <span className="text-foreground text-base font-medium">
              Members
            </span>
            <div className="flex items-center gap-2 mt-1">
              <TbUsers className="size-7 text-foreground group-hover:text-primary transition-all" />
              <h1 className="text-foreground text-4xl">
                <CountUp end={statesData?.members || 0} duration={3} />
              </h1>
            </div>
            <button className="w-fit group flex items-center gap-1 bg-transparent border-none outline-0 cursor-pointer">
              <span className="text-[#cb7a28] text-sm">
                {statesData?.pendingMembers || 0} members is pending
              </span>
            </button>
          </div>
          {/* Projects Box */}
          <div className="min-h-36 group relative rounded-xl bg-[#ECF5E7] px-3 py-4 flex flex-col gap-2 hover:shadow-sm transition-all">
            <button
              onClick={() => router.push("/dashboard/projects")}
              className="cursor-pointer absolute top-4 right-4 z-1 w-12 h-12 bg-white rounded-full border border-neutral-100 flex items-center justify-center"
            >
              <ArrowRightIcon className="-rotate-45 size-3 text-foreground group-hover:-translate-y-[2px] group-hover:translate-x-[2px] transition-all duration-300 ease-in-out" />
            </button>
            <span className="text-foreground text-base font-medium">
              Projects
            </span>
            <div className="flex items-center gap-2 mt-1">
              <LuPuzzle className="size-7 text-foreground group-hover:text-primary transition-all" />
              <h1 className="text-foreground text-4xl">
                <CountUp end={statesData?.projects || 0} duration={3} />
              </h1>
            </div>
            <button className="w-fit group flex items-center gap-1 bg-transparent border-none outline-0 cursor-pointer">
              <span className="text-[#3d6f22] text-sm">
                {statesData?.pendingProjects || 0} projects is pending
              </span>
            </button>
          </div>
          {/* Check In Box */}
          <div className="min-h-36 group relative rounded-xl bg-[#EBF0FE] px-3 py-4 flex flex-col gap-2 hover:shadow-sm transition-all">
            <button
              onClick={() => router.push("/dashboard/check-in-out")}
              className="cursor-pointer absolute top-4 right-4 z-1 w-12 h-12 bg-white rounded-full border border-neutral-100 flex items-center justify-center"
            >
              <ArrowRightIcon className="-rotate-45 size-3 text-foreground group-hover:-translate-y-[2px] group-hover:translate-x-[2px] transition-all duration-300 ease-in-out" />
            </button>
            <span className="text-foreground text-base font-medium">
              Check In
            </span>
            <div className="flex items-center gap-2 mt-1">
              <MdAccessAlarms className="size-7 text-foreground group-hover:text-primary transition-all" />
              <h1 className="text-foreground text-4xl">
                <CountUp end={statesData?.checks || 0} duration={3} />
              </h1>
            </div>
            <button className="w-fit group flex items-center gap-1 bg-transparent border-none outline-0 cursor-pointer">
              <span className="text-[#192852] text-sm text-left">
                {statesData?.checkInOnTime || 0} members checked in on time,{" "}
                {statesData?.checkInLate || 0} members not
              </span>
            </button>
          </div>
          {/* Chats Box */}
          <div className="min-h-36 group relative rounded-xl bg-[#ECF5F4] px-3 py-4 flex flex-col gap-2 hover:shadow-sm transition-all">
            <button
              onClick={() => router.push("/dashboard/chats")}
              className="cursor-pointer absolute top-4 right-4 z-1 w-12 h-12 bg-white rounded-full border border-neutral-100 flex items-center justify-center"
            >
              <ArrowRightIcon className="-rotate-45 size-3 text-foreground group-hover:-translate-y-[2px] group-hover:translate-x-[2px] transition-all duration-300 ease-in-out" />
            </button>
            <span className="text-foreground text-base font-medium">Chats</span>
            <div className="flex items-center gap-2 mt-1">
              <IoChatbubblesOutline className="size-7 text-foreground group-hover:text-primary transition-all" />
              <h1 className="text-foreground text-4xl">
                <CountUp end={statesData?.chats || 0} duration={3} />
              </h1>
            </div>
            <button className="w-fit group flex items-center gap-1 bg-transparent border-none outline-0 cursor-pointer">
              <span className="text-[#144f48] text-sm text-left">
                {statesData?.unreadChats || 0} chats unseen
              </span>
            </button>
          </div>
        </div>
        <div className="w-full min-h-32 px-6 py-4 rounded-xl bg-[#212529]">
          <div className="flex items-center justify-between">
            <Select
              value={chartType}
              onValueChange={(value) => setChartType(value as typeof chartType)}
            >
              <SelectTrigger className="bg-[#343637] text-xs border-none text-white [&_svg:not([class*='text-'])]:text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Category</SelectLabel>
                  <SelectItem value="projects">Projects</SelectItem>
                  <SelectItem value="check-in">Check In</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={duration}
              onValueChange={(value) => setDuration(value as typeof duration)}
            >
              <SelectTrigger className="bg-[#343637] text-xs border-none text-white [&_svg:not([class*='text-'])]:text-white">
                <SelectValue placeholder="Select Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Duration</SelectLabel>
                  <SelectItem value="3 months">3 Months</SelectItem>
                  <SelectItem value="7 months">7 Months</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <MemberStatusChart
            title={message}
            description={percentage}
            chartData={chartData}
            chartConfig={chartConfig}
            dataKey1={chartType === "projects" ? "Assigned" : "Late"}
            dataKey2={chartType === "projects" ? "Completed" : "OnTime"}
          />
        </div>
      </div>
    </div>
  );
};
