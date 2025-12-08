"use client";

import { CheckInOutCard } from "@/components/dashboard/admin/check-in-out-card";
import { EmptyOrganization } from "@/components/empty-organization";
import { ErrorCard } from "@/components/error-card";
import { LoadingScreen } from "@/components/loading-screen";
import OrganizationInfo from "@/components/organization-info";
import { NoOrganization } from "@/constant";
import { useGetQueryError } from "@/hooks/use-get-query-error";
import { axiosInstance } from "@/lib/axios-instance";
import { useGetAdminOrganization } from "@/lib/common-query";
import { ResponseType } from "@/lib/schema";
import { organizationStore } from "@/zustand/member.store";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { CheckInDetailsDialog } from "../checkInOut/components/check-in-details-dialog";
import { EditCheckInDialog } from "../checkInOut/components/edit-check-in-dialog";

export const TrashCheckInOutView = () => {
  const { selectedOrganizationId } = organizationStore();
  const [selectedMember, setSelectedMember] = useState("all");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<ResponseType | null>(
    null
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [states, setStates] = useState({
    onTime: 0,
    lates: 0,
    leaves: 0,
  });
  const [duration, setDuration] = useState<
    "today" | "this week" | "this month" | "this year"
  >("today");

  const {
    data: organizationData,
    error: organizationError,
    isPending: isOrganizationPending,
    isSuccess,
    refetch: organizationRefetch,
  } = useGetAdminOrganization({
    id: selectedOrganizationId!,
    isMember: true,
  });
  const {
    data,
    isPending,
    error: checkError,
    refetch,
  } = useQuery({
    queryKey: ["member-attendance-history"],
    queryFn: async () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await axiosInstance.get(
        `/admin/checks/check-attendance/${selectedOrganizationId}?duration=${duration}&selectedMember=${selectedMember}&timezone=${timezone}&isTrash=true`
      );
      return res.data as ResponseType[];
    },
    retry: !!selectedOrganizationId,
  });

  useEffect(() => {
    organizationRefetch();
  }, []);

  useEffect(() => {
    if (data) {
      const leaves = data.filter(
        (item) => item && item.type === "Leave"
      ).length;
      const lates = data.filter((item) => item && item.isCheckInLate).length;
      const onTime = data.filter((item) => item && !item.isCheckInLate).length;
      setStates({ leaves, lates, onTime });
    }
  }, [data, isPending]);

  useEffect(() => {
    refetch();
  }, [duration, selectedMember]);

  if (isOrganizationPending || isPending) {
    return <LoadingScreen />;
  }

  if (organizationError && !isSuccess) {
    if (organizationError === NoOrganization) {
      return <EmptyOrganization />;
    } else {
      return <ErrorCard title="Oops!!" description={organizationError} />;
    }
  }

  if (checkError) {
    const { errorMessage } = useGetQueryError(
      checkError as AxiosError<{ message: string }>
    );
    return <ErrorCard title="Oops!!" description={errorMessage} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <CheckInDetailsDialog
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
        checkInData={selectedCheckIn}
        setCheckInData={setSelectedCheckIn}
      />
      <EditCheckInDialog
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        checkInData={selectedCheckIn}
        setCheckInData={setSelectedCheckIn}
        refetch={refetch}
      />
      <OrganizationInfo title={organizationData?.name} />
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <h2 className="text text-neutral-700 font-semibold text-xl">
            Deleted Check In / Out History
          </h2>
          <CheckInOutCard
            selectedMember={selectedMember}
            setSelectedMember={setSelectedMember}
            organizationData={organizationData}
            duration={duration}
            setDuration={setDuration}
            data={data}
            states={states}
            setSelectedCheckIn={setSelectedCheckIn}
            setIsDetailsOpen={setIsDetailsOpen}
            setIsEditOpen={setIsEditOpen}
            isTrashed
          />
        </div>
      </div>
    </div>
  );
};
