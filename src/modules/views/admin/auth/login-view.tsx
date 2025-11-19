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
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance";
import { AxiosError } from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { userStore } from "@/zustand/user.store";
import { CircleAlertIcon } from "lucide-react";

export const LoginPageView = () => {
  const router = useRouter();
  const { setUser } = userStore();
  const [serverError, setServerError] = useState("");

  const loginSchema = z.object({
    email: z.email({ message: "Email is required!" }),
    password: z.string().min(1, { message: "Password is required!" }),
  });

  // Mutations
  const loginMutation = useMutation({
    mutationFn: async (data: LoginSchemeType) => {
      const response = await axiosInstance.post("/auth/sign-in", data);
      return response.data.data;
    },
    onError: (error: AxiosError<{ message: string }>) => {
      setServerError(error.response?.data.message || "Something went wrong!");
    },
    onSuccess: (data) => {
      setUser(data);
      router.push("/dashboard");
    },
  });

  type LoginSchemeType = z.infer<typeof loginSchema>;

  const form = useForm<LoginSchemeType>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchemeType) => {
    setServerError("");
    loginMutation.mutate(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="relative z-10 bg-white/70 shadow-2xl backdrop-blur-xs rounded-xl px-4 py-6 w-[45%] border border-neutral-300 flex flex-col left-28 overflow-hidden"
    >
      <div className="w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl absolute -left-[50px] bottom-0 " />
      <div className="flex flex-col items-center z-1">
        <h3 className="text-foreground font-semibold text-2xl text-center">
          Login
        </h3>
        <p className="text-neutral-600 text-lg text-center">
          Welcome back login to continue.
        </p>
      </div>
      <button
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
      </button>
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
          <span className="w-full flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-500 underline underline-offset-2"
            >
              Forgot Password?
            </Link>
          </span>
          <Button
            disabled={loginMutation.isPending}
            type="submit"
            className="w-full"
          >
            {loginMutation.isPending ? "Please wait..." : "Login"}
          </Button>
          <p className="text-sm text-neutral-600 text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-blue-500 underline underline-offset-2"
            >
              Signup
            </Link>
          </p>
          <p className="text-sm text-neutral-500 text-center">
            Both admins and members can log in using this form.
          </p>
        </form>
      </Form>
      {serverError && (
        <p className="text-red-500 text-sm text-center mt-1 flex items-center gap-1 justify-center">
          <CircleAlertIcon className="size-4 text-red-500" /> {serverError}
        </p>
      )}
    </motion.div>
  );
};
