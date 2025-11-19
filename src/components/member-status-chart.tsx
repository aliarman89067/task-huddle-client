"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartDataItem {
  month: string;
  [key: string]: string | number;
}
interface Props {
  chartData: ChartDataItem[];
  chartConfig: ChartConfig;
  dataKey1: string;
  dataKey2: string;
  title: string;
  description: string;
}

export const MemberStatusChart = ({
  chartConfig,
  chartData,
  dataKey1,
  dataKey2,
  title,
  description,
}: Props) => {
  return (
    <Card className="bg-transparent border-transparent">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        <CardDescription className="text-neutral-300">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-40 w-full" config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey={dataKey1} fill="var(--color-desktop)" radius={4} />
            <Bar dataKey={dataKey2} fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
