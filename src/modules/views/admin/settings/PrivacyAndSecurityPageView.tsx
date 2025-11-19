"use client";

import { IPSettings } from "./components/ip-settings";

export const PrivacyAndSecurityPageView = () => {
  return (
    <div className="w-full mt-16 flex flex-col">
      <div className="max-w-2xl w-full mx-auto">
        <h1 className="text-neutral-800 font-bold font-sansitia text-2xl">
          Privacy And Security
        </h1>
        <p className="text-base text-neutral-600">
          Here you can update your privacy and security settings, such as
          restricting member access to specific IP addresses.
        </p>
        <IPSettings />
      </div>
    </div>
  );
};
