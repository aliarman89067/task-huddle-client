"use client";
import Lottie from "lottie-react";
import loadingAnimation from "../../public/animations/Loading circles.json";

export const LoadingScreen = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center gap-2">
      <Lottie
        animationData={loadingAnimation}
        loop
        className="w-32 object-contain"
      />
    </div>
  );
};
