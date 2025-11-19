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

const EmptyOrganization = () => {
  const router = useRouter();
  return (
    <div className="w-full h-screen flex flex-col items-center gap-2">
      <Image
        src="/images/not_found.png"
        alt="Not found image"
        width={350}
        height={350}
        className="object-contain"
      />
      <div className="flex items-center justify-center text-center mb-3">
        <h1 className="text-neutral-500 text-2xl font-extrabold">
          No Organization Found
        </h1>
        <FaExclamation className="size-6 text-neutral-500" />
      </div>
      <CTAButton
        title="Create Organization"
        onClick={() => router.push("/dashboard/create-organization")}
        classNames="w-[350px] h-[50px] bg-foreground ring-foreground"
      />
    </div>
  );
};
