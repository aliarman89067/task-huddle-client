"use client";
import { EmptyOrganization } from "@/components/empty-organization";
import { ErrorCard } from "@/components/error-card";
import { LoadingScreen } from "@/components/loading-screen";
import OrganizationInfo from "@/components/organization-info";
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
import { NoOrganization } from "@/constant";
import { axiosInstance } from "@/lib/axios-instance";
import { useGetAdminOrganization } from "@/lib/common-query";
import { organizationStore } from "@/zustand/member.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const generateUniqueDigits = () => {
  const allDigits = Array.from({ length: 10 }, (_, i) => i.toString());
  const shuffled = allDigits.sort(() => Math.random() - 0.5); // shuffle
  return shuffled.join("");
};

const addMemberFormSchema = z.object({
  members: z
    .array(
      z.object({
        id: z.string(),
        designation: z.string().min(1, { message: "Designation is required!" }),
        email: z
          .string()
          .min(1, { message: "Email is required!" })
          .email({ message: "Invalid email format!" }),
      })
    )
    .min(1, { message: "Atleast 1 member is required!" })
    .superRefine((emails, ctx) => {
      if (!emails) return;

      // Filter out empty emails
      const nonEmptyEmails = emails.filter((e) => e.email.trim() !== "");

      const seen = new Set<string>();
      nonEmptyEmails.forEach((entry, index) => {
        const email = entry.email.toLowerCase();
        if (seen.has(email)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Duplicate email address is not allowed",
            path: [index, "email"],
          });
        } else {
          seen.add(email);
        }
      });
    }),
});

type AddMemberFormSchemaType = z.infer<typeof addMemberFormSchema>;

const AddMembers = () => {
  const [error, setError] = useState("");
  const router = useRouter();
  const { selectedOrganizationId } = organizationStore();
  const {
    data: organizationData,
    isPending: isOrganizationPending,
    error: organizationError,
    isSuccess,
    refetch,
  } = useGetAdminOrganization({ id: selectedOrganizationId!, isMember: true });

  // Mutations
  const addMutation = useMutation({
    mutationFn: async (
      data: AddMemberFormSchemaType & { organizationId: string }
    ) => {
      setError("");
      const res = await axiosInstance.post("/admin/members/add-members", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Members added successfully");
      router.push("/dashboard/members");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error?.response?.data.message || "Something went wrong!";
      setError(message);
    },
  });

  const form = useForm<AddMemberFormSchemaType>({
    defaultValues: {
      members: [
        {
          id: generateUniqueDigits(),
          email: "",
          designation: "",
        },
      ],
    },
    resolver: zodResolver(addMemberFormSchema),
    mode: "onChange",
  });

  useEffect(() => {
    refetch();
  }, []);

  const handleAddEmail = () => {
    const id = generateUniqueDigits();
    const members = form.getValues("members") || [];
    form.setValue("members", [...members, { id, email: "", designation: "" }], {
      shouldValidate: true,
    });
  };

  const handleDeleteEmail = (id: string) => {
    const members = form.getValues("members");
    if (!members || members.length === 0) return;
    const remainingMembers = members.filter((member) => member.id !== id);
    form.setValue("members", remainingMembers, {
      shouldValidate: true,
    });
  };

  if (isOrganizationPending) {
    return <LoadingScreen />;
  }
  if (organizationError && !isSuccess) {
    if (organizationError === NoOrganization) {
      return <EmptyOrganization />;
    } else {
      return <ErrorCard title="Oops!!" description={error} />;
    }
  }
  return (
    <div>
      <OrganizationInfo title={organizationData?.name} />
      <div className="w-full mt-16 flex flex-col">
        <div className="max-w-2xl w-full mx-auto">
          <h1 className="text-neutral-800 font-bold font-sansitia text-2xl">
            Add Members
          </h1>
          <p className="text-base text-neutral-600">
            Here you can add your members' emails.
          </p>
          <div className="flex flex-col mt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  addMutation.mutate({
                    members: data.members,
                    organizationId: selectedOrganizationId!,
                  })
                )}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="members"
                  render={({
                    field: { value, onChange, ref },
                    fieldState: { error },
                  }) => {
                    return (
                      <FormItem>
                        <FormLabel>Members</FormLabel>
                        <FormControl>
                          <>
                            {value?.map((member, index) => (
                              <div key={index} className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      ref={ref}
                                      className="w-[250px]"
                                      value={member.email}
                                      placeholder="Enter email"
                                      onChange={(e) => {
                                        const updatedEmails = value.map(
                                          (item) =>
                                            item.id === member.id
                                              ? {
                                                  ...item,
                                                  email: e.target.value,
                                                }
                                              : item
                                        );

                                        onChange(updatedEmails);
                                      }}
                                    />
                                  </div>
                                  <div
                                    key={member.id}
                                    className="flex items-center gap-2"
                                  >
                                    <Input
                                      ref={ref}
                                      className="w-[250px]"
                                      value={member.designation}
                                      placeholder="Enter designation"
                                      onChange={(e) => {
                                        const updatedDesignation = value.map(
                                          (item) =>
                                            item.id === member.id
                                              ? {
                                                  ...item,
                                                  designation: e.target.value,
                                                }
                                              : item
                                        );

                                        onChange(updatedDesignation);
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteEmail(member.id)
                                      }
                                      variant="destructive"
                                      size="sm"
                                      className="bg-rose-500 hover:bg-rose-600"
                                    >
                                      <Trash2Icon />
                                    </Button>
                                  </div>
                                </div>
                                {form.formState.errors.members?.[index] && (
                                  <p className="text-destructive text-sm mt-1">
                                    {form.formState.errors.members[index].email
                                      ?.message ||
                                      form.formState.errors.members[index]
                                        .designation?.message}
                                  </p>
                                )}
                              </div>
                            ))}
                          </>
                        </FormControl>
                        <FormMessage />

                        <Button
                          type="button"
                          onClick={handleAddEmail}
                          className="w-fit bg-foreground hover:bg-foreground/90"
                        >
                          Add another email <PlusIcon />
                        </Button>
                      </FormItem>
                    );
                  }}
                />
                {error && <p className="text-sm text-rose-500 my-1">{error}</p>}
                <Button
                  disabled={addMutation.isPending}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {addMutation.isPending ? "Adding..." : "Add Members"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMembers;
