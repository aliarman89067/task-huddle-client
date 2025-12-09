import Image from "next/image";
import { MaxWidthWrapper } from "./max-width-wrapper";
import Link from "next/link";
import { userStore } from "@/zustand/user.store";

export const Footer = () => {
  const { user } = userStore();
  return (
    <footer className="bg-foreground w-full py-20">
      <MaxWidthWrapper className="flex flex-col items-center gap-2 w-full">
        <div className="flex flex-wrap justify-between w-full">
          <div className="flex flex-col gap-2 items-center">
            <Image
              src="/logo-white.svg"
              alt="Logo svg"
              width={100}
              height={100}
              className="w-20"
            />
            <span className="text-white font-semibold text-xl">
              Task huddle
            </span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <h3 className="text-white font-semibold text-xl">Quick Links</h3>
            <div className="flex flex-col gap-1 text-neutral-300">
              {user ? (
                <>
                  <Link href="/">Home</Link>
                  <Link href="/dashboard">Dashboard</Link>
                  <Link href="/profile">Profile</Link>
                </>
              ) : (
                <Link href="/">Home</Link>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <h3 className="text-white font-semibold text-xl">Policy</h3>
            <div className="flex flex-col gap-1 text-neutral-300">
              <Link href="/security">Security</Link>
              <Link href="/privacy-and-policy">Privacy & Policy</Link>
            </div>
          </div>
        </div>
        <p className="text-center text-neutral-300 text-sm mt-7">
          © 2025 TaskHuddle. All rights reserved.
        </p>
      </MaxWidthWrapper>
    </footer>
  );
};
