"use client";

import { useGetAdminOrganization } from "@/lib/common-query";
import { IPSettings } from "./components/ip-settings";
import { organizationStore } from "@/zustand/member.store";
import { useEffect } from "react";
import { LoadingScreen } from "@/components/loading-screen";
import { NoOrganization } from "@/constant";
import { EmptyOrganization } from "@/components/empty-organization";
import { ErrorCard } from "@/components/error-card";

export const PrivacyAndSecurityPageView = () => {
  const { selectedOrganizationId } = organizationStore();
  const { error, isPending, refetch, isSuccess } = useGetAdminOrganization({
    id: selectedOrganizationId!!,
  });

  useEffect(() => {
    refetch();
  }, []);

  if (isPending) {
    return <LoadingScreen />;
  }
  if (error && !isSuccess) {
    if (error === NoOrganization) {
      return <EmptyOrganization />;
    } else {
      return <ErrorCard title="Oops!!" description={error} />;
    }
  }

  return (
    <div className="w-full mt-16 flex flex-col">
      <div className="max-w-2xl w-full mx-auto">
        <h1 className="text-neutral-800 font-bold font-sansitia text-2xl">
          Privacy And Security
        </h1>
        <p className="text-base text-neutral-600">
          Here you can update your privacy and security settings, such as
          restricting member access to specific IP addresses.
        </p>
        <IPSettings />
      </div>
    </div>
  );
};
