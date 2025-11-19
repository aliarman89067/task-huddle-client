import React from "react";
import { CreateProjectPageView } from "@/modules/views/admin/project/create-project-page-view";

interface Props {
  params: Promise<{ id: string }>;
}

const CreateProjectPage = async ({ params }: Props) => {
  const { id } = await params;
  return <CreateProjectPageView id={id} />;
};

export default CreateProjectPage;
