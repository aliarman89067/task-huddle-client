import { axiosInstance } from "@/lib/axios-instance";
import { useQuery } from "@tanstack/react-query";

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
  rooms: {
    id: string;
    name: string;
    image: string;
    members: {
      id: string;
      name: string;
      email: string;
      image?: string;
      designation: string;
    }[];
  }[];
};

export const useMemberChatMembers = (organizationId: string) => {
  const {
    data: membersData,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["get-chat-members"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/member/organizations/get-chat-members/${organizationId}`
      );
      return res.data as ChatMembersResponse;
    },
    refetchOnWindowFocus: false,
  });
  return {
    membersData,
    isPending,
    refetch,
  };
};
