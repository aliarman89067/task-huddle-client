"use client";
import { LoadingScreen } from "@/components/loading-screen";
import OrganizationInfo from "@/components/organization-info";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios-instance";
import { useGetAdminOrganization } from "@/lib/common-query";
import { getServerError } from "@/lib/utils";
import { organizationStore } from "@/zustand/member.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NoOrganization } from "@/constant";
import { EmptyOrganization } from "@/components/empty-organization";
import { ErrorCard } from "@/components/error-card";
import { useGetQueryError } from "@/hooks/use-get-query-error";

export const CheckInOutPageView = () => {
  const { selectedOrganizationId } = organizationStore();
  const [serverError, setServerError] = useState("");
  const inputRef1 = useRef<HTMLInputElement | null>(null);
  const inputRef2 = useRef<HTMLInputElement | null>(null);

  // Queries
  const { data, error, isPending, isSuccess, refetch } =
    useGetAdminOrganization({
      id: selectedOrganizationId!,
    });
  const {
    data: checkInOutData,
    error: checkInOutError,
    isPending: checkInOutPending,
  } = useQuery({
    queryKey: ["get-check-in-out"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/checks/get-settings/${data.id}`
      );
      return res.data;
    },
    retry: !!selectedOrganizationId,
    refetchOnWindowFocus: !!selectedOrganizationId,
  });

  // Mutations
  const mutation = useMutation({
    mutationFn: async ({
      checkIn,
      checkOut,
      gracePeriod,
    }: {
      gracePeriod?: number;
      checkIn: {
        checkInHour: number;
        checkInMinute: number;
        time: "AM" | "PM";
      };
      checkOut: {
        checkOutHour: number;
        checkOutMinute: number;
        time: "AM" | "PM";
      };
    }) => {
      const requestData = {
        checkIn,
        checkOut,
        organizationId: data.id,
        gracePeriod,
      };
      const res = await axiosInstance.post(
        "/admin/checks/set-check-in-out",
        requestData
      );
      return res.data;
    },
    onSuccess: (data) => {
      console.log(data);
      toast.success("Check in/out updated successfully.");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      getServerError({ error, setServerError });
    },
  });

  //   Form Schema
  const formSchema = z.object({
    checkInTime: z.string().min(1, { message: "Check in timing is required!" }),
    checkOutTime: z
      .string()
      .min(1, { message: "Check out timing is required!" }),
    gracePeriod: z.number().optional(),
  });

  type FormSchemaType = z.infer<typeof formSchema>;

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkInTime: "",
      checkOutTime: "",
    },
  });

  useEffect(() => {
    if (checkInOutData) {
      form.reset({
        checkInTime: `${
          checkInOutData
            ? String(checkInOutData.checkInTime.checkInHour).padStart(2, "0") +
              ":" +
              String(checkInOutData.checkInTime.checkInMinute).padStart(2, "0")
            : ""
        }`,
        checkOutTime: `${
          checkInOutData
            ? String(checkInOutData.checkOutTime.checkOutHour).padStart(
                2,
                "0"
              ) +
              ":" +
              String(checkInOutData.checkOutTime.checkOutMinute).padStart(
                2,
                "0"
              )
            : ""
        }`,
        gracePeriod: checkInOutData?.gracePeriod,
      });
    }
  }, [checkInOutData]);

  const onSubmit = async (data: FormSchemaType) => {
    const [checkInHour, checkInMinute] = data.checkInTime.split(":");
    const [checkOutHour, checkOutMinute] = data.checkOutTime.split(":");

    let checkInAMPM: "AM" | "PM" = "AM";
    let IntCheckInHour = parseInt(checkInHour);
    let IntCheckInMinute = parseInt(checkInMinute);

    if (IntCheckInHour >= 12) {
      checkInAMPM = "PM";
    }
    if (IntCheckInHour === 0) {
      checkInAMPM = "AM";
    }

    let checkOutAMPM: "AM" | "PM" = "AM";
    let IntCheckOutHour = parseInt(checkOutHour);
    let IntCheckOutMinute = parseInt(checkOutMinute);

    // Handle AM/PM conversion for check-out
    if (IntCheckOutHour >= 12) {
      checkOutAMPM = "PM";
    }
    if (IntCheckOutHour === 0) {
      checkOutAMPM = "AM";
    }

    mutation.mutate({
      gracePeriod: data.gracePeriod,
      checkIn: {
        checkInHour: IntCheckInHour,
        checkInMinute: IntCheckInMinute,
        time: checkInAMPM,
      },
      checkOut: {
        checkOutHour: IntCheckOutHour,
        checkOutMinute: IntCheckOutMinute,
        time: checkOutAMPM,
      },
    });
  };

  if (isPending || checkInOutPending) {
    return <LoadingScreen />;
  }

  if (error && !isSuccess) {
    if (error === NoOrganization) {
      return <EmptyOrganization />;
    } else {
      return <ErrorCard title="Oops!!" description={error} />;
    }
  }
  if (checkInOutError) {
    const { errorMessage } = useGetQueryError(
      checkInOutError as AxiosError<{ message: string }>
    );
    return <ErrorCard title="Oops!!" description={errorMessage} />;
  }
  return (
    <section className="flex flex-col">
      <OrganizationInfo title={data.name} />
      <div className="w-full mt-5 flex flex-col">
        <div className="max-w-2xl w-full mx-auto">
          <h1 className="text-neutral-800 font-bold font-sansitia text-2xl">
            Check-In / Check-Out Settings
          </h1>
          <p className="text-base text-neutral-600">
            Adjust the check-in and check-out times. These changes will
            automatically update the check-in/check-out schedule for all
            members, ensuring that their times are aligned with the new admin
            settings.
          </p>
          <div className="flex flex-col mt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="checkInTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check In</FormLabel>
                        <div
                          onClick={() => inputRef1.current?.showPicker?.()}
                          className="relative"
                        >
                          <FormControl>
                            <Input
                              ref={inputRef1}
                              type="time"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="checkOutTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check Out</FormLabel>
                        <FormControl>
                          <div
                            onClick={() => inputRef2.current?.showPicker?.()}
                            className="relative"
                          >
                            <Input
                              ref={inputRef2}
                              type="time"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gracePeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grace Period Minute (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              {...field}
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  disabled={mutation.isPending}
                  type="submit"
                  className="bg-green-500 hover:bg-green-600"
                >
                  {mutation.isPending ? "Updating..." : "Update"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};
