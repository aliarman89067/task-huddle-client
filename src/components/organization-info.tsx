import React from "react";
import { Badge } from "./ui/badge";

const OrganizationInfo = ({ title }: { title: string }) => {
  return (
    <div className="flex flex-col">
      <Badge>Organization</Badge>
      <h2 className="text-neutral-700 font-medium text-4xl font-sansitia">
        {title}
      </h2>
    </div>
  );
};

export default OrganizationInfo;
