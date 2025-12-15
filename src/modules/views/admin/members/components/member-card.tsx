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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { axiosInstance } from "@/lib/axios-instance";
import { organizationStore } from "@/zustand/member.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  ChevronDown,
  ChevronDownIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  PanelsTopLeftIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

interface Props {
  member: {
    id: string;
    name: string;
    image: string;
    email: string;
    designation: string;
    checks?: number;
    projects?: number;
  };
  setSelectedMember: Dispatch<
    SetStateAction<{
      id: string;
      name: string;
      image: string;
      email: string;
      designation: string;
      checks?: number;
      projects?: number;
    } | null>
  >;
  setAddLeavesDialogOpen: Dispatch<SetStateAction<boolean>>;
  setViewLeavesDialogOpen: Dispatch<SetStateAction<boolean>>;
}

export const MemberCard = ({
  member,
  setSelectedMember,
  setAddLeavesDialogOpen,
  setViewLeavesDialogOpen,
}: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedOrganizationId } = organizationStore();
  const handleAddLeaves = () => {
    setSelectedMember(member);
    setAddLeavesDialogOpen(true);
  };
  const handleViewLeaves = () => {
    // Continue from here
    setSelectedMember(member);
    setViewLeavesDialogOpen(true);
  };

  const removeMemberMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.delete(
        `/admin/members/${member.id}/${selectedOrganizationId}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-members"],
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error?.response?.data.message || "Something went wrong!";
      toast.error(message);
    },
  });

  const handleAssignProjectRoute = () => {
    router.push(
      `/dashboard/organizations/${selectedOrganizationId}/create-project?memberId=${member.id}`
    );
  };

  return (
    <div className="bg-neutral-800 rounded-xl px-4 py-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Badge>{member.designation}</Badge>
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="border-none ring-0 outline-none"
          >
            <Button size="sm" variant="secondary">
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleAddLeaves}>
              Add Leaves
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewLeaves}>
              View Leaves
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAssignProjectRoute}>
              Assigned new project
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/chats?memberId=${member.id}`)
              }
            >
              Message
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div className="bg-rose-400 ring-0 hover:bg-rose-500 rounded-md text-white px-2 py-2 text-sm cursor-pointer">
                  Remove
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently remove this member and cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-rose-400 hover:bg-rose-500"
                    onClick={() => removeMemberMutation.mutate()}
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {member.image ? (
        <Image
          src={member.image}
          alt={`${member.name} profile image`}
          width={300}
          height={300}
          className="w-full h-[150px] rounded-lg object-cover"
        />
      ) : (
        <div className="w-full h-[150px] flex items-center justify-center rounded-lg bg-neutral-600">
          <span className="text-white font-extrabold text-4xl">
            {member.name.substring(0, 1)}
          </span>
        </div>
      )}

      <div className="flex flex-col my-1">
        <h3 className="text-white font-semibold text-base">{member.name}</h3>
        <h3 className="text-neutral-300 text-sm">{member.email}</h3>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="flex flex-col items-center">
          <span className="text-sm text-white whitespace-nowrap">
            Total Projects
          </span>
          <span className="text-sm text-white font-semibold whitespace-nowrap flex items-center gap-1">
            {member.projects}
            <PanelsTopLeftIcon className="text-white size-4" />
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-white whitespace-nowrap">
            Total Check In
          </span>
          <span className="text-sm text-white font-semibold whitespace-nowrap flex items-center gap-1">
            {member.checks}
            <ClockIcon className="text-white size-4" />
          </span>
        </div>
      </div>
    </div>
  );
};
