import { CTAButton } from "@/components/cta-button";
import { ProgressBarAnimation } from "@/components/progress-bar";
import { ProjectOptionsHandler } from "@/components/project-option-handler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UpdateProjectDialog } from "@/components/dialogs/update-project-dialog";
import { axiosInstance } from "@/lib/axios-instance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { MessageCircleIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  pendingProjects: any[];
  organizationData: any;
}

export const OrganizationProjectList = ({
  pendingProjects,
  organizationData,
}: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(undefined);

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

  return (
    <>
      <UpdateProjectDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        project={selectedProject}
        setProject={setSelectedProject}
        members={organizationData.members}
      />
      {pendingProjects?.length < 1 ? (
        <div className="flex flex-col items-center gap-2 justify-center">
          <Image
            src="/images/box.png"
            alt="Box Image"
            width={250}
            height={250}
            className="object-contain"
          />
          <CTAButton
            title="Assign New Project"
            onClick={() =>
              router.push(
                `/dashboard/organizations/${organizationData.id}/create-project`
              )
            }
            classNames="w-[350px] h-14"
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 w-full gap-5 overflow-x-hidden overflow-y-scroll sidebar-scrollbar-sm pr-2">
          {pendingProjects?.map((project, index) => (
            <div
              key={index}
              className="relative flex flex-col gap-3 w-full bg-white/10 rounded-xl px-3 py-5 min-h-[250px]"
            >
              <ProjectOptionsHandler
                iconColor="light"
                isResign={false}
                onReAssign={() => projectReAssignMutation.mutate(project.id)}
                onDelete={() => projectDeleteMutation.mutate(project.id)}
              />
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex gap-2 flex-wrap">
                  {project?.tags?.map((tag: string, tagIndex: number) => (
                    <Badge key={tagIndex} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
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
                  {project?.members?.map((member: any, memberIndex: number) => (
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
                  ))}
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
                  onClick={() => projectCompleteMutation.mutate(project.id)}
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
          ))}
        </div>
      )}
    </>
  );
};
