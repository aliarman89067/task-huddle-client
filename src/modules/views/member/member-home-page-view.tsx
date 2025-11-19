"use client";
import React from "react";
import { CheckInBox } from "./components/check-in-box";
import { MemberProjectList } from "./components/member-project-list";
import { MemberAttendanceHistory } from "./components/member-attendance-history";
import { DashboardCards } from "./components/dashboard-cards";
import { MemberAnalyticsCharts } from "./components/member-analytics-charts";
import OrganizationInfo from "@/components/organization-info";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance";
import { LoadingScreen } from "@/components/loading-screen";

interface Props {
  organizationId: string;
}

const MemberHomePageView = ({ organizationId }: Props) => {
  return (
    <section className="flex flex-col gap-5 w-full">
      <OrganizationInfo title="AA Tech" />
      <CheckInBox organizationId={organizationId} />
      <DashboardCards organizationId={organizationId} />
      <MemberAnalyticsCharts organizationId={organizationId} />
      <MemberProjectList organizationId={organizationId} />
      <MemberAttendanceHistory organizationId={organizationId} />
    </section>
  );
};

export default MemberHomePageView;
