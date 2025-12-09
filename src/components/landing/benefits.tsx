import {
  BadgePlusIcon,
  ClockIcon,
  ListTodoIcon,
  MessageCircleIcon,
  ShieldIcon,
  UserPlusIcon,
} from "lucide-react";
import { MaxWidthWrapper } from "./max-width-wrapper";
import { CTAButton } from "../cta-button";
import { useRouter } from "next/navigation";
import { userStore } from "@/zustand/user.store";

export const Benefits = () => {
  const router = useRouter();
  const { user } = userStore();

  const data = [
    {
      iconColor: "#a7c957",
      icon: BadgePlusIcon,
      point: "Create and manage multiple organizations for different brands.",
    },
    {
      iconColor: "#00afb9",
      icon: UserPlusIcon,
      point: "Add team members quickly and organize them effortlessly.",
    },
    {
      iconColor: "#8338ec",
      icon: ListTodoIcon,
      point:
        "Assign projects, set deadlines, and track real-time progress updates.",
    },
    {
      iconColor: "#f07167",
      icon: ClockIcon,
      point:
        "Seamless check-in/check-out with complete history for admins and personal logs for members.",
    },
    {
      iconColor: "#00b4d8",
      icon: MessageCircleIcon,
      point: "Real-time chat with group creation and member management.",
    },
    {
      iconColor: "#3d405b",
      icon: ShieldIcon,
      point:
        "Restrict access using specific IPs or geo-radius for secure, location-based attendance and usage.",
    },
  ];

  return (
    <MaxWidthWrapper className="mt-10 flex flex-col items-center gap-5">
      <div className="grid grid-cols-[1.5fr_1fr] gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="font-sansitia text-neutral-800 text-4xl font-bold">
            Benefits of Using Taskhuddle
          </h1>
          <div className="flex flex-col gap-3">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 text-neutral-700 text-base"
              >
                <item.icon color={item.iconColor} className="size-5" />
                <span>{item.point}</span>
              </div>
            ))}
          </div>
          <CTAButton
            onClick={() => {
              router.push(user ? "/dashboard" : "/login");
            }}
            title="Get Started"
            classNames="w-[350px] mt-6"
          />
        </div>
        <div className="w-full h-full">
          <img
            src="/images/abtract1.png"
            alt="Abstract Shape"
            className="w-full object-contain"
          />
        </div>
      </div>
    </MaxWidthWrapper>
  );
};
