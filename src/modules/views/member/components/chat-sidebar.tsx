"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMemberChatMembers } from "@/hooks/use-member-chat-members";
import { axiosInstance } from "@/lib/axios-instance";
import { useGetMemberOrganization } from "@/lib/common-query";
import { SocketContext } from "@/lib/socket-context";
import { cn } from "@/lib/utils";
import { organizationStore } from "@/zustand/member.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { EllipsisVerticalIcon, Loader2 } from "lucide-react";
import { Dispatch, SetStateAction, useContext, useEffect } from "react";
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
  selectedGroup: {
    id: string;
    name: string;
    image: string | null;
    members: {
      id: string;
      name: string;
      email: string;
      image?: string;
      designation: string;
    }[];
  } | null;
  setSelectedGroup: Dispatch<
    SetStateAction<{
      id: string;
      name: string;
      image: string | null;
      members: {
        id: string;
        name: string;
        email: string;
        image?: string;
        designation: string;
      }[];
    } | null>
  >;
}

export const ChatSidebar = ({
  selectedMember,
  setSelectedMember,
  messages,
  setMessages,
  selectedGroup,
  setSelectedGroup,
}: Props) => {
  const query = useQueryClient();
  const { selectedOrganizationId } = organizationStore();
  const socket = useContext(SocketContext);
  const { isPending, membersData, refetch } = useMemberChatMembers(
    selectedOrganizationId!
  );

  // Mutations
  const deleteAllChatsMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const isAdmin = selectedMember?.isAdmin ? "true" : "false";
      const res = await axiosInstance.delete(
        `/member/chats/delete-all-chats/${memberId}/${selectedOrganizationId}/${isAdmin}`
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("All chats deleted successfully");
      setMessages([]);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message || "Something went wrong!";
      toast.error(message);
    },
  });
  const leaveGroupMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const respose = await axiosInstance.post("/member/groups/leave", {
        roomId,
      });
      return respose.data;
    },
    onSuccess: () => {
      toast.success("Group leaved successfully");
      query.invalidateQueries({
        queryKey: ["get-chat-members"],
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong!";
      toast.error(errorMessage);
    },
  });
  const { data } = useGetMemberOrganization({ id: selectedOrganizationId! });

  useEffect(() => {
    if (!socket) return;
    socket.on("group-created", () => {
      query.invalidateQueries({
        queryKey: ["get-chat-members"],
      });
    });

    return () => {
      socket.off("group-created", refetch);
    };
  }, [socket]);

  useEffect(() => {
    const member = membersData?.members[0];
    const admin = membersData?.admin;
    if (member) {
      setSelectedMember({
        ...member,
        isAdmin: false,
      });
      setSelectedGroup(null);
    } else if (admin) {
      setSelectedMember({
        ...admin,
        isAdmin: true,
      });
      setSelectedGroup(null);
    }
  }, [membersData]);

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

  return (
    <div className="w-[240px] bg-foreground shrink-0 rounded-xl h-[calc(100vh-110px)] overflow-y-scroll sidebar-scrollbar">
      {isPending ? (
        <div className="flex items-center justify-center w-full h-full">
          <Loader2 className="size-6 text-neutral-400 animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-3 py-4 h-full">
          <div className="flex flex-col gap-1">
            <div className="flex flex-col mb-3">
              <Badge>Organization</Badge>
              <h2 className="text-neutral-300 font-medium text-xl font-sansitia">
                {data?.name}
              </h2>
            </div>
            <h3 className="text-neutral-400 text-sm font-semibold">Admin</h3>
            {membersData?.admin && (
              <button
                onClick={() => {
                  setSelectedGroup(null);
                  handleSelectMember({ ...membersData?.admin, isAdmin: true });
                }}
                className={cn(
                  "relative flex gap-2 items-center bg-white/10 hover:bg-white/20 transition-all cursor-pointer rounded-lg px-2 py-2.5",
                  membersData.admin.id === selectedMember?.id
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
                      onClick={() =>
                        deleteAllChatsMutation.mutate(membersData?.admin.id)
                      }
                    >
                      Delete all chats
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={membersData?.admin.image || ""}
                    alt={`${membersData?.admin.name} image`}
                  />
                  <AvatarFallback>
                    {membersData?.admin.name.substring(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <h3 className="text-white text-sm">
                    {membersData?.admin.name}
                  </h3>
                </div>
              </button>
            )}
          </div>
          {membersData && membersData.rooms.length > 0 && (
            <div className="flex flex-col gap-1">
              <h3 className="text-neutral-400 text-sm font-semibold">Groups</h3>
              <div className="flex flex-col gap-2.5">
                {membersData?.rooms.map((room, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedMember(null);
                      setSelectedGroup({ ...room });
                    }}
                    className={cn(
                      "relative flex gap-2 items-center hover:bg-white/20 transition-all cursor-pointer rounded-lg px-2 py-2.5",
                      room.id === selectedGroup?.id
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
                          onClick={() => leaveGroupMutation.mutate(room.id)}
                        >
                          Leave Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={room.image || ""} alt={` image`} />
                      <AvatarFallback>
                        {room.name.substring(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <h3 className="text-white text-sm">{room.name}</h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {membersData && membersData?.members?.length > 0 && (
            <div className="flex flex-col gap-1">
              <h3 className="text-neutral-400 text-sm font-semibold">
                Members
              </h3>
              {membersData &&
                membersData?.members.length > 0 &&
                membersData?.members.map((member, index) => (
                  <div className="flex flex-col gap-1 h-full">
                    <div className="flex flex-col gap-2.5 h-full">
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedGroup(null);
                          handleSelectMember({ ...member, isAdmin: false });
                        }}
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
                              onClick={() =>
                                deleteAllChatsMutation.mutate(member.id)
                              }
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
                          <AvatarFallback>
                            {member.name.substring(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                          <h3 className="text-white text-sm">{member.name}</h3>
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
