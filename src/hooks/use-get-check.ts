import { axiosInstance } from "@/lib/axios-instance";
import { useQuery } from "@tanstack/react-query";

type checkType = {
  id: string;
  isLate: boolean;
  type: "CheckIn" | "CheckOut";
  checkInTime: Date;
  checkOutTime: Date;
  memberId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  breaks: {
    id: string;
    type: "BreakIn" | "BreakOut";
    breakInTime: Date;
  }[];
};

export const useGetCheck = (organizationId: string) => {
  // Queries
  const {
    data: check,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["get-check"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/member/check/${organizationId}`);
      return res.data as checkType;
    },
    retry: false,
  });

  return {
    check,
    isPending,
    refetch,
  };
};
