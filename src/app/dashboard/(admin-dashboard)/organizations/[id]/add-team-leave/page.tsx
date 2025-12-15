import { AddTeamLeaveView } from "@/modules/views/admin/leave/add-team-leave/add-team-leave-view";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const AddTeamLeave = async ({ params }: Props) => {
  const { id } = await params;
  return <AddTeamLeaveView id={id} />;
};

export default AddTeamLeave;
