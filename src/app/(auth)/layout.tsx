import React, { ReactNode } from "react";
import Image from "next/image";
import { MaxWidthWrapper } from "@/components/landing/max-width-wrapper";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <section className="relative bg-white w-full overflow-hidden">
      <MaxWidthWrapper className="relative min-h-screen flex items-center">
        {children}
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-[65%]">
          <Image
            src="/images/auth-image.jpg"
            alt="Auth Image"
            width={1000}
            height={1000}
            className="object-contain h-full"
          />
        </div>
      </MaxWidthWrapper>
    </section>
  );
};

export default AuthLayout;
