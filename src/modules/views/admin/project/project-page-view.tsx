"use client";
import Image from "next/image";
import { LoadingScreen } from "@/components/loading-screen";
import OrganizationInfo from "@/components/organization-info";
import { ProgressBarAnimation } from "@/components/progress-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axios-instance";
import { useGetAdminOrganization } from "@/lib/common-query";
import { organizationStore } from "@/zustand/member.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircleIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { UpdateProjectDialog } from "@/components/dialogs/update-project-dialog";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ProjectOptionsHandler } from "../../../../components/project-option-handler";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

const colors = ["#FCF0E4", "#ECF5E7", "#EBF0FE", "#ECF5F4"];
export const ProjectPageView = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(undefined);

  const { selectedOrganizationId } = organizationStore();
  const queryClient = useQueryClient();

  const {
    data: organizationData,
    isPending: isOrganizationPending,
    error: organizationError,
  } = useGetAdminOrganization({ id: selectedOrganizationId!, isMember: true });

  const {
    data: projectData,
    isPending: isProjectPending,
    error: projectError,
  } = useQuery({
    queryKey: ["get-projects"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/projects/projects/${selectedOrganizationId}`
      );
      return res.data;
    },
    enabled: !!selectedOrganizationId,
  });

  const projectCompleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.put("/admin/projects/complete", { id });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-projects"],
      });
      toast.success("Project completed successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message || "Something went wrong!";
      toast.error(message);
    },
  });

  const projectReAssignMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.put("/admin/projects/re-assign", {
        projectIds: [id],
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-projects"],
      });
      toast.success("Project re assigned successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message || "Something went wrong!";
      toast.error(message);
    },
  });
  const projectDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.post("/admin/projects/delete", {
        projectIds: [id],
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-projects"],
      });
      toast.success("Project deleted successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message || "Something went wrong!";
      toast.error(message);
    },
  });

  const handleAddMemberRoute = () => {
    router.push(
      `/dashboard/organizations/${selectedOrganizationId}/create-project`
    );
  };

  if (!selectedOrganizationId) return;

  if (isOrganizationPending) {
    return <LoadingScreen />;
  }
  if (organizationError) {
    return <div>Something went wrong</div>;
  }
  console.log(projectData);
  return (
    <section className="flex flex-col gap-5">
      <UpdateProjectDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        project={selectedProject}
        setProject={setSelectedProject}
        members={organizationData.members}
      />
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <OrganizationInfo title={organizationData.name} />

          <Button onClick={handleAddMemberRoute}>
            Assign Project <PlusIcon />
          </Button>
        </div>
        <div className="flex flex-col gap-5 mt-3">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-16">
              <div className="flex flex-col gap-3">
                <h2 className="text text-neutral-700 font-semibold text-xl">
                  Recent Projects
                </h2>
                {projectData?.pendingProjects?.length > 0 ? (
                  <div className="grid grid-cols-3 gap-5">
                    {projectData?.pendingProjects?.map(
                      (project: any, index: number) => {
                        const color =
                          colors[Math.floor(Math.random() * colors.length)];
                        return (
                          <div
                            key={index}
                            style={{ backgroundColor: color }}
                            className="relative flex flex-col gap-3 w-full rounded-xl px-3 py-5 min-h-[250px]"
                          >
                            <ProjectOptionsHandler
                              isResign={false}
                              iconColor="dark"
                              onReAssign={() =>
                                projectReAssignMutation.mutate(project.id)
                              }
                              onDelete={() =>
                                projectDeleteMutation.mutate(project.id)
                              }
                            />
                            <div className="flex-1 flex flex-col gap-1">
                              <div className="flex gap-2 flex-wrap">
                                {project?.tags?.map(
                                  (tag: string, tagIndex: number) => (
                                    <Badge key={tagIndex}>{tag}</Badge>
                                  )
                                )}
                              </div>
                              <h2 className="text-neutral-800 font-medium text-lg line-clamp-1 mt-2">
                                {project.title}
                              </h2>
                              <p className="text-neutral-600 text-sm line-clamp-2">
                                {project?.description}
                              </p>
                            </div>
                            <ProgressBarAnimation
                              percentageNumber={project.percentage}
                              titleColor="#525252"
                              percentageColor="#262626"
                            />
                            <div className="flex items-center justify-between">
                              <div className="relative flex items-center">
                                {project?.members?.map(
                                  (member: any, memberIndex: number) => (
                                    <Tooltip
                                      key={memberIndex}
                                      delayDuration={0}
                                      disableHoverableContent
                                    >
                                      <TooltipTrigger
                                        asChild
                                        className={`-translate-x-[${
                                          memberIndex * 10
                                        }px]`}
                                      >
                                        <Avatar className="cursor-pointer">
                                          <AvatarImage
                                            src={member?.image}
                                            alt={`${member.name} image`}
                                          />
                                          <AvatarFallback className="bg-foreground text-white border-2 border-white">
                                            {member.name.substring(0, 1)}
                                          </AvatarFallback>
                                        </Avatar>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-white border border-neutral-200 text-neutral-800">
                                        <div className="flex items-center gap-1">
                                          <Avatar className="w-9 h-9">
                                            <AvatarImage
                                              src={member?.image}
                                              alt={`${member.name} image`}
                                            />
                                            <AvatarFallback className="bg-foreground text-white border-2 border-white text-base">
                                              {member.name.substring(0, 1)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex flex-col">
                                            <h3 className="text-neutral-800 text-sm">
                                              {member.name}
                                            </h3>
                                            <p className="text-neutral-600 text-xs">
                                              {member.email}
                                            </p>
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  )
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircleIcon className="text-neutral-600 size-6" />
                                <span className="text-neutral-600 text-sm font-semibold">
                                  5
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                onClick={() =>
                                  projectCompleteMutation.mutate(project.id)
                                }
                                type="button"
                                className="flex-1"
                              >
                                Mark as Completed
                              </Button>
                              <Button
                                type="button"
                                onClick={() => {
                                  setSelectedProject(project);
                                  setIsOpen(true);
                                }}
                                className="flex-1 bg-foreground text-white hover:bg-foreground/90"
                              >
                                Update
                              </Button>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <NotFound
                    title="You have no Pending projects."
                    description="When you assign new project they will appear here you'll be able to review details, see members involved, and track progress history."
                  />
                )}
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="text text-neutral-700 font-semibold text-xl">
                  Completed Projects
                </h2>
                {projectData?.completedProjects?.length > 0 ? (
                  <div className="grid grid-cols-3 gap-5">
                    {projectData?.completedProjects?.map(
                      (project: any, index: number) => {
                        return (
                          <div
                            key={index}
                            className="relative flex flex-col gap-3 w-full bg-neutral-800 rounded-xl px-3 py-5 min-h-[250px]"
                          >
                            <ProjectOptionsHandler
                              iconColor="light"
                              onReAssign={() =>
                                projectReAssignMutation.mutate(project.id)
                              }
                              onDelete={() =>
                                projectDeleteMutation.mutate(project.id)
                              }
                            />
                            <div className="flex-1 flex flex-col gap-1">
                              <div className="flex gap-2 flex-wrap">
                                {project?.tags?.map(
                                  (tag: string, tagIndex: number) => (
                                    <Badge key={tagIndex} variant="secondary">
                                      {tag}
                                    </Badge>
                                  )
                                )}
                              </div>
                              <h2 className="text-white font-medium text-lg line-clamp-1 mt-2">
                                {project.title}
                              </h2>
                              <p className="text-neutral-300 text-sm line-clamp-2">
                                {project?.description}
                              </p>
                            </div>
                            <ProgressBarAnimation
                              percentageNumber={project.percentage}
                              titleColor="#ffffff"
                              percentageColor="#d4d4d4"
                            />
                            <div className="flex items-center justify-between">
                              <div className="relative flex items-center">
                                {project?.members?.map(
                                  (member: any, memberIndex: number) => (
                                    <Tooltip
                                      key={memberIndex}
                                      delayDuration={0}
                                      disableHoverableContent
                                    >
                                      <TooltipTrigger asChild>
                                        <Avatar className="cursor-pointer">
                                          <AvatarImage
                                            src={member?.image}
                                            alt={`${member.name} image`}
                                          />
                                          <AvatarFallback className="bg-foreground text-white border-2 border-white">
                                            {member.name.substring(0, 1)}
                                          </AvatarFallback>
                                        </Avatar>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-white border border-neutral-200 text-neutral-800">
                                        <div className="flex items-center gap-1">
                                          <Avatar className="w-9 h-9">
                                            <AvatarImage
                                              src={member?.image}
                                              alt={`${member.name} image`}
                                            />
                                            <AvatarFallback className="bg-foreground text-white border-2 border-white text-base">
                                              {member.name.substring(0, 1)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex flex-col">
                                            <h3 className="text-neutral-800 text-sm">
                                              {member.name}
                                            </h3>
                                            <p className="text-neutral-600 text-xs">
                                              {member.email}
                                            </p>
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  )
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircleIcon className="text-neutral-300 size-6" />
                                <span className="text-neutral-300 text-sm font-semibold">
                                  5
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                className="flex-1"
                                variant="secondary"
                                disabled
                              >
                                Completed
                              </Button>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <NotFound
                    title="You have no completed projects."
                    description="When you mark projects as completed they will appear here you'll be able to review details, see members involved, and track progress history."
                  />
                )}
              </div>
            </div>
          </div>
          {/* <div className="w-full min-h-32 px-6 py-4 rounded-xl bg-[#212529]">
            <div className="flex items-center justify-between">
              <Select defaultValue="week">
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
            <MemberStatusChart
              title="9 projects completed out of 10"
              description="90% projects completed this week."
              chartData={chartData}
              chartConfig={chartConfig}
              dataKey1="Assigned"
              dataKey2="Completed"
            />
          </div> */}
        </div>
      </div>
    </section>
  );
};

const NotFound = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <Image
        src="/images/not_found.png"
        alt="not Found image"
        width={250}
        height={250}
        className="object-contain"
      />
      <h1 className="text-neutral-700 font-bold text-2xl">{title}</h1>
      <p className="text-neutral-500 text-base text-center max-w-xl">
        {description}
      </p>
    </div>
  );
};
