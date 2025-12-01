"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaExclamation } from "react-icons/fa";
import { CTAButton } from "./cta-button";

export const EmptyOrganization = () => {
  const router = useRouter();
  return (
    <div className="w-full h-[calc(100vh-100px)] flex flex-col items-center gap-2">
      <Image
        src="/images/not_found.png"
        alt="Not found image"
        width={325}
        height={325}
        className="object-contain"
      />
      <div className="flex items-center justify-center text-center mb-3">
        <h1 className="text-neutral-500 text-2xl font-extrabold">
          You don't have any organization
        </h1>
        <FaExclamation className="size-6 text-neutral-500" />
      </div>
      <CTAButton
        title="Create Organization"
        onClick={() => router.push("/dashboard/create-organization")}
        classNames="w-[350px] h-[50px] bg-foreground ring-foreground"
      />
    </div>
  );
};
