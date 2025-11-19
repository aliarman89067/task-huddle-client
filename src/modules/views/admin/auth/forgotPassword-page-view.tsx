"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { ForgotPasswordEmail } from "./components/forgot-password-email";
import { ForgotPasswordOTP } from "./components/forgot-password-otp";
import { ForgotPassword } from "./components/forgot-password";
import Link from "next/link";

export const ForgotPasswordPageView = () => {
  const [step, setStep] = useState<"email" | "otp" | "password">("email");

  const formSchema = z.object({
    email: z.email({ message: "Email is required!" }),
    otp: z
      .string()
      .min(4, { message: "Your OTP must be exactly 4 digits." })
      .max(4, { message: "Your OTP must be exactly 4 digits." }),
    newPassword: z.string().min(1, { message: "Password is required!" }),
  });

  type FormSchemaType = z.infer<typeof formSchema>;

  const form = useForm<FormSchemaType>({
    defaultValues: {
      email: "",
      otp: "",
      newPassword: "",
    },
    resolver: zodResolver(formSchema),
  });

  const getTitle = () => {
    if (step === "email") {
      return "Enter Your Email";
    } else if (step === "otp") {
      return "Enter Your OTP";
    } else {
      return "Enter Your New Password";
    }
  };

  const getDescription = () => {
    if (step === "email") {
      return "Enter the email address associated with your account to reset your password.";
    } else if (step === "otp") {
      return "We've send an verification code to your email.";
    } else {
      return "Enter your new password. Keep it strong and secure.";
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="relative z-10 bg-white/70 shadow-2xl backdrop-blur-xs rounded-xl px-4 py-6 w-[45%] border border-neutral-300 flex flex-col left-28 overflow-hidden"
    >
      <div className="w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl absolute -left-[50px] bottom-0 " />
      <div className="flex flex-col max-w-sm w-full mx-auto">
        <div className="flex flex-col items-center z-1">
          <h3 className="text-foreground font-semibold text-2xl text-center">
            {getTitle()}
          </h3>
          <p className="text-neutral-600 text-lg text-center">
            {getDescription()}
          </p>
        </div>
        {/* 1. Take related Email */}
        {/* 2. Verify OTP */}
        {/* 3. Enter new password */}
        {step === "email" && (
          <ForgotPasswordEmail form={form} setStep={setStep} />
        )}
        {step === "otp" && <ForgotPasswordOTP form={form} setStep={setStep} />}
        {step === "password" && <ForgotPassword form={form} />}
        <p className="text-sm mt-3">
          Go back to{" "}
          <Link
            href="/login"
            className="text-blue-500 underline underline-offset-2"
          >
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
