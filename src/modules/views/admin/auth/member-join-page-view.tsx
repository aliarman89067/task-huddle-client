"use client";
import { CTAButton } from "@/components/cta-button";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { UserPros } from "@/index";
import { axiosInstance } from "@/lib/axios-instance";
import { getServerError } from "@/lib/utils";
import { userStore } from "@/zustand/user.store";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { CircleAlertIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  invitationId: string;
  organization: {
    id: string;
    name: string;
    imageUrl: string;
  };
  member: {
    id: string;
    name: string;
    email: string;
  };
}

type VerifyEmailType = {
  organizationId: string;
  invitationId: string;
  name: string;
  memberId: string;
  email: string;
  otp: string;
};

export const MemberJoinPageView = ({
  invitationId,
  member,
  organization,
}: Props) => {
  const router = useRouter();
  const { setUser } = userStore();

  const [step, setStep] = useState<"SETUP" | "OTP">("SETUP");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [timer, setTimer] = useState(0);
  const [isNotCooldown, setIsNotCooldown] = useState(false);

  const joinMutation = useMutation({
    mutationFn: async () => {
      const data = {
        name: member.name,
        email: member.email,
        organizationId: organization.id,
        invitationId,
      };
      const res = await axiosInstance.post("/auth/send-member-join-otp", data);
      return res.data;
    },
    onSuccess: () => {
      setStep("OTP");
      setTimer(60);
      setIsNotCooldown(true);
      handleStartTimer();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message || "Something went wrong!";
      setError(message);
    },
  });

  const resendOTPMutation = useMutation({
    mutationFn: async (data: { email: string; name: string }) => {
      const response = await axiosInstance.post(
        "/auth/resend-member-otp",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      setTimer(60);
      setIsNotCooldown(true);
      handleStartTimer();
    },
    onError: (error: any) => {
      getServerError({ error, setServerError });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (data: VerifyEmailType) => {
      const response = await axiosInstance.post(
        "/auth/verify-member-join-email",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      const adminData: UserPros = {
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        image: data.data.image,
        role: "member",
        createdAt: data.data.createdAt,
      };
      setUser(adminData);
      router.push("/dashboard");
    },
    onError: (error: any) => {
      getServerError({ error, setServerError });
    },
  });

  const handleStartTimer = () => {
    const intervalId = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(intervalId);
          setIsNotCooldown(false);
          return prev;
        } else {
          return prev - 1;
        }
      });
    }, 1000);
  };

  const resendOTP = () => {
    setServerError("");
    const data = {
      name: member.name,
      email: member.email,
    };
    resendOTPMutation.mutate(data);
  };

  const verifyEmail = () => {
    setServerError("");
    setError("");
    if (!otp) {
      setError("Please enter the OTP!");
      return;
    }
    if (otp.length !== 4) {
      setError("Your OTP must be exactly 4 digits.");
      return;
    }
    const data: VerifyEmailType = {
      organizationId: organization.id,
      invitationId: invitationId,
      name: member.name,
      email: member.email,
      memberId: member.id,
      otp,
    };
    verifyEmailMutation.mutate(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="relative z-10 bg-white/70 shadow-2xl backdrop-blur-xs rounded-xl px-4 py-6 w-[45%] border border-neutral-300 flex flex-col left-28 overflow-hidden"
    >
      <div className="w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl absolute -left-[50px] bottom-0 " />
      {step === "SETUP" && (
        <>
          <div className="flex flex-col items-center z-1">
            <h3 className="text-foreground font-semibold text-2xl text-center">
              Invitation to Join {organization.name}
            </h3>
            <p className="text-neutral-600 text-lg text-center">
              You&apos;ve been invited to become a member of {organization.name}
              . Join us and start collaborating with our team today.
            </p>
          </div>
          <div className="mt-6 max-w-sm w-full mx-auto space-y-3 z-1">
            <div className="flex flex-col items-center w-full gap-3">
              <Image
                src={organization.imageUrl}
                alt={`${organization.name} image`}
                width={100}
                height={100}
                className="object-contain"
              />
              <h2 className="text-neutral-800 text-3xl font-bold font-sansitia">
                {organization.name}
              </h2>
              <Button
                disabled={joinMutation.isPending}
                onClick={() => joinMutation.mutate()}
                type="submit"
                className="w-full"
              >
                {joinMutation.isPending ? "Please wait..." : "Join"}
              </Button>
            </div>
          </div>
        </>
      )}
      {step === "OTP" && (
        <div className="flex flex-col max-w-sm w-full mx-auto">
          <div className="flex flex-col items-center z-1">
            <h3 className="text-foreground font-semibold text-2xl text-center">
              Verify Your Email
            </h3>
            <p className="text-neutral-600 text-lg text-center">
              We've send an verification code to your email.
            </p>
          </div>
          <div className="flex justify-center my-4">
            <InputOTP
              maxLength={4}
              minLength={4}
              pattern={REGEXP_ONLY_DIGITS}
              onChange={(value) => setOtp(String(value))}
            >
              <InputOTPGroup>
                <InputOTPSlot
                  index={0}
                  className="w-11 h-11 border-neutral-400"
                />
                <InputOTPSlot
                  index={1}
                  className="w-11 h-11 border-neutral-400"
                />
                <InputOTPSlot
                  index={2}
                  className="w-11 h-11 border-neutral-400"
                />
                <InputOTPSlot
                  index={3}
                  className="w-11 h-11 border-neutral-400"
                />
              </InputOTPGroup>
            </InputOTP>
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center mb-3">{error}</p>
          )}
          <Button
            disabled={
              resendOTPMutation.isPending || verifyEmailMutation.isPending
            }
            onClick={verifyEmail}
            type="submit"
            className="w-full relative z-10"
          >
            {verifyEmailMutation.isPending ? "Please Wait..." : "Verify Email"}
          </Button>
          <Button
            disabled={
              isNotCooldown ||
              resendOTPMutation.isPending ||
              verifyEmailMutation.isPending
            }
            onClick={resendOTP}
            variant="outline"
            className="mt-4 relative z-10"
          >
            {resendOTPMutation.isPending ? (
              <>Please Wait...</>
            ) : (
              <>{isNotCooldown ? `Resend OTP (${timer} s)` : "Resend OTP"}</>
            )}
          </Button>
        </div>
      )}
      {serverError && (
        <p className="text-red-500 text-sm text-center mt-1 flex items-center gap-1 justify-center">
          <CircleAlertIcon className="size-4 text-red-500" /> {serverError}
        </p>
      )}
    </motion.div>
  );
};
