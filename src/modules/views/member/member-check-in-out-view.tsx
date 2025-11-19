import OrganizationInfo from "@/components/organization-info";
import { MemberAttendanceHistory } from "./components/member-attendance-history";

interface Props {
  organizationId: string;
}

export const MemberCheckInOutView = ({ organizationId }: Props) => {
  return (
    <div className="flex flex-col gap-6">
      <OrganizationInfo title="AA Tech" />
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <h2 className="text text-neutral-700 font-semibold text-xl">
            Check In / Out History
          </h2>
          <MemberAttendanceHistory organizationId={organizationId} />
        </div>
      </div>
    </div>
  );
};
