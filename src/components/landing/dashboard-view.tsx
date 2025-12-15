import { MaxWidthWrapper } from "./max-width-wrapper";
import { motion } from "framer-motion";

export const DashboardView = () => {
  return (
    <MaxWidthWrapper>
      <div className="flex flex-col items-center gap-5">
        <h1 className="font-sansitia text-neutral-800 text-4xl font-bold text-center">
          Powerful HR tools built for fast moving teams.
        </h1>
        <div className="w-full">
          <div className="relative px-4 py-4 rounded-xl w-full h-full overflow-hidden">
            <div className="w-full h-full absolute top-0 left-0 bg-white/60 backdrop-blur-xl z-1" />
            <motion.div
              aria-hidden
              className="absolute -inset-0 w-[200%] h-[200%] top-[-50%] left-[-50%] z-0 blur-2xl opacity-50"
              style={{
                background:
                  "conic-gradient(from 0deg, #ff004c, #ff7a00, #ffee00, #3be04b, #00b7ff, #6a00ff, #ff0080, #ff004c)",
                filter: `blur(10px) saturate(140%)`,
                transformOrigin: "50% 50%",
              }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            />

            <div className="relative p-2.5 rounded-xl w-full h-full z-10">
              <div className="bg-white/50 backdrop-blur-lg w-full h-full absolute top-0 left-0 rounded-xl" />
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <img
                  src="/images/dashboard.png"
                  alt="Dashboard Image"
                  className="w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
};
