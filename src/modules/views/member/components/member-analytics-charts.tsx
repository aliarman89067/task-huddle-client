import { MemberStatusChart } from "@/components/member-status-chart";
import { RadialStatusChart } from "@/components/radial-status-chart";
import { ChartConfig } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarCheck2,
  ClockIcon,
  ListTodoIcon,
  SquareChartGanttIcon,
} from "lucide-react";
import { MemberTaskList } from "./member-task-list";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance";
import { useEffect, useState } from "react";
import { number } from "zod";
import { useRouter } from "next/navigation";

interface Props {
  organizationId: string;
}

let chartData: {
  month: string;
  onTime: number;
  late: number;
}[] = [];

export const MemberAnalyticsCharts = ({ organizationId }: Props) => {
  const router = useRouter();

  const [projectsDuration, setProjectsDuration] = useState<
    "week" | "month" | "year"
  >("week");
  const [attendanceDuration, setAttendanceDuration] = useState<
    "week" | "month" | "year"
  >("week");

  const {
    data: projectData,
    refetch: projectRefetch,
    isPending: projectPending,
  } = useQuery({
    queryKey: ["member-project-analytics"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/member/project/project-analytics/${organizationId}?duration=${projectsDuration}`
      );
      return res.data;
    },
  });

  const {
    data: attendanceData,
    refetch: attendanceRefetch,
    isPending: attendancePending,
  } = useQuery({
    queryKey: ["member-attendance-analytics"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/member/check/attendance-analytics/${organizationId}?duration=${attendanceDuration}`
      );
      return res.data;
    },
  });
  const {
    data: checksData,
    refetch: checksRefetch,
    isPending: checksPending,
  } = useQuery({
    queryKey: ["member-checks-analytics"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/member/check/check-analytics/${organizationId}`
      );
      return res.data as { month: string; onTime: number; late: number }[];
    },
  });

  useEffect(() => {
    projectRefetch();
  }, [projectsDuration]);

  useEffect(() => {
    attendanceRefetch();
  }, [attendanceDuration]);

  useEffect(() => {
    checksRefetch();
  }, [router]);

  if (checksData) {
    chartData = checksData;
  }
  const chartConfig = {
    desktop: {
      label: "Late",
      color: "var(--chart-1)",
    },
    mobile: {
      label: "OnTime",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-neutral-700 text-xl font-medium font-sansitia mb-2">
        Analytics
      </h3>
      <div className="grid grid-cols-[2fr_1fr] w-full gap-5 h-full">
        <div className="flex flex-col w-full gap-5">
          <div className="grid grid-cols-2 gap-5 w-full">
            <div className="w-full bg-[#212529] p-2 rounded-xl">
              <div className="w-full h-full bg-[#24292f] rounded-xl flex flex-col gap-2 px-4 py-2.5">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <h2 className="text-white font-semibold text-base">
                        Projects
                      </h2>
                      <SquareChartGanttIcon className="size-4 text-white" />
                    </div>
                    <Select
                      defaultValue="week"
                      onValueChange={(value) =>
                        setProjectsDuration(value as typeof projectsDuration)
                      }
                    >
                      <SelectTrigger className="bg-[#343637] text-xs border-none text-white [&_svg:not([class*='text-'])]:text-white">
                        <SelectValue placeholder="Select Duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Duration</SelectLabel>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="year">Year</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <RadialStatusChart
                    obtainNumber={projectData?.obtainNumber || 0}
                    totalNumber={projectData?.totalNumber || 0}
                    label="Complete"
                  />
                  <span className="text-neutral-100 text-center mb-3">
                    {projectPending ? (
                      <>Loading...</>
                    ) : (
                      <>
                        {projectData?.obtainNumber} Projects completed out of{" "}
                        {projectData?.totalNumber}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full bg-[#212529] p-2 rounded-xl">
              <div className="w-full h-full bg-[#24292f] rounded-xl flex flex-col gap-2 px-4 py-2.5">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <h2 className="text-white font-semibold text-base">
                        Attendance
                      </h2>
                      <CalendarCheck2 className="size-4 text-white" />
                    </div>
                    <Select
                      defaultValue="week"
                      onValueChange={(value) =>
                        setAttendanceDuration(
                          value as typeof attendanceDuration
                        )
                      }
                    >
                      <SelectTrigger className="bg-[#343637] text-xs border-none text-white [&_svg:not([class*='text-'])]:text-white">
                        <SelectValue placeholder="Select Duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Duration</SelectLabel>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="year">Year</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <RadialStatusChart
                    obtainNumber={attendanceData?.obtainNumber || 0}
                    totalNumber={attendanceData?.totalNumber || 0}
                    label="Complete"
                  />
                  <span className="text-neutral-100 text-center mb-3">
                    {attendancePending ? (
                      <>Loading...</>
                    ) : (
                      <>
                        Present for {attendanceData?.obtainNumber} of{" "}
                        {attendanceData?.totalNumber} office days
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full bg-[#212529] p-2 rounded-xl">
            <div className="w-full h-full bg-[#24292f] rounded-xl flex flex-col gap-2 px-4 py-2.5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <h2 className="text-white font-semibold text-base">
                      Check In/Out
                    </h2>
                    <ClockIcon className="size-4 text-white" />
                  </div>
                </div>
                <MemberStatusChart
                  title=""
                  description=""
                  chartData={chartData}
                  chartConfig={chartConfig}
                  dataKey1="OnTime"
                  dataKey2="Late"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full bg-[#212529] p-2 rounded-xl max-h-full">
          <div className="w-full h-full bg-[#24292f] rounded-xl flex flex-col gap-2 px-4 py-2.5">
            <MemberTaskList organizationId={organizationId} />
          </div>
        </div>
      </div>
    </div>
  );
};
