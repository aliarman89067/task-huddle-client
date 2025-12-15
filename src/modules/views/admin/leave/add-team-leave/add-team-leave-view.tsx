"use client";

import { ErrorCard } from "@/components/error-card";
import { LoadingScreen } from "@/components/loading-screen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { axiosInstance } from "@/lib/axios-instance";
import { useGetAdminOrganization } from "@/lib/common-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { CircleAlertIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  id: string;
}

const formSchema = z.object({
  leaveDates: z
    .array(z.string())
    .min(1, { message: "Please select atleast 1 date!" }),
  members: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .min(1, { message: "Please select atleast 1 member!" }),
  reason: z.string().optional(),
});

type FormSchemaType = z.infer<typeof formSchema>;

export const AddTeamLeaveView = ({ id }: Props) => {
  const queryClient = useQueryClient();

  const [errors, setErrors] = useState<{
    type: "CHECK_EXIST";
    message: string;
  } | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const { data, isPending, error } = useGetAdminOrganization({
    id,
    isMember: true,
  });

  // Mutations
  const createTeamLeaveMutation = useMutation({
    mutationFn: async (data: {
      reason?: string;
      members: {
        id: string;
        name: string;
      }[];
      organizationId: string;
      leaveDates: string[];
      timezone: string;
    }) => {
      const res = await axiosInstance.post("/admin/members/team-leave", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-leave"],
      });
      toast.success("Leaves added successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error?.response?.data.message || "Something went wrong";
      if (message.startsWith("A check is already exists at")) {
        setErrors({
          type: "CHECK_EXIST",
          message,
        });
        return;
      }
      toast.error(message);
    },
  });

  const form = useForm<FormSchemaType>({
    defaultValues: {
      leaveDates: [],
      members: [],
      reason: "",
    },
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (data) {
      form.reset({
        members: data.members.map((item: any) => ({
          id: item.member.id,
          name: item.member.name,
        })),
        leaveDates: [],
        reason: "",
      });
    }
  }, [data]);

  const onSubmit = (data: FormSchemaType) => {
    setErrors(null);
    createTeamLeaveMutation.mutate({
      ...data,
      organizationId: id,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  if (isPending) {
    return <LoadingScreen />;
  }

  if (error && !data) {
    return <ErrorCard title={data} />;
  }
  return (
    <div className="w-full mt-16 flex flex-col">
      <div className="max-w-2xl w-full mx-auto">
        <h1 className="text-neutral-800 font-bold font-sansitia text-2xl">
          Add Team Leaves
        </h1>
        <p className="text-base text-neutral-600">
          Here you can add your team leaves, if you want to add all member
          leaves at once you can do it here.
        </p>
        <div className="flex flex-col mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="leaveDates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave Dates</FormLabel>
                    <FormControl>
                      <div className="flex flex-col">
                        <Input
                          onClick={() => dateInputRef?.current?.showPicker()}
                          ref={dateInputRef}
                          type="date"
                          onChange={(e) => {
                            const date = new Date(e.target.value).toISOString();
                            const isExist = field.value.find(
                              (item) => item === date
                            );
                            if (isExist) return;
                            field.onChange([
                              new Date(e.target.value).toISOString(),
                              ...field.value,
                            ]);
                          }}
                        />
                        <div className="flex flex-wrap gap-3 mt-3">
                          {field.value?.map((date, index) => (
                            <div
                              key={index}
                              onClick={() => {
                                const updatedDates = field.value.filter(
                                  (_, i) => i !== index
                                );
                                field.onChange(updatedDates);
                              }}
                              className="relative px-7 py-2 rounded-lg bg-foreground text-white text-sm"
                            >
                              <span className="cursor-pointer absolute -right-1 -top-1 bg-rose-400 hover:bg-rose-500 rounded-full w-5 h-5 flex items-center justify-center">
                                <XIcon className="text-white size-4" />
                              </span>
                              {new Date(date).toLocaleDateString()}
                            </div>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="members"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Members</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-3 mt-3">
                        {data?.members?.map((item: any, index: number) => (
                          <label
                            key={index}
                            className="w-full flex items-center gap-2 justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="w-14 h-14">
                                <AvatarImage
                                  src={item?.member?.image}
                                  alt={`${item?.member?.name} image`}
                                />
                                <AvatarFallback>
                                  {item?.member?.name.substring(0, 1)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <h3 className="text-base font-semibold text-neutral-700">
                                  {item?.member?.name}
                                </h3>
                                <span className="text-sm text-neutral-500">
                                  {item?.member?.email}
                                </span>
                              </div>
                            </div>
                            <Checkbox
                              checked={
                                !!field.value.find(
                                  (member) => member.id === item?.member?.id
                                )
                              }
                              onCheckedChange={() => {
                                const isExist = field.value.find(
                                  (member) => member.id === item?.member?.id
                                );
                                if (isExist) {
                                  let updatedValues = [...field.value];
                                  updatedValues = updatedValues.filter(
                                    (member) => member.id !== item?.member?.id
                                  );
                                  field.onChange(updatedValues);
                                } else {
                                  field.onChange([
                                    ...field.value,
                                    {
                                      id: item?.member?.id,
                                      name: item?.member?.name,
                                    },
                                  ]);
                                }
                              }}
                              className="w-5 h-5 border-neutral-400"
                            />
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Sick leave..."
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {errors && errors.type === "CHECK_EXIST" ? (
                <span className="flex items-center gap-2 text-sm text-rose-400">
                  <CircleAlertIcon /> {errors.message}
                </span>
              ) : null}
              <Button
                disabled={createTeamLeaveMutation.isPending}
                className="bg-green-500 hover:bg-green-600"
              >
                {createTeamLeaveMutation.isPending
                  ? "Please wait..."
                  : "Add Leaves"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};
