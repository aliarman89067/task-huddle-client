import { MembersPageView } from "@/modules/views/admin/members/members-page-view";
import React from "react";

interface Props {
  params: Promise<{ id: string }>;
}

const MembersPage = async ({ params }: Props) => {
  const { id } = await params;
  return <MembersPageView organizationId={id} />;
};

export default MembersPage;
