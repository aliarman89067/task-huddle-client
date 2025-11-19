"use client";

import * as React from "react";

import { Progress } from "@/components/ui/progress";

export function ProgressBarAnimation({
  percentageNumber,
  titleColor = "#d4d4d4",
  percentageColor = "#ffffff",
}: {
  percentageNumber: number;
  titleColor?: string;
  percentageColor?: string;
}) {
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(percentageNumber), 500);
    return () => clearTimeout(timer);
  }, [percentageNumber]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span style={{ color: titleColor }} className="text-sm">
          Progress
        </span>
        <span
          style={{ color: percentageColor }}
          className="font-semibold text-sm"
        >
          {percentageNumber}%
        </span>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  );
}
