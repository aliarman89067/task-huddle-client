import { DashboardNavbar } from "@/components/dashboard/admin/dashboard-navbar";
import MemberSidebar from "@/components/dashboard/member/member-sidebar";
import { MemberVerificationProvider } from "@/lib/member-verification-provider";
import React, { ReactNode } from "react";

const MemberLayout = ({ children }: { children: ReactNode }) => {
  return (
    <MemberVerificationProvider>
      <div className="flex gap-4">
        <MemberSidebar />
        <div className="flex flex-col gap-5 w-full">
          <DashboardNavbar />
          <div className="w-full pr-4">{children}</div>
        </div>
      </div>
    </MemberVerificationProvider>
  );
};

export default MemberLayout;
