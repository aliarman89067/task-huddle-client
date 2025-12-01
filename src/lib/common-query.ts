import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./axios-instance";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";

interface UseGetAdminOrganizationProps {
  id: string;
  isMember?: boolean;
}

export const useGetAdminOrganization = ({
  id,
  isMember,
}: UseGetAdminOrganizationProps) => {
  // const [data, setData] = useState<any>(null);
  // const [isPending, setIsPending] = useState(false);
  // const [isSuccess, setIsSuccess] = useState(false);
  // const [error, setError] = useState("");

  // const getOrganization = async () => {
  //   if (!id) return;
  //   try {
  //     const { data } = await axiosInstance.get(
  //       `/admin/organizations/${id}?${isMember && "isMember=true"}`
  //     );
  //     setData(data);
  //   } catch (error) {
  //     const axiosError = error as AxiosError<{ message: string }>;
  //     const errorMessage =
  //       axiosError?.response?.data.message || "Something went wrong";
  //     setError(errorMessage);
  //   }
  // };
  // useEffect(() => {
  //   getOrganization();
  // }, [id]);
  // const refetch = () => {
  //   getOrganization();
  // };

  const { data, error, isPending, refetch, isSuccess } = useQuery({
    queryKey: ["get-organization"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/organizations/${id}?${isMember && "isMember=true"}`
      );
      return res.data.organization;
    },
    retry: id ? 1 : false,
    refetchOnWindowFocus: !!id,
    // enabled: !!id,
  });
  const axiosError = error as AxiosError<{ message: string }>;
  const errorMessage =
    axiosError?.response?.data.message || "Something went wrong";

  return {
    data,
    error: errorMessage,
    isPending,
    refetch,
    isSuccess,
  };
};

interface UseGetMemberOrganizationProps {
  id: string;
}

export const useGetMemberOrganization = ({
  id,
}: UseGetMemberOrganizationProps) => {
  const { data, error, isPending } = useQuery({
    queryKey: ["get-organization"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/member/organizations/${id}`);
      return res.data.organization;
    },
    enabled: !!id,
  });
  return {
    data,
    error,
    isPending,
  };
};
