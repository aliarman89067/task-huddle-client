import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios-instance";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { CircleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface Props {
  form: UseFormReturn<
    {
      email: string;
      otp: string;
      newPassword: string;
    },
    any,
    {
      email: string;
      otp: string;
      newPassword: string;
    }
  >;
}

export const ForgotPassword = ({ form }: Props) => {
  const router = useRouter();

  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const response = await axiosInstance.post("/auth/forgot-password", data);
      return response.data;
    },
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message || "Something went wrong";
      setServerError(message);
    },
  });

  const handleResetPassword = () => {
    setError("");
    setServerError("");
    const email = form.getValues("email");
    const otp = form.getValues("otp");
    const password = form.getValues("newPassword");
    if (!email) {
      setError("Email is required!");
      return;
    }
    if (!otp) {
      setError("OTP is required!");
      return;
    }
    if (otp.length !== 4) {
      setError("Your OTP must be exactly 4 digits!");
      return;
    }
    const data = {
      otp,
      password,
      email,
    };
    resetPasswordMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        className="max-w-sm w-full mx-auto mt-6 space-y-3 z-1"
        onSubmit={form.handleSubmit(handleResetPassword)}
      >
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}
        <Button
          disabled={resetPasswordMutation.isPending}
          onClick={handleResetPassword}
          type="submit"
          className="w-full"
        >
          {resetPasswordMutation.isPending
            ? "Please wait..."
            : "Reset Password"}
        </Button>
        {serverError && (
          <p className="text-red-500 text-sm text-center mt-1 flex items-center my-4 gap-1 justify-center">
            <CircleAlertIcon className="size-4 text-red-500" /> {serverError}
          </p>
        )}
      </form>
    </Form>
  );
};
