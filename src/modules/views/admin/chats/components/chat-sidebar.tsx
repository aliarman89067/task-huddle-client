"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { axiosInstance } from "@/lib/axios-instance";
import { useGetAdminOrganization } from "@/lib/common-query";
import { cn } from "@/lib/utils";
import { organizationStore } from "@/zustand/member.store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { EllipsisVerticalIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "sonner";

type ChatResponseType = {
  id: string;
  chatId: string;
  email: string;
  image: string | null;
  images: string[];
  files: { fileUrl: string; iconUrl: string; fileName: string; ext: string }[];
  name: string;
  status: string;
  message: string;
  createdAt: string;
};

type ChatMembersResponse = {
  admin: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    socketId: string;
  };
  members: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    designation: string;
    socketId: string;
  }[];
};

interface Props {
  selectedMember: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    socketId: string;
    designation?: string;
    isAdmin: boolean;
  } | null;
  setSelectedMember: Dispatch<
    SetStateAction<{
      id: string;
      name: string;
      email: string;
      image: string | null;
      socketId: string;
      designation?: string;
      isAdmin: boolean;
    } | null>
  >;
  messages: ChatResponseType[];
  setMessages: Dispatch<SetStateAction<ChatResponseType[]>>;
}

export const ChatSidebar = ({
  selectedMember,
  setSelectedMember,
  setMessages,
}: Props) => {
  const { selectedOrganizationId } = organizationStore();
  const searchParams = useSearchParams();
  const memberId = searchParams.get("memberId");

  // Queries
  const { data: membersData, isPending } = useQuery({
    queryKey: ["get-chat-members"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/organizations/get-chat-members/${selectedOrganizationId}`
      );
      return res.data as ChatMembersResponse;
    },
    refetchOnWindowFocus: false,
  });
  // Mutations
  const deleteAllChatsMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await axiosInstance.delete(
        `/admin/chats/delete-all-chats/${memberId}/${selectedOrganizationId}`
      );
      return res.data;
    },
    onSuccess: () => {
      setMessages([]);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message || "Something went wrong!";
      toast.error(message);
    },
  });

  const { data } = useGetAdminOrganization({ id: selectedOrganizationId! });

  useEffect(() => {
    if (memberId) {
      const member = membersData?.members.find((item) => item.id === memberId);

      if (member) {
        setSelectedMember({
          ...member,
          isAdmin: false,
        });
      } else {
        const member = membersData?.members[0];
        if (member) {
          setSelectedMember({
            ...member,
            isAdmin: false,
          });
        }
      }
    } else {
      const member = membersData?.members[0];
      if (member) {
        setSelectedMember({
          ...member,
          isAdmin: false,
        });
      }
    }
  }, [membersData, memberId]);

  const handleSelectMember = (data: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    socketId: string;
    isAdmin: boolean;
    designation?: string;
  }) => {
    const isSame = selectedMember?.id === data.id;
    if (!isSame) {
      setSelectedMember(data);
    }
  };

  if (isPending) {
    return <div>Loading...</div>;
  }
  return (
    <div className="w-[240px] bg-foreground shrink-0 rounded-xl h-[calc(100vh-110px)] overflow-y-scroll sidebar-scrollbar">
      <div className="flex flex-col gap-3 px-3 py-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-col mb-3">
            <Badge>Organization</Badge>
            <h2 className="text-neutral-300 font-medium text-xl font-sansitia">
              {data?.name}
            </h2>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-neutral-400 text-sm font-semibold">Members</h3>
          <div className="flex flex-col gap-2.5">
            {membersData?.members.map((member, index) => (
              <button
                key={index}
                onClick={() =>
                  handleSelectMember({ ...member, isAdmin: false })
                }
                className={cn(
                  "relative flex gap-2 items-center hover:bg-white/20 transition-all cursor-pointer rounded-lg px-2 py-2.5",
                  member.id === selectedMember?.id
                    ? "bg-white/20"
                    : "bg-white/10"
                )}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="absolute top-1 right-1 cursor-pointer px-0.5 py-0.5 rounded-xs bg-transparent hover:bg-neutral-800">
                      <EllipsisVerticalIcon className="text-white size-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => deleteAllChatsMutation.mutate(member.id)}
                    >
                      Delete all chats
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={member.image || ""}
                    alt={`${member.name} image`}
                  />
                  <AvatarFallback>{member.name.substring(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <h3 className="text-white text-sm">{member.name}</h3>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
