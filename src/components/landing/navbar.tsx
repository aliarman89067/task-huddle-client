"use client";
import Link from "next/link";
import { MaxWidthWrapper } from "./max-width-wrapper";
import Image from "next/image";
import { NAVBAR_LINKS } from "@/constant";
import { usePathname } from "next/navigation";
import { cn, getSession } from "@/lib/utils";
import { userStore } from "@/zustand/user.store";
import { useEffect } from "react";
import { UserButton } from "../user-button";
import { Loader2Icon } from "lucide-react";

export const Navbar = () => {
  const pathname = usePathname();
  const { setUser, user } = userStore();
  const { isSuccess, data, isPending } = getSession();
  useEffect(() => {
    if (isSuccess && data) {
      setUser(data);
    }
  }, [isSuccess, data]);

  return (
    <MaxWidthWrapper>
      <div className="relative flex flex-col w-full">
        <nav className="w-full flex items-center justify-between py-4">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </Link>
          <div className="flex items-center gap-4 justify-center">
            {NAVBAR_LINKS.map((item) => {
              const isActive = item.href === pathname;
              const isDashboard = item.label === "Dashboard";
              if (isDashboard && !user) return "";
              if (isDashboard && user) {
                return (
                  <Link
                    key={item.id}
                    href={
                      user.role === "admin" ? item.href : `${item.href}/member`
                    }
                    className={cn(
                      "text-sm text-neutral-700",
                      isActive ? "text-neutral-900" : "text-neutral-700"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "text-sm text-neutral-700",
                    isActive ? "text-neutral-900" : "text-neutral-700"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          {isPending ? (
            <Loader2Icon className="size-5 text-neutral-700 animate-spin" />
          ) : (
            <UserButton />
          )}
        </nav>
        <div className="w-full h-[1px] bg-radial from-neutral-200 to-white" />
      </div>
    </MaxWidthWrapper>
  );
};
