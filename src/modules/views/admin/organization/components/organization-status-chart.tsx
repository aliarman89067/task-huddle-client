"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Area, AreaChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance";
import { organizationStore } from "@/zustand/member.store";

let chartData: any = [];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface Props {
  timeRange: "week" | "1 month" | "3 month" | "7 month" | "year";
  chartType: "projects" | "check-in";
}

export function OrganizationStatusChart({ timeRange, chartType }: Props) {
  const [state, setState] = useState({
    total: 0,
    success: 0,
  });
  const [filteredData, setFilteredData] = useState<any>(null);
  const { selectedOrganizationId } = organizationStore();
  // Queries
  const {
    data: projectsData,
    isPending: projectsPending,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ["get-members-chart-data"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/projects/analytics-project/${selectedOrganizationId}?duration=${timeRange}`
      );
      return res.data;
    },
    enabled: chartType === "projects",
  });
  const {
    data: checkInData,
    isPending: checkInPending,
    refetch: refetchCheckIn,
  } = useQuery({
    queryKey: ["get-members-chart-data"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/checks/analytics-checkin/${selectedOrganizationId}?duration=${timeRange}`
      );
      return res.data;
    },
    enabled: chartType === "check-in",
  });

  console.log(projectsData);

  useEffect(() => {
    if (chartType === "check-in") {
      refetchCheckIn();
    } else {
      refetchProjects();
    }
  }, [timeRange, chartType]);

  useEffect(() => {
    const filteredData = chartData?.filter(() => {
      const date = new Date();
      const referenceDate = new Date();
      let daysToSubtract = 90;
      if (timeRange === "year") {
        daysToSubtract = 365;
      } else if (timeRange === "1 month") {
        daysToSubtract = 30;
      } else if (timeRange === "3 month") {
        daysToSubtract = 90;
      } else if (timeRange === "7 month") {
        daysToSubtract = 210;
      } else if (timeRange === "week") {
        daysToSubtract = 7;
      }
      const startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - daysToSubtract);
      return date >= startDate;
    });
    setFilteredData(filteredData);
    let total = 0;
    let success = 0;
    if (chartType === "projects") {
      total = filteredData.reduce(
        (total: number, item: { assigned: number; completed: number }) =>
          item.assigned + total,
        0
      );
      success = filteredData.reduce(
        (total: number, item: { assigned: number; completed: number }) =>
          item.completed + total,
        0
      );
    } else {
      total = filteredData.reduce(
        (total: number, item: { onTime: number; late: number }) =>
          item.late + total,
        0
      );
      success = filteredData.reduce(
        (total: number, item: { onTime: number; late: number }) =>
          item.onTime + total,
        0
      );
    }
    console.log("total ", total);
    console.log("success ", success);
    setState({
      total,
      success,
    });
  }, [projectsData, checkInData, chartType]);

  if (!projectsPending && projectsData && chartType === "projects") {
    const formattedDataForChart = projectsData.map((item: any) => ({
      date: item.date,
      assigned: item.assigned,
      completed: item.completed,
    }));
    chartData = formattedDataForChart;
  }
  if (!checkInPending && checkInData && chartType === "check-in") {
    const formattedDataForChart = checkInData.map((item: any) => ({
      date: item.date,
      onTime: item.onTime,
      late: item.late,
    }));
    chartData = formattedDataForChart;
  }

  return (
    <Card className="pt-0 bg-transparent border-none shadow-none">
      <CardHeader className="flex items-center gap-2 space-y-0 py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-white">
            {!isNaN(state.total) && !isNaN(state.success) ? (
              <>
                {chartType === "projects" ? (
                  <>
                    {state.success} projects completed out of {state.total}
                  </>
                ) : (
                  <>
                    {state.success} On Time and {state.total} Late
                  </>
                )}
              </>
            ) : (
              <span>Loading...</span>
            )}
          </CardTitle>
          <CardDescription className="text-neutral-300">
            {!isNaN(state.total) && !isNaN(state.success) && (
              <>
                {chartType === "projects" ? (
                  <>
                    {state.total === 0 && state.success === 0 ? (
                      <>0% projects completed this {timeRange}.</>
                    ) : (
                      <>
                        {Math.min(
                          Math.floor((state.success / state.total) * 100),
                          100
                        )}
                        % projects completed this {timeRange}.
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {state.total === 0 && state.success === 0 ? (
                      <>0% Check In On Time this {timeRange}.</>
                    ) : (
                      <>
                        {Math.min(
                          Math.floor((state.success / state.total) * 100),
                          100
                        )}
                        % Check In On Time this {timeRange}.
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6">
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--primary)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            {/* <CartesianGrid vertical={false} /> */}
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey={chartType === "projects" ? "assigned" : "onTime"}
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey={chartType === "projects" ? "completed" : "late"}
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
            {/* <ChartLegend content={<ChartLegendContent />} /> */}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
