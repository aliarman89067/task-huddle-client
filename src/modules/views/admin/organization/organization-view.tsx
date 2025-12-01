"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OrganizationStatusChart } from "./components/organization-status-chart";
import { OrganizationMemberList } from "./components/organization-member-list";
import { OrganizationChatList } from "./components/organization-chat-list";
import { OrganizationProjectList } from "./components/organization-project-list";
import OrganizationInfo from "@/components/organization-info";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAdminOrganization } from "@/lib/common-query";
import { LoadingScreen } from "@/components/loading-screen";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance";
import { useEffect, useState } from "react";
import { NoOrganization } from "@/constant";
import { EmptyOrganization } from "@/components/empty-organization";
import { ErrorCard } from "@/components/error-card";
import { useGetQueryError } from "@/hooks/use-get-query-error";
import { AxiosError } from "axios";

interface Props {
  id: string;
}

export const OrganizationView = ({ id }: Props) => {
  const [timeRange, setTimeRange] = useState<
    "week" | "1 month" | "3 month" | "7 month" | "year"
  >("week");
  const [chartType, setChartType] = useState<"projects" | "check-in">(
    "projects"
  );

  const router = useRouter();
  const {
    data: organizationData,
    isPending: isOrganizationPending,
    error: organizationError,
    isSuccess,
    refetch,
  } = useGetAdminOrganization({ id, isMember: true });

  // Queries
  const {
    data: projectData,
    isPending: isProjectPending,
    error: projectError,
  } = useQuery({
    queryKey: ["get-projects"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/projects/projects/${id}?recent=true`
      );
      return res.data;
    },
    retry: 1,
    refetchOnWindowFocus: !!id,
  });

  useEffect(() => {
    refetch();
  }, []);

  if (isOrganizationPending || isProjectPending) {
    return <LoadingScreen />;
  }

  if (organizationError && !isSuccess) {
    if (organizationError === NoOrganization) {
      return <EmptyOrganization />;
    } else {
      return <ErrorCard title="Oops!!" description={organizationError} />;
    }
  }

  if (projectError) {
    const { errorMessage } = useGetQueryError(
      projectError as AxiosError<{ message: string }>
    );
    return <ErrorCard title="Oops!!" description={errorMessage} />;
  }

  return (
    <section>
      <OrganizationInfo title={organizationData.name} />
      <div className="flex flex-col gap-5 mt-2">
        <div className="bg-[#212529] rounded-xl p-3">
          <div className="flex-1 bg-[#24292f] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <Select
                defaultValue="projects"
                value={chartType}
                onValueChange={(value) =>
                  setChartType(value as typeof chartType)
                }
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
                defaultValue="week"
                value={timeRange}
                onValueChange={(value) =>
                  setTimeRange(value as typeof timeRange)
                }
              >
                <SelectTrigger className="bg-[#343637] text-xs border-none text-white [&_svg:not([class*='text-'])]:text-white">
                  <SelectValue placeholder="Select Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Duration</SelectLabel>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="1 month">1 Month</SelectItem>
                    <SelectItem value="3 month">3 Month</SelectItem>
                    <SelectItem value="7 month">7 Month</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <OrganizationStatusChart
              chartType={chartType}
              timeRange={timeRange}
            />
            <Link
              href="/dashboard/organizations/project"
              className="text-sm text-neutral-300 underline underline-offset-4"
            >
              See All Details
            </Link>
          </div>
        </div>

        <div className="bg-[#212529] rounded-xl p-3">
          <div className="flex-1 bg-[#24292f] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-base">Projects</h3>
              <Button
                onClick={() =>
                  router.push(`/dashboard/organizations/${id}/create-project`)
                }
              >
                Assign Project
              </Button>
            </div>
            <OrganizationProjectList
              pendingProjects={projectData?.pendingProjects}
              organizationData={organizationData}
            />
            <div className="mt-2">
              <Link
                href="/dashboard/organizations/projects"
                className="text-sm text-neutral-300 underline underline-offset-4"
              >
                See All Projects
              </Link>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 min-h-[450px]">
          <div className="bg-[#212529] rounded-xl p-3 h-full">
            <div className="flex-1 bg-[#24292f] rounded-xl p-4 h-full">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-base">Chats</h3>
                <Link
                  href="/dashboard/chats"
                  className="text-sm text-neutral-300 underline underline-offset-4"
                >
                  See All Chats
                </Link>
              </div>
              <OrganizationChatList organizationId={id} />
            </div>
          </div>

          <div className="bg-[#212529] rounded-xl p-3 h-full">
            <div className="bg-[#24292f] rounded-xl p-4 h-full">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-base">Members</h3>
                <Link
                  href={`/dashboard/members`}
                  className="text-sm text-neutral-300 underline underline-offset-4"
                >
                  See All Members
                </Link>
              </div>
              <OrganizationMemberList organizationId={id} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
