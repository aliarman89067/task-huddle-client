"use client";
import { ReactNode, useContext, useEffect, useState } from "react";
import { LoadingScreen } from "@/components/loading-screen";
import { useRouter } from "next/navigation";
import { userStore } from "@/zustand/user.store";
import { axiosInstance } from "./axios-instance";
import { organizationStore } from "@/zustand/member.store";

interface Props {
  children: ReactNode;
}

export const AdminVerificationProvider = ({ children }: Props) => {
  const router = useRouter();
  const { setOrganizationId } = organizationStore();

  const [isLoading, setIsLoading] = useState(true);

  const { setUser } = userStore();

  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosInstance.get("/auth/get-session");
        if (data.data.role === "member") {
          router.push("/dashboard/member");
          return;
        }
        if (data.data.role !== "admin") {
          router.push("/");
          return;
        }
        setUser(data.data);
        setOrganizationId(data?.organization?.[0]?.id || null);
        setIsLoading(false);
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
