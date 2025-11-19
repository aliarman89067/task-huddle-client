import { CTAButton } from "@/components/cta-button";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { MenuIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  organizationId: string;
}

type MembersDataType = {
  id: string;
  name: string;
  image: string;
  designation: string;
  email: string;
  checks?: number;
  projects?: number;
};

export const OrganizationMemberList = ({ organizationId }: Props) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: membersData,
    error: membersError,
    isPending: membersPending,
  } = useQuery({
    queryKey: ["get-members"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/admin/members/${organizationId}`);
      return res.data as MembersDataType[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await axiosInstance.delete(
        `/admin/members/${memberId}/${organizationId}`
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Member removed successfully");
      queryClient.invalidateQueries({
        queryKey: ["get-members"],
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error?.response?.data.message || "Something went wrong";
      toast.error(message);
    },
  });

  return (
    <div className="flex flex-col w-full gap-3 overflow-x-hidden overflow-y-scroll sidebar-scrollbar-sm pr-2 max-h-[400px]">
      {membersData && membersData.length > 0 ? (
        <>
          {membersData?.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-neutral-700 rounded-xl px-4 py-2"
            >
              <div className="flex gap-2 items-center">
                <Avatar className="w-14 h-14">
                  <AvatarImage
                    src={item.image}
                    className="object-cover"
                    alt={`${item.name} profile image`}
                  />
                  <AvatarFallback>{item.name.substring(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <Badge>{item.designation}</Badge>
                  <span className="text-white font-medium text-base">
                    {item.name}
                  </span>
                  <span className="text-neutral-300 text-sm">{item.email}</span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-2 py-2 rounded-lg cursor-pointer bg-white/20 hover:bg-white/30 transition-all text-white">
                    <MenuIcon className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Message</DropdownMenuItem>
                  <DropdownMenuItem>Info</DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <div className="bg-rose-400 text-white hover:bg-rose-500 rounded-md px-3 py-2 text-sm w-full cursor-pointer">
                        Remove
                      </div>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently remove this member and
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(item.id)}
                          className="bg-rose-400 hover:bg-rose-500"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </>
      ) : (
        <div className="flex w-full h-[400px] items-center justify-center flex-col gap-2">
          <Image
            src="/images/users.png"
            alt="Message icon"
            width={200}
            height={200}
            className="w-[80%] object-contain"
          />
          <h2 className="text-neutral-300 text-center text-xl">
            You have no members
          </h2>
          <CTAButton
            title="Add Members"
            onClick={() => router.push("/dashboard/add-members")}
            classNames="w-[350px] h-14"
          />
        </div>
      )}
    </div>
  );
};
