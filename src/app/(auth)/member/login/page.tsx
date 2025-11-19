import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axios-instance";
import { MemberLoginPageView } from "@/modules/views/admin/auth/meber-login-page-view";
import { MemberJoinPageView } from "@/modules/views/admin/auth/member-join-page-view";
import React from "react";

interface Props {
  searchParams: Promise<{
    invitationId: string;
    organizationId: string;
    memberEmail: string;
  }>;
}

const fetchInvitation = async ({
  invitationId,
  memberEmail,
  organizationId,
}: {
  invitationId: string;
  organizationId: string;
  memberEmail: string;
}) => {
  try {
    const requestData = {
      invitationId,
      organizationId,
      memberEmail,
    };
    // console.log(requestData);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_BASE_URI}/auth/validate-member`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      }
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

const MemberLoginPage = async ({ searchParams }: Props) => {
  const data = await searchParams;
  const result = await fetchInvitation(data);
  if (!result.success) {
    if (result.code === "EXPIRED") {
      return (
        <div className="relative z-10 bg-white/70 shadow-2xl backdrop-blur-xs rounded-xl px-4 py-6 w-[45%] border border-neutral-300 flex flex-col left-28 overflow-hidden">
          <div className="w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl absolute -left-[50px] bottom-0 " />
          <div className="flex flex-col items-center z-1">
            <h3 className="text-destructive font-semibold text-2xl text-center">
              Invitation Expired
            </h3>
            <p className="text-base text-rose-500 text-center">
              {result.message}
            </p>
            <Button className="mt-4">Request Invitation</Button>
          </div>
        </div>
      );
    } else if (result.code === "NOT_FOUND") {
      return (
        <div className="relative z-10 bg-white/70 shadow-2xl backdrop-blur-xs rounded-xl px-4 py-6 w-[45%] border border-neutral-300 flex flex-col left-28 overflow-hidden">
          <div className="w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl absolute -left-[50px] bottom-0 " />
          <div className="flex flex-col items-center z-1">
            <h3 className="text-destructive font-semibold text-2xl text-center">
              Invitation Not Found
            </h3>
            <p className="text-base text-rose-500 text-center">
              {result.message}
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="relative z-10 bg-white/70 shadow-2xl backdrop-blur-xs rounded-xl px-4 py-6 w-[45%] border border-neutral-300 flex flex-col left-28 overflow-hidden">
          <div className="w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl absolute -left-[50px] bottom-0 " />
          <div className="flex flex-col items-center z-1">
            <h3 className="text-destructive font-semibold text-2xl text-center">
              Something went wrong
            </h3>
            <p className="text-base text-rose-500 text-center">
              Interval server error. Please try again.
            </p>
          </div>
        </div>
      );
    }
  }
  if (result.status === "CREATE_ACCOUNT") {
    return (
      <MemberLoginPageView
        invitationId={data.invitationId}
        memberEmail={data.memberEmail}
        organizationId={data.organizationId}
      />
    );
  } else if (result.status === "JOIN_ORGANIZATION") {
    return (
      <MemberJoinPageView
        invitationId={data.invitationId}
        organization={result.organization}
        member={result.member}
      />
    );
  }
};

export default MemberLoginPage;
