"use client";
import Link from "next/link";
import { ProgressBarAnimation } from "@/components/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircleIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { UpdateProjectDialog } from "@/components/dialogs/update-project-dialog";
import { UpdateProjectMemberDialog } from "@/components/dialogs/update-project-member-dialog";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

type ProjectType = {
  organizationId: string;
  id: string;
  title: string;
  description: string;
  tags: string[];
  percentage: number;
  status: "Pending" | "Working" | "Completed";
  members: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  }[];
  startDate: Date;
  deadLine: Date;
  createdAt: Date;
  updatedAt: Date;
};

type ResponseType = {
  completedProjects: ProjectType[];
  pendingProjects: ProjectType[];
};

interface Props {
  organizationId: string;
}

export const MemberProjectList = ({ organizationId }: Props) => {
  const colors = ["#FCF0E4", "#ECF5E7", "#EBF0FE", "#ECF5F4"];
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<Partial<ProjectType> | null>(null);

  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["get-member-projects"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/member/project/projects/${organizationId}?limit=3`
      );
      return res.data as ResponseType;
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (data: { projectId: string; organizationId: string }) => {
      const res = await axiosInstance.put("/member/project/completed", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-member-projects"],
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message || "Something went wrong!";
      toast.error(message);
    },
  });

  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <UpdateProjectMemberDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        project={selectedProject}
        setProject={setSelectedProject}
      />
      <div className="flex items-center justify-between">
        <h2 className="text text-neutral-700 font-semibold text-xl">
          Recent Projects
        </h2>
        <Link
          href="/projects"
          className="text-neutral-700 underline underline-offset-4 text-sm"
        >
          See all projects
        </Link>
      </div>
      {data && data.pendingProjects?.length < 1 ? (
        <div className="flex flex-col items-center">
          <Image
            src="/images/box.png"
            alt="Box Image"
            width={250}
            height={250}
            className="object-contain"
          />
          <h3 className="text-neutral-700 text-lg font-semibold">
            You have no recent projects
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {data?.pendingProjects.map((project) => {
            const color = colors[Math.floor(Math.random() * colors.length)];
            return (
              <div
                key={project.id}
                style={{ backgroundColor: color }}
                className="flex flex-col gap-3 w-full rounded-xl px-3 py-5 min-h-[250px]"
              >
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex gap-2">
                    {project.tags.map((status, i) => (
                      <Badge key={i}>{status}</Badge>
                    ))}
                  </div>
                  <h2 className="text-neutral-800 font-medium text-lg line-clamp-1 mt-2">
                    {project.title}
                  </h2>
                  <p className="text-neutral-600 text-sm line-clamp-2">
                    {project.description}
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
                            className={`-translate-x-[${memberIndex * 10}px]`}
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="flex-1">Mark as Completed</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Mark Project as Completed
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will mark the project as completed. Please
                          confirm that all tasks and deliverables are finalized
                          before proceeding.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            completeMutation.mutate({
                              organizationId,
                              projectId: project.id,
                            });
                          }}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
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
          })}
        </div>
      )}
    </div>
  );
};
