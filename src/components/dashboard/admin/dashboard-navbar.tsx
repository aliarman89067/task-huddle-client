"use client";
import { UserButton } from "@/components/user-button";
import {
  BellIcon,
  CloudIcon,
  CloudyIcon,
  MessageCircleIcon,
  MoonIcon,
  SunDimIcon,
  SunIcon,
} from "lucide-react";
import { useState } from "react";

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12)
    return { greeting: "Good Morning", icon: SunIcon };
  if (hour >= 12 && hour < 17)
    return { greeting: "Good Afternoon", icon: SunDimIcon };
  if (hour >= 17 && hour < 21)
    return { greeting: "Good Evening", icon: CloudyIcon };
  return { greeting: "Good Night", icon: MoonIcon };
}

export const DashboardNavbar = () => {
  const [timeOfDay] = useState(getTimeOfDay());

  return (
    <div className="flex items-center justify-between pr-5 py-2 border-b border-neutral-200">
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <h1 className="text-2xl font-semibold text-neutral-600 font-sansitia">
            {timeOfDay.greeting}
          </h1>
          <timeOfDay.icon className="size-6 text-neutral-600" />
        </div>
        <span className="text-base text-neutral-500">Ali arman</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex gap-3 items-center">
          <button className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center cursor-pointer">
            <MessageCircleIcon className="text-neutral-700 size-4" />
          </button>
          <button className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center cursor-pointer">
            <BellIcon className="text-neutral-700 size-4" />
          </button>
        </div>
        <UserButton isName isPrivate />
      </div>
    </div>
  );
};
