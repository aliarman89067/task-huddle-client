"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaExclamation } from "react-icons/fa";
import { CTAButton } from "./cta-button";

interface Props {
  title: string;
  description?: string;
}

export const ErrorCard = ({ title, description }: Props) => {
  const router = useRouter();
  return (
    <div className="w-full h-[calc(100vh-100px)] flex flex-col items-center gap-2">
      <Image
        src="/images/error.png"
        alt="Not found image"
        width={325}
        height={325}
        className="object-contain"
      />
      <div className="flex items-center justify-center text-center">
        <h1 className="text-neutral-500 text-2xl font-extrabold">{title}</h1>
        <FaExclamation className="size-6 text-neutral-500" />
      </div>
      <p className="text-neutral-400">{description}</p>
    </div>
  );
};
