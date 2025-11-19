"use client";
import { useState } from "react";
import { ChatBody } from "./components/chat-body";
import { ChatSidebar } from "./components/chat-sidebar";
import { organizationStore } from "@/zustand/member.store";

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

  return (
    <section className="flex gap-5">
      <ChatSidebar
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        messages={messages}
        setMessages={setMessages}
      />
      <ChatBody
        organizationId={selectedOrganizationId!}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        messages={messages}
        setMessages={setMessages}
      />
    </section>
  );
};
