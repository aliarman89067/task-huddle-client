import { MemberChatsView } from "@/modules/views/member/member-chats-view";
import React from "react";

interface Props {
  params: Promise<{
    organizationId: string;
  }>;
}

const MemberChats = async ({ params }: Props) => {
  const { organizationId } = await params;
  return <MemberChatsView organizationId={organizationId} />;
};

export default MemberChats;
