import Image from "next/image";
import { MaxWidthWrapper } from "./max-width-wrapper";
import {
  AlarmClockCheckIcon,
  BoxesIcon,
  FolderRootIcon,
  MessageCircleIcon,
} from "lucide-react";
import { motion } from "framer-motion";

export const BentoBox = () => {
  return (
    <MaxWidthWrapper className="mt-10">
      <div className="grid grid-cols-2 gap-6">
        <div className="group relative bg-black/15 p-2 rounded-xl transition-all duration-300 overflow-hidden">
          <motion.div
            aria-hidden
            className="group-hover:opacity-50 absolute -inset-0 w-[200%] h-[200%] top-[-50%] left-[-50%] z-0 blur-2xl opacity-0 transition-all duration-500"
            style={{
              background:
                "conic-gradient(from 0deg, #ff004c, #ff7a00, #ffee00, #3be04b, #00b7ff, #6a00ff, #ff0080, #ff004c)",
              filter: `blur(${blur}px) saturate(140%)`,
              transformOrigin: "50% 50%",
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          />
          <div className="group relative bg-neutral-800 rounded-xl grid grid-cols-[1fr_1.1fr] gap-2 overflow-hidden">
            <div className="flex flex-col gap-2 py-24 pl-5 relative z-1">
              <h2 className="text-neutral-400 group-hover:text-white font-semibold text-2xl font-sansitia transition-all">
                Check In/Out
              </h2>
              <p className="text-neutral-500 group-hover:text-neutral-400 text-base transition-all">
                Simple check in/out with daily and monthly summaries.
              </p>
            </div>
            <div className="relative w-full h-full overflow-hidden z-1">
              <div className="absolute top-14 right-24 z-1 flex items-center justify-center">
                <AlarmClockCheckIcon className="text-neutral-300 group-hover:text-white size-32" />
                <div className="w-16 h-16 rounded-full transition-all duration-200 ease-linear bg-white/0 group-hover:bg-white/80 blur-2xl absolute" />
              </div>
              <Image
                src="/images/icon-shape.png"
                alt="Shape Image"
                width={150}
                height={150}
                className="w-full object-contain top-7 right-0 absolute rotate-12"
              />
            </div>
            <div className="w-full aspect-square rounded-full absolute left-1/2 -translate-x-1/2 -bottom-[200%] group-hover:-bottom-[150%] bg-black/20 z-0 blur-xl transition-all duration-1000 ease-in-out" />
          </div>
        </div>
        <div className="group relative bg-black/15 p-2 rounded-xl transition-all duration-300 overflow-hidden">
          <motion.div
            aria-hidden
            className="group-hover:opacity-50 absolute -inset-0 w-[200%] h-[200%] top-[-50%] left-[-50%] z-0 blur-2xl opacity-0 transition-all duration-500"
            style={{
              background:
                "conic-gradient(from 0deg, #ff004c, #ff7a00, #ffee00, #3be04b, #00b7ff, #6a00ff, #ff0080, #ff004c)",
              filter: `blur(${blur}px) saturate(140%)`,
              transformOrigin: "50% 50%",
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          />
          <div className="group relative bg-neutral-800 rounded-xl grid grid-cols-[1fr_1.1fr] gap-2 overflow-hidden">
            <div className="flex flex-col gap-2 py-24 pl-5 relative z-1">
              <h2 className="text-neutral-400 group-hover:text-white font-semibold text-2xl font-sansitia transition-all">
                Project Management
              </h2>
              <p className="text-neutral-500 group-hover:text-neutral-400 text-base transition-all">
                Easy project assignment with real-time progress tracking.
              </p>
            </div>
            <div className="relative w-full h-full overflow-hidden z-1">
              <div className="absolute top-14 right-24 z-1 flex items-center justify-center">
                <FolderRootIcon className="text-neutral-300 group-hover:text-white size-32" />
                <div className="w-16 h-16 rounded-full transition-all duration-200 ease-linear bg-white/0 group-hover:bg-white/80 blur-2xl absolute" />
              </div>
              <Image
                src="/images/icon-shape.png"
                alt="Shape Image"
                width={150}
                height={150}
                className="w-full object-contain top-7 right-0 absolute rotate-12"
              />
            </div>
            <div className="w-full aspect-square rounded-full absolute left-1/2 -translate-x-1/2 -bottom-[200%] group-hover:-bottom-[150%] bg-black/20 z-0 blur-xl transition-all duration-1000 ease-in-out" />
          </div>
        </div>
        <div className="group relative bg-black/15 p-2 rounded-xl transition-all duration-300 overflow-hidden">
          <motion.div
            aria-hidden
            className="group-hover:opacity-50 absolute -inset-0 w-[200%] h-[200%] top-[-50%] left-[-50%] z-0 blur-2xl opacity-0 transition-all duration-500"
            style={{
              background:
                "conic-gradient(from 0deg, #ff004c, #ff7a00, #ffee00, #3be04b, #00b7ff, #6a00ff, #ff0080, #ff004c)",
              filter: `blur(${blur}px) saturate(140%)`,
              transformOrigin: "50% 50%",
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          />
          <div className="group relative bg-neutral-800 rounded-xl grid grid-cols-[1fr_1.1fr] gap-2 overflow-hidden">
            <div className="flex flex-col gap-2 py-24 pl-5 relative z-1">
              <h2 className="text-neutral-400 group-hover:text-white font-semibold text-2xl font-sansitia">
                Chats
              </h2>
              <p className="text-neutral-500 group-hover:text-neutral-400 text-base">
                Chat instantly with your team and create groups easily.
              </p>
            </div>
            <div className="relative w-full h-full overflow-hidden z-1">
              <div className="absolute top-14 right-24 z-1 flex items-center justify-center">
                <MessageCircleIcon className="text-neutral-300 group-hover:text-white size-32" />
                <div className="w-16 h-16 rounded-full transition-all duration-200 ease-linear bg-white/0 group-hover:bg-white/80 blur-2xl absolute" />
              </div>
              <Image
                src="/images/icon-shape.png"
                alt="Shape Image"
                width={150}
                height={150}
                className="w-full object-contain top-7 right-0 absolute rotate-12"
              />
            </div>
            <div className="w-full aspect-square rounded-full absolute left-1/2 -translate-x-1/2 -bottom-[200%] group-hover:-bottom-[150%] bg-black/20 z-0 blur-xl transition-all duration-1000 ease-in-out" />
          </div>
        </div>
        <div className="group relative bg-black/15 p-2 rounded-xl transition-all duration-300 overflow-hidden">
          <motion.div
            aria-hidden
            className="group-hover:opacity-50 absolute -inset-0 w-[200%] h-[200%] top-[-50%] left-[-50%] z-0 blur-2xl opacity-0 transition-all duration-500"
            style={{
              background:
                "conic-gradient(from 0deg, #ff004c, #ff7a00, #ffee00, #3be04b, #00b7ff, #6a00ff, #ff0080, #ff004c)",
              filter: `blur(${blur}px) saturate(140%)`,
              transformOrigin: "50% 50%",
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          />
          <div className="group relative bg-neutral-800 rounded-xl grid grid-cols-[1fr_1.1fr] gap-2 overflow-hidden">
            <div className="flex flex-col gap-2 py-24 pl-5 relative z-1">
              <h2 className="text-neutral-400 group-hover:text-white font-semibold text-2xl font-sansitia">
                Multiple Brands
              </h2>
              <p className="text-neutral-500 group-hover:text-neutral-400 text-base">
                Manage multiple brands and teams effortlessly.
              </p>
            </div>
            <div className="relative w-full h-full overflow-hidden z-1">
              <div className="absolute top-14 right-24 z-1 flex items-center justify-center">
                <BoxesIcon className="text-neutral-300 group-hover:text-white size-32" />
                <div className="w-16 h-16 rounded-full transition-all duration-200 ease-linear bg-white/0 group-hover:bg-white/80 blur-2xl absolute" />
              </div>
              <Image
                src="/images/icon-shape.png"
                alt="Shape Image"
                width={150}
                height={150}
                className="w-full object-contain top-7 right-0 absolute rotate-12"
              />
            </div>
            <div className="w-full aspect-square rounded-full absolute left-1/2 -translate-x-1/2 -bottom-[200%] group-hover:-bottom-[150%] bg-black/20 z-0 blur-xl transition-all duration-1000 ease-in-out" />
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
};
