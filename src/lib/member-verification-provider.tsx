"use client";
import { ReactNode, useEffect, useState } from "react";
import { LoadingScreen } from "@/components/loading-screen";
import { useRouter } from "next/navigation";
import { userStore } from "@/zustand/user.store";
import { axiosInstance } from "./axios-instance";
import { organizationStore } from "@/zustand/member.store";

interface Props {
  children: ReactNode;
}

export const MemberVerificationProvider = ({ children }: Props) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  const { setUser } = userStore();
  const { setOrganizationId } = organizationStore();

  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosInstance.get("/auth/get-session");
        if (data.data.role !== "member") {
          router.push("/");
          return;
        }
        console.log(data.data);
        const organizationId = data.organization.id;
        setOrganizationId(organizationId);
        setUser(data.data);
        setIsLoading(false);
        router.push(`http://localhost:3000/dashboard/member/${organizationId}`);
      } catch (error) {
        console.log(error);
        router.push("/");
      }
    };
    loadSession();
  }, [router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <div>{children}</div>;
};
