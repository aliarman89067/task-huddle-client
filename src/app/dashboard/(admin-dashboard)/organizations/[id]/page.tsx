import { OrganizationView } from "@/modules/views/admin/organization/organization-view";
import React from "react";

interface Props {
  params: Promise<{ id: string }>;
}

const OrganizationPage = async ({ params }: Props) => {
  const { id } = await params;
  return <OrganizationView id={id} />;
};

export default OrganizationPage;
