"use client";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { axiosInstance } from "@/lib/axios-instance";
import { useState } from "react";
import { CircleAlertIcon } from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { userStore } from "@/zustand/user.store";
import { UserPros } from "@/index";
import { useRouter } from "next/navigation";
import { getServerError } from "@/lib/utils";

export const SignupPageView = () => {
  const router = useRouter();
  const [step, setStep] = useState<"SETUP" | "OTP">("SETUP");
  const [serverError, setServerError] = useState("");
  const [timer, setTimer] = useState(0);
  const [isNotCooldown, setIsNotCooldown] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  // User Store
  const { setUser } = userStore();

  // Mutations
  const sendOTPMutation = useMutation({
    mutationFn: async (data: SignupSchemeType) => {
      const response = await axiosInstance.post("/auth/send-otp", data);
      return response.data;
    },
    onSuccess: () => {
      setStep("OTP");
      setTimer(60);
      setIsNotCooldown(true);
      handleStartTimer();
    },
    onError: (error: any) => {
      getServerError({ error, setServerError });
    },
  });

  const resendOTPMutation = useMutation({
    mutationFn: async (data: { email: string; name: string }) => {
      const response = await axiosInstance.post("/auth/resend-otp", data);
      return response.data;
    },
    onSuccess: () => {
      setTimer(60);
      setIsNotCooldown(true);
      handleStartTimer();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.log(error);
      setServerError(error.response?.data?.message || "Something went wrong!");
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const response = await axiosInstance.post("/auth/verify-email", data);
      return response.data;
    },
    onSuccess: (data) => {
      const adminData: UserPros = {
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        image: data.data.image,
        role: "admin",
        createdAt: data.data.createdAt,
      };
      setUser(adminData);
      router.push("/dashboard");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.log(error);
      setServerError(error.response?.data.message || "Something went wrong.");
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

  const signupSchema = z.object({
    name: z
      .string({ message: "Name is required!" })
      .min(1, { message: "Name is required!" }),
    email: z.email({ message: "Email is required!" }),
    password: z.string().min(1, { message: "Password is required!" }),
  });

  type SignupSchemeType = z.infer<typeof signupSchema>;

  const form = useForm<SignupSchemeType>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(signupSchema),
  });

  const resendOTP = () => {
    setServerError("");
    const data = {
      email: form.getValues("email"),
      name: form.getValues("name"),
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

    const data = {
      name: form.getValues("name"),
      email: form.getValues("email"),
      password: form.getValues("password"),
      otp,
    };
    verifyEmailMutation.mutate(data);
  };

  const onSubmit = async (data: SignupSchemeType) => {
    setServerError("");
    sendOTPMutation.mutate(data);
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
              Signup
            </h3>
            <p className="text-neutral-600 text-lg text-center">
              Nice to meet you signup to continue.
            </p>
          </div>
          {/* <button
            type="button"
            className="max-w-sm mx-auto w-full bg-white border border-neutral-300 rounded-md py-3 cursor-pointer flex items-center justify-center gap-1 my-4 text-base font-semibold text-neutral-800 z-1"
          >
            Google
            <Image
              src="/images/google-icon.png"
              alt="Google icon"
              width={15}
              height={15}
            />
          </button> */}
          <div className="flex items-center max-w-sm w-full mx-auto z-1">
            <div className="h-[1px] w-full bg-neutral-200" />
            <span className="bg-white whitespace-nowrap px-2 text-neutral-400 text-sm">
              Or Continue With
            </span>
            <div className="h-[1px] w-full bg-neutral-200" />
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-w-sm w-full mx-auto mt-6 space-y-3 z-1"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                disabled={sendOTPMutation.isPending}
                type="submit"
                className="w-full"
              >
                {sendOTPMutation.isPending ? "Please wait..." : "Signup"}
              </Button>
              <p className="text-sm text-neutral-600 text-center">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-500 underline underline-offset-2"
                >
                  Login
                </Link>
              </p>
              <p className="text-sm text-neutral-500 text-center">
                You can create an admin account from here to manage users and
                access admin features.
              </p>
            </form>
          </Form>
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
