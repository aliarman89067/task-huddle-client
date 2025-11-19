"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ADMIN_SIDEBAR_LINKS } from "@/constant";
import { axiosInstance } from "@/lib/axios-instance";
import { cn } from "@/lib/utils";
import { userStore } from "@/zustand/user.store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  LogOutIcon,
  PanelLeftCloseIcon,
  PanelRightCloseIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { toast } from "sonner";
import { OrganizationButton } from "./organization-button";
import { organizationStore } from "@/zustand/member.store";
import { SettingsButton } from "./settings-button";

export const AdminSidebar = () => {
  const router = useRouter();
  const { selectedOrganizationId, setOrganizationId } = organizationStore();
  const pathname = usePathname();
  const { user, logoutUser } = userStore();
  const [isExpand, setIsExpand] = useState(false);
  const [isOrganizationOpen, setIsOrganizationOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Queries
  const { data: organizationData, isPending: isOrganizationPending } = useQuery(
    {
      queryKey: ["get-organizations"],
      queryFn: async () => {
        const response = await axiosInstance.get(`/admin/organizations`);
        const organizationId = response.data.organizations[0].id;
        if (!selectedOrganizationId) {
          setOrganizationId(organizationId);
        }
        return response.data.organizations;
      },
      enabled: !!user,
      refetchOnWindowFocus: false,
    }
  );
  // Mutations

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post("/auth/logout");
      return response.data;
    },
    onSuccess: () => {
      logoutUser();
      router.push("/");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data.message ||
        "Something went wrong. Please try again.";
      toast.error(message);
    },
  });

  if (!user || user.role !== "admin") {
    return;
  }

  return (
    <div
      className={cn(
        "bg-foreground rounded-r-2xl flex shrink-0 flex-col gap-3 py-6 h-screen sticky top-0 left-0 overflow-y-scroll transition-all duration-200 sidebar-scrollbar",
        isExpand ? "w-[70px] px-2.5" : "w-[250px] px-4"
      )}
    >
      <div
        className={cn(
          "flex items-center",
          isExpand ? "justify-center" : "justify-between"
        )}
      >
        <HideOnExpand isExpand={isExpand}>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-white.svg"
              alt="Logo"
              width={25}
              height={25}
              className="object-contain"
            />
            <span className="text-white font-semibold text-lg">Taskery</span>
          </Link>
        </HideOnExpand>
        <button
          onClick={() => setIsExpand(!isExpand)}
          className="bg-primary rounded-md w-8 h-8 flex items-center justify-center cursor-pointer"
        >
          {isExpand ? (
            <PanelRightCloseIcon className="text-white size-5" />
          ) : (
            <PanelLeftCloseIcon className="text-white size-5" />
          )}
        </button>
      </div>
      <Separator className="bg-neutral-800 my-2" />
      <div className="flex flex-col gap-4">
        <div
          className={cn(
            "flex items-center gap-2",
            isExpand ? "justify-center" : "justify-start"
          )}
        >
          <Avatar className={cn("w-10 h-10")}>
            <AvatarImage src={user.image || ""} alt="User Profile Image" />
            <AvatarFallback className="rounded-md!">
              {user.name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <HideOnExpand isExpand={isExpand}>
            <div className="flex flex-col">
              <h3 className="text-white font-medium text-base">{user.name}</h3>
              <span className="text-gray-300 text-xs">{user.email}</span>
            </div>
          </HideOnExpand>
        </div>
      </div>
      <Separator className="bg-neutral-800 my-2" />
      <div className="flex flex-col gap-4">
        {ADMIN_SIDEBAR_LINKS.map((item) => {
          const isDropdown = item.isDropdown;
          if (isDropdown && item.label === "Organizations") {
            return (
              <OrganizationButton
                setIsOrganizationOpen={setIsOrganizationOpen}
                isOrganizationOpen={isOrganizationOpen}
                Icon={item.icon}
                HideOnExpand={HideOnExpand}
                isExpand={isExpand}
                label={item.label}
                isOrganizationPending={isOrganizationPending}
                organizationData={organizationData}
              />
            );
          }
          if (isDropdown && item.label === "Settings") {
            return (
              <SettingsButton
                isSettingsOpen={isSettingsOpen}
                setIsSettingsOpen={setIsSettingsOpen}
                Icon={item.icon}
                HideOnExpand={HideOnExpand}
                isExpand={isExpand}
                label={item.label}
              />
            );
          }
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "w-full py-2.5 px-4 rounded-md text-sm flex items-center gap-2",
                item.href === pathname
                  ? "bg-primary text-white"
                  : "bg-transparent text-gray-200 hover:bg-white/10 transition-all"
              )}
            >
              <item.icon className="size-4" />
              <HideOnExpand isExpand={isExpand}>{item.label}</HideOnExpand>
            </Link>
          );
        })}
      </div>
      <Button
        onClick={() => logoutMutation.mutate()}
        className="mt-auto w-fit bg-rose-400 hover:bg-rose-500"
      >
        <LogOutIcon className="size-4 text-white" />
      </Button>
    </div>
  );
};

interface HideOnExpandProps {
  isExpand: boolean;
  children: ReactNode;
}

const HideOnExpand = ({ isExpand, children }: HideOnExpandProps) => {
  return (
    <div
      className={cn(
        "transition-all duration-150",
        isExpand ? "hidden" : "block"
      )}
    >
      {children}
    </div>
  );
};
