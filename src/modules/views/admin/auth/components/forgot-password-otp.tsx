import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { axiosInstance } from "@/lib/axios-instance";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { REGEXP_ONLY_DIGITS } from "input-otp";
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
export const ForgotPasswordOTP = ({ form, setStep }: Props) => {
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");

  const verifyOTPMutation = useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const response = await axiosInstance.post(
        "/auth/verify-forgot-password-otp",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      setStep("password");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message || "Something went wrong";
      setServerError(message);
    },
  });

  const handleVerifyOTP = () => {
    setError("");
    setServerError("");
    const email = form.getValues("email");
    const otp = form.getValues("otp");
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
      email,
      otp,
    };
    verifyOTPMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        className="max-w-sm w-full mx-auto mt-6 space-y-3 z-1"
        onSubmit={form.handleSubmit(handleVerifyOTP)}
      >
        <div className="flex justify-center">
          <InputOTP
            maxLength={4}
            minLength={4}
            pattern={REGEXP_ONLY_DIGITS}
            onChange={(value) => form.setValue("otp", String(value))}
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
          disabled={verifyOTPMutation.isPending}
          onClick={handleVerifyOTP}
          type="submit"
          className="w-full"
        >
          {verifyOTPMutation.isPending ? "Please wait..." : "Verify OTP"}
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
