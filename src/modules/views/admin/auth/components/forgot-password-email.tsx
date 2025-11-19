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
import { Dispatch, SetStateAction, useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface Props {
  setStep: Dispatch<SetStateAction<"email" | "otp" | "password">>;
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

export const ForgotPasswordEmail = ({ setStep, form }: Props) => {
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");

  const sendOTPMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await axiosInstance.post(
        "/auth/forgot-password-otp",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      setStep("otp");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message || "Something went wrong";
      setServerError(message);
    },
  });

  const handleSendOTP = () => {
    setError("");
    setServerError("");
    const email = form.getValues("email");
    if (!email) {
      setError("Email is required!");
      return;
    }
    const data = {
      email,
    };
    sendOTPMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        className="max-w-sm w-full mx-auto mt-6 space-y-3 z-1"
        onSubmit={form.handleSubmit(handleSendOTP)}
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
        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}
        <Button
          disabled={sendOTPMutation.isPending}
          onClick={handleSendOTP}
          type="submit"
          className="w-full"
        >
          {sendOTPMutation.isPending ? "Please wait..." : "Send OTP"}
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
