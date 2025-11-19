import { MemberCheckInOutView } from "@/modules/views/member/member-check-in-out-view";
import React from "react";

interface Props {
  params: Promise<{
    organizationId: string;
  }>;
}

const MemberCheckInOut = async ({ params }: Props) => {
  const { organizationId } = await params;
  return <MemberCheckInOutView organizationId={organizationId} />;
};

export default MemberCheckInOut;
