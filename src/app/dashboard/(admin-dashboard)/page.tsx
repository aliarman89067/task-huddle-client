"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/loading-screen";
import { axiosInstance } from "@/lib/axios-instance";
import { userStore } from "@/zustand/user.store";
import { useQuery } from "@tanstack/react-query";
import { FaExclamation } from "react-icons/fa";
import { CTAButton } from "@/components/cta-button";
import { OrganizationsGrid } from "@/components/dashboard/admin/organizations-grid";
import { EmptyOrganization } from "@/components/empty-organization";

const OrganizationsPage = () => {
  const { user } = userStore();
  const { data: organizationData, isPending: isorganizationPending } = useQuery(
    {
      queryKey: ["get-organizations"],
      queryFn: async () => {
        const response = await axiosInstance.get(`/admin/organizations`);
        return response.data.organizations;
      },
      enabled: !!user,
    }
  );
  if (isorganizationPending) {
    return <LoadingScreen />;
  }
  if (organizationData.length === 0) {
    return <EmptyOrganization />;
  }
  return (
    <section className="flex flex-col w-full">
      <OrganizationsGrid />
    </section>
  );
};

export default OrganizationsPage;
