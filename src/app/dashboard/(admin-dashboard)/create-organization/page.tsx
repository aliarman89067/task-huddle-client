"use client";
import React, { ChangeEvent, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { PlusIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import axios from "axios";
import { getServerError } from "@/lib/utils";
import { organizationStore } from "@/zustand/member.store";

const generateUniqueDigits = () => {
  const allDigits = Array.from({ length: 10 }, (_, i) => i.toString());
  const shuffled = allDigits.sort(() => Math.random() - 0.5); // shuffle
  return shuffled.join("");
};

const CreateOrganizationPage = () => {
  const router = useRouter();
  const {setOrganizationId} = organizationStore()
  const [presignedURLData, setPresignedURLData] = useState({
    url: "",
    fileName: "",
  });
  const [tempImageURL, setTempImageURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useQuery({
    queryKey: ["prefetched-url"],
    queryFn: async () => {
      const fileName = Date.now().toString();
      const response = await axiosInstance.get(
        `/admin/organizations/presigned-url/${fileName}`
      );
      setPresignedURLData({
        fileName,
        url: response.data.url,
      });
      return response.data;
    },
  });

  const organizationFormSchema = z.object({
    organizationImage: z.any(),
    organizationName: z
      .string()
      .min(1, { message: "Organization name is required!" }),
    members: z
      .array(
        z.object({
          id: z.string(),
          designation: z
            .string()
            .min(1, { message: "Designation is required!" }),
          email: z
            .string()
            .min(1, { message: "Email is required!" })
            .email({ message: "Invalid email format!" }),
        })
      )
      .optional()
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

  type OrganizationFormSchemaType = z.infer<typeof organizationFormSchema>;

  const form = useForm<OrganizationFormSchemaType>({
    defaultValues: {
      organizationName: "",
      organizationImage: "",
      members: [
        {
          id: generateUniqueDigits(),
          designation: "",
          email: "",
        },
      ],
    },
    resolver: zodResolver(organizationFormSchema),
  });

  const CreateOrganizationMutation = useMutation({
    mutationFn: async (data: OrganizationFormSchemaType) => {
      const response = await axiosInstance.post("/admin/organizations", data);
      return response.data;
    },
    onSuccess: (data) => {
      const id = data.organizationId
      setOrganizationId(id)
      // setIsLoading(false);
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error("Something went wrong. Please try again later!");
      getServerError({ error, setServerError: setError });
    },
  });

  const handleAddEmail = () => {
    const id = generateUniqueDigits();
    const emails = form.getValues("members") || [];
    form.setValue("members", [...emails, { id, email: "", designation: "" }]);
  };

  const handleDeleteEmail = (id: string) => {
    const emails = form.getValues("members");
    if (!emails || emails.length === 0) return;
    const remainingEmails = emails.filter((email) => email.id !== id);
    form.setValue("members", remainingEmails, {
      shouldValidate: true,
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    form.setValue("organizationImage", file);
    const url = URL.createObjectURL(file);
    setTempImageURL(url);
  };

  const onSubmit = async (data: OrganizationFormSchemaType) => {
    setIsLoading(true);
    setError("");
    try {
      await axios.put(presignedURLData.url, data.organizationImage, {
        headers: {
          "Content-Type": data.organizationImage.type,
        },
      });

      const fileUrl = `https://check-in-bucket-89067.s3.eu-north-1.amazonaws.com/${presignedURLData.fileName}`;
      const requestData = {
        organizationName: data.organizationName,
        organizationImage: fileUrl,
        members: data.members || [],
      };
      CreateOrganizationMutation.mutate(requestData);
    } catch (error) {
      console.log(error);
      setError("Something went wrong. Please try again later!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mt-16 flex flex-col">
      <div className="max-w-2xl w-full mx-auto">
        <h1 className="text-neutral-800 font-bold font-sansitia text-2xl">
          Create New Organization
        </h1>
        <p className="text-base text-neutral-600">
          Here you can create your new organization and add your members'
          emails.
        </p>
        <div className="flex flex-col mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="organizationImage"
                render={() => (
                  <FormItem>
                    <FormLabel>Organization image</FormLabel>
                    <FormControl>
                      <label className="w-[200px] h-[120px] bg-neutral-100 border border-neutral-200 rounded-lg flex items-center justify-center flex-col gap-1 cursor-pointer hover:bg-neutral-200 transition-all overflow-hidden">
                        <Input
                          type="file"
                          className="hidden"
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                        {tempImageURL ? (
                          <Image
                            src={tempImageURL}
                            alt="Organization Image"
                            width={400}
                            height={400}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <span className="text-sm font-medium text-neutral-700">
                              Upload Image
                            </span>
                            <UploadIcon className="size-5 text-neutral-600" />
                          </>
                        )}
                      </label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="members"
                render={({
                  field: { value, onChange, ref },
                  fieldState: { error },
                }) => {
                  return (
                    <FormItem>
                      <FormLabel>
                        Members{" "}
                        <span className="text-neutral-600">(optional)</span>
                      </FormLabel>
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
                                      const updatedEmails = value.map((item) =>
                                        item.id === member.id
                                          ? { ...item, email: e.target.value }
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
                                    onClick={() => handleDeleteEmail(member.id)}
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
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600"
              >
                {isLoading ? "Creating..." : "Create Organization"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateOrganizationPage;
