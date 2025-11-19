import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./axios-instance";

interface UseGetAdminOrganizationProps {
  id: string;
  isMember?: boolean;
}

export const useGetAdminOrganization = ({
  id,
  isMember,
}: UseGetAdminOrganizationProps) => {
  const { data, error, isPending } = useQuery({
    queryKey: ["get-organization"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/organizations/${id}?${isMember && "isMember=true"}`
      );
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
