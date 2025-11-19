import React, { ReactNode } from "react";
import { AdminSidebar } from "@/components/dashboard/admin/admin-sidebar";
import { AdminVerificationProvider } from "@/lib/admin-verification-provider";
import { DashboardNavbar } from "@/components/dashboard/admin/dashboard-navbar";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <AdminVerificationProvider>
      <div className="flex gap-4">
        <AdminSidebar />
        <div className="flex flex-col gap-5 w-full">
          <DashboardNavbar />
          <div className="w-full pr-4">{children}</div>
        </div>
      </div>
    </AdminVerificationProvider>
  );
};

export default DashboardLayout;
