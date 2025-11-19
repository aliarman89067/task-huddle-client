"use client";

import { TrendingUp } from "lucide-react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

interface Props {
  isTitle?: boolean;
  obtainNumber: number;
  totalNumber: number;
  label?: string;
  description?: string;
}

export const description = "A radial chart showing percentage";

// Function to calculate percentage
const calculatePercentage = (obtain: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((obtain / total) * 100);
};

const chartConfig = {
  percentage: {
    label: "Percentage",
  },
  progress: {
    label: "Progress",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function RadialStatusChart({
  isTitle = false,
  obtainNumber,
  totalNumber,
  label = "Progress",
  description = "Current progress",
}: Props) {
  const percentage = calculatePercentage(obtainNumber, totalNumber);

  const chartData = [
    {
      progress: "complete",
      percentage: percentage,
      fill: "var(--color-primary)",
    },
  ];

  return (
    <Card className="flex flex-col bg-transparent border-none shadow-none">
      {isTitle && (
        <CardHeader className="items-center pb-0">
          <CardTitle>Progress Chart</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      )}
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[180px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={percentage * 3.6}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-white/10 last:fill-[#24292f]"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="percentage" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-white text-4xl font-bold"
                        >
                          {percentage}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {label}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
