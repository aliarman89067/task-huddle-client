import { MemberProjectView } from "@/modules/views/member/member-project-view";
import React from "react";

interface Props {
  params: Promise<{ organizationId: string }>;
}

const MemberProjects = async ({ params }: Props) => {
  const { organizationId } = await params;
  return <MemberProjectView organizationId={organizationId} />;
};

export default MemberProjects;
