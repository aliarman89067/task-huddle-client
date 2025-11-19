import { MemberAttendanceHistory } from "@/modules/views/member/components/member-attendance-history";
import { MemberProjectList } from "@/modules/views/member/components/member-project-list";
import MemberHomePageView from "@/modules/views/member/member-home-page-view";
import React from "react";

interface Props {
  params: Promise<{
    organizationId: string;
  }>;
}

const OrganizationPage = async ({ params }: Props) => {
  const { organizationId } = await params;
  return <MemberHomePageView organizationId={organizationId} />;
};

export default OrganizationPage;
