"use client";
import { useEffect, useState } from "react";
import { ChatBody } from "./components/chat-body";
import { ChatSidebar } from "./components/chat-sidebar";
import { organizationStore } from "@/zustand/member.store";
import { useGetAdminOrganization } from "@/lib/common-query";
import { NoOrganization } from "@/constant";
import { EmptyOrganization } from "@/components/empty-organization";
import { ErrorCard } from "@/components/error-card";
import { LoadingScreen } from "@/components/loading-screen";

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

export const AdminChatsView = () => {
  const { selectedOrganizationId } = organizationStore();
  const {
    data,
    error: organizationError,
    isPending,
    refetch,
    isSuccess,
  } = useGetAdminOrganization({
    id: selectedOrganizationId!,
  });
  const [messages, setMessages] = useState<ChatResponseType[]>([]);
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    name: string;
    email: string;
    image: string | null;
    socketId: string;
    designation?: string;
    isAdmin: boolean;
  } | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<{
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
  } | null>(null);

  useEffect(() => {
    refetch();
  }, []);

  if (isPending) {
    return <LoadingScreen />;
  }

  if (organizationError && !isSuccess) {
    if (organizationError === NoOrganization) {
      return <EmptyOrganization />;
    } else {
      return <ErrorCard title="Oops!!" description={organizationError} />;
    }
  }

  return (
    <section className="flex gap-5">
      <ChatSidebar
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        messages={messages}
        setMessages={setMessages}
        organizationName={data?.name}
      />
      <ChatBody
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        organizationId={selectedOrganizationId!}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        messages={messages}
        setMessages={setMessages}
      />
    </section>
  );
};
