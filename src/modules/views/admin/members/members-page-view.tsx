"use client";

import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/loading-screen";
import OrganizationInfo from "@/components/organization-info";
import { axiosInstance } from "@/lib/axios-instance";
import { useGetAdminOrganization } from "@/lib/common-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MemberCard } from "./components/member-card";
import { AddLeaveDialog } from "@/components/dialogs/add-leave-dialog";
import { organizationStore } from "@/zustand/member.store";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";
import { NoOrganization } from "@/constant";
import { EmptyOrganization } from "@/components/empty-organization";
import { ErrorCard } from "@/components/error-card";
import { useGetQueryError } from "@/hooks/use-get-query-error";
import { AxiosError } from "axios";
import { toast } from "sonner";

type MembersDataType = {
  id: string;
  name: string;
  image: string;
  email: string;
  designation: string;
  checks?: number;
  projects?: number;
};

export const MembersPageView = () => {
  const router = useRouter();
  const [addLeavesDialogOpen, setAddLeavesDialogOpen] = useState(false);
  const [viewLeavesDialogOpen, setViewLeavesDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MembersDataType | null>(
    null
  );
  const { selectedOrganizationId } = organizationStore();
  const { data, error, isPending, refetch, isSuccess } =
    useGetAdminOrganization({
      id: selectedOrganizationId!,
    });
  const queryClient = useQueryClient();
  // Queries
  const {
    data: membersData,
    error: membersError,
    isPending: membersPending,
  } = useQuery({
    queryKey: ["get-members"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/members/${selectedOrganizationId}`
      );
      return res.data as MembersDataType[];
    },
    retry: !!selectedOrganizationId,
    // enabled: !!selectedOrganizationId,
  });
  const { data: pendingMembers } = useQuery({
    queryKey: ["get-pending-members"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/members/pending-members/${selectedOrganizationId}`
      );
      return res.data as { email: string; createdAt: string }[];
    },
    retry: !!selectedOrganizationId,
    // enabled: !!selectedOrganizationId,
  });

  useEffect(() => {
    refetch();
  }, []);

  const handleAddMemberRoute = () => {
    router.push("/dashboard/add-members");
  };
  if (isPending || membersPending) {
    return <LoadingScreen />;
  }

  if (error && !isSuccess) {
    if (error === NoOrganization) {
      return <EmptyOrganization />;
    } else {
      return <ErrorCard title="Oops!!" description={error} />;
    }
  }
  if (membersError) {
    const { errorMessage } = useGetQueryError(
      membersError as AxiosError<{ message: string }>
    );
    return <ErrorCard title="Oops!!" description={errorMessage} />;
  }
  return (
    <section className="flex flex-col">
      <div className="flex items-center justify-between">
        <OrganizationInfo title={data.name} />
        <Button onClick={handleAddMemberRoute}>
          Add Member <PlusIcon />
        </Button>
      </div>
      <AddLeaveDialog
        isDialogOpen={addLeavesDialogOpen}
        selectedMember={selectedMember}
        organizationId={selectedOrganizationId!}
        setIsDialogOpen={setAddLeavesDialogOpen}
      />
      {membersData && membersData.length > 0 ? (
        <div className="w-full mt-5 flex flex-col">
          <div className="grid grid-cols-3 gap-5">
            {membersData.map((member) => (
              <MemberCard
                member={member}
                setSelectedMember={setSelectedMember}
                setAddLeavesDialogOpen={setAddLeavesDialogOpen}
                setViewLeavesDialogOpen={setViewLeavesDialogOpen}
              />
            ))}
          </div>
        </div>
      ) : (
        <NotFound
          title="You have no member"
          description="You can add member by clicking add member button"
        />
      )}
      {pendingMembers && pendingMembers.length > 0 && (
        <div className="mt-10 flex flex-col w-full gap-3">
          <div className="flex flex-col">
            <h2 className="text text-neutral-700 font-semibold text-xl">
              Pending Members
            </h2>
            <p className="text text-neutral-600 text-base">
              This member is currently in the pending stage. Once they accept
              your invitation, they will become a member.
            </p>
          </div>
          {pendingMembers?.map((member, index) => (
            <MemberRow index={index} member={member} />
          ))}
        </div>
      )}
    </section>
  );
};

const NotFound = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <Image
        src="/images/not_found.png"
        alt="not Found image"
        width={250}
        height={250}
        className="object-contain"
      />
      <h1 className="text-neutral-700 font-bold text-2xl">{title}</h1>
      <p className="text-neutral-500 text-base text-center max-w-xl">
        {description}
      </p>
    </div>
  );
};

interface MemberRowProps {
  index: number;
  member: {
    email: string;
    createdAt: string;
  };
}

const MemberRow = ({ index, member }: MemberRowProps) => {
  const queryClient = useQueryClient();
  const { selectedOrganizationId } = organizationStore();

  // Mutations
  const deletePendingMutation = useMutation({
    mutationFn: async ({
      email,
      organizationId,
    }: {
      email: string;
      organizationId: string;
    }) => {
      const res = await axiosInstance.delete(
        `/admin/members/delete-pending/${email}/${organizationId}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-pending-members"],
      });
    },
  });
  const resendInvitationMutation = useMutation({
    mutationFn: async ({
      email,
      organizationId,
    }: {
      email: string;
      organizationId: string;
    }) => {
      const data = {
        email,
        organizationId,
      };
      const res = await axiosInstance.post(
        "/admin/members/resend-invitation",
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-pending-members"],
      });
      toast.success("Invitation resend successfully");
    },
  });

  return (
    <div
      key={index}
      className="flex items-center justify-between w-full bg-neutral-200 rounded-lg px-4 py-2"
    >
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-neutral-800 text-sm font-semibold">
            Added At
          </span>
          <span className="text-neutral-800 text-sm">
            {new Date(member.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-neutral-800 text-sm font-semibold">Email</span>
          <span className="text-neutral-800 text-sm">{member.email}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          disabled={resendInvitationMutation.isPending}
          size="sm"
          onClick={() =>
            resendInvitationMutation.mutate({
              email: member.email,
              organizationId: selectedOrganizationId!,
            })
          }
          className="bg-green-400 ring-0 hover:bg-green-500"
        >
          {resendInvitationMutation.isPending
            ? "Resending..."
            : "Resend Invitation"}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" className="bg-rose-400 ring-0 hover:bg-rose-500">
              Remove
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently remove this member and cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-rose-400 hover:bg-rose-500"
                onClick={() =>
                  deletePendingMutation.mutate({
                    email: member.email,
                    organizationId: selectedOrganizationId!,
                  })
                }
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
