"use client";
import { useState } from "react";
import { ChatBody } from "./components/chat-body";
import { ChatSidebar } from "./components/chat-sidebar";

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
  organizationId: string;
}

export const MemberChatsView = ({ organizationId }: Props) => {
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
        organizationId={organizationId}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        messages={messages}
        setMessages={setMessages}
      />
    </section>
  );
};
