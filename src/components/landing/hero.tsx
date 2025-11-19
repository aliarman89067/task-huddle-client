import { motion } from "framer-motion";
import {
  ClockIcon,
  ComputerIcon,
  SendIcon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react";
import { CTAButton } from "../cta-button";
import { MaxWidthWrapper } from "./max-width-wrapper";
import { useRouter } from "next/navigation";

export const Hero = () => {
  const router = useRouter();

  const iconsData = [
    {
      id: 1,
      icon: ShieldIcon,
      size: 30,
      iconSize: 15,
    },
    {
      id: 2,
      icon: ClockIcon,
      size: 35,
      iconSize: 17,
    },
    {
      id: 3,
      icon: ComputerIcon,
      size: 45,
      iconSize: 20,
    },
    {
      id: 4,
      icon: UsersIcon,
      size: 35,
      iconSize: 17,
    },
    {
      id: 5,
      icon: SendIcon,
      size: 30,
      iconSize: 15,
    },
  ];

  return (
    <div className="relative w-full flex items-center justify-center min-h-[calc(100vh-70px)]">
      <motion.img
        initial={{ opacity: 0, scale: 0.8, x: -7 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.1 }}
        src="/images/hero-image.png"
        alt="Hero Image"
        className="object-contain h-screen absolute left-0 -top-[70px] pointer-events-none select-none"
      />
      <motion.img
        initial={{ opacity: 0, scale: 0.8, x: -7 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.1 }}
        src="/images/hero-image.png"
        alt="Hero Image"
        className="object-contain h-screen absolute right-0 -top-[70px] scale-x-[-1] pointer-events-none select-none"
      />
      <MaxWidthWrapper>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.9 }}
          className="flex flex-col items-center justify-center -mt-16"
        >
          <h1 className=" text-neutral-900 text-6xl text-center">
            Manage Your Teams
          </h1>
          <span className="text-neutral-700 text-xl italic mt-4 text-center font-medium">
            In Just one place.
          </span>
          <p className="text-neutral-500 text-base mt-1 text-center max-w-3xl">
            Track attendance, assign tasks, and monitor progress without the
            hassle. Everything your team needs to stay productive is right here.
          </p>
          <div className="relative mt-5">
            <div className="relative flex items-center gap-5 z-10">
              {iconsData.map((item) => (
                <span
                  key={item.id}
                  style={{
                    width: item.size,
                    height: item.size,
                  }}
                  className="flex items-center justify-center rounded-full bg-white border border-neutral-100 shadow-md hover:bg-primary transition-all text-neutral-600 hover:text-white"
                >
                  <item.icon
                    style={{
                      width: item.iconSize,
                      height: item.iconSize,
                    }}
                  />
                </span>
              ))}
            </div>
            <div className="h-[1px] w-[calc(100%+80px)] bg-radial from-neutral-900 to-white absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" />
          </div>
          <CTAButton
            title="Get Started"
            onClick={() => router.push("/login")}
            classNames="w-[450px] mt-6"
          />
        </motion.div>
      </MaxWidthWrapper>
    </div>
  );
};
