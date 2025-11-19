"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { userStore } from "@/zustand/user.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { v4 as uuid } from "uuid";
import { organizationStore } from "@/zustand/member.store";
import { LoadingScreen } from "@/components/loading-screen";

const adminProfileSchema = z.object({
  name: z
    .string({ message: "Name is required!" })
    .min(1, { message: "Name is required!" }),
  image: z.string().optional(),
  imageFile: z.any(),
});

const organizationSchema = z.object({
  organizations: z.array(
    z.object({
      id: z
        .string({ message: "Organization is required!" })
        .min(1, { message: "Organization is required!" }),
      name: z
        .string({ message: "Name is required!" })
        .min(1, { message: "Name is required!" }),
      imageUrl: z.string().optional(),
      imageFile: z.any(),
    })
  ),
});

const Page = () => {
  const { user, setUser } = userStore();
  const { setOrganizationId } = organizationStore();
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isOrganizationUpdating, setIsOrganizationUpdating] = useState<
    string[]
  >([]);
  const queryClient = useQueryClient();
  type AdminProfileSchemaType = z.infer<typeof adminProfileSchema>;
  type OrganizationSchemaType = z.infer<typeof organizationSchema>;

  // Queries
  const { data, isPending } = useQuery({
    queryKey: ["get-organization"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/organizations");
      return res.data.organizations as {
        id: string;
        name: string;
        imageUrl: string;
      }[];
    },
  });
  // Mutations
  const profileUpdateMutation = useMutation({
    mutationFn: async ({ image, name }: { image?: string; name: string }) => {
      const res = await axiosInstance.post(
        "/admin/organizations/update-admin",
        {
          image,
          name,
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      setUser(data);
      toast.success("Profile updated successfully");
      setIsProfileUpdating(false);
      queryClient.invalidateQueries({
        queryKey: ["get-organization"],
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message;
      toast.error(message);
      setIsProfileUpdating(false);
    },
  });
  const organizationUpdateMutation = useMutation({
    mutationFn: async ({
      imageUrl,
      name,
      organizationId,
    }: {
      organizationId: string;
      name: string;
      imageUrl: string;
    }) => {
      const res = await axiosInstance.post(
        "/admin/organizations/update-organization",
        {
          imageUrl,
          name,
          organizationId,
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Organization updated successfully");
      setIsOrganizationUpdating((prev) =>
        prev.filter((item) => item !== data.id)
      );
      queryClient.invalidateQueries({
        queryKey: ["get-organizations"],
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message;
      toast.error(message);
      setIsProfileUpdating(false);
      setIsOrganizationUpdating([]);
    },
  });

  const profileForm = useForm<AdminProfileSchemaType>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      name: "",
      image: "",
      imageFile: null,
    },
  });

  const organizationForm = useForm<OrganizationSchemaType>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      organizations: [],
    },
  });

  const { fields } = useFieldArray({
    control: organizationForm.control,
    name: "organizations",
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        image: user.image || "",
      });
    }
    if (data && data.length > 0) {
      organizationForm.reset({
        organizations: data?.map((item) => ({
          file: null,
          imageUrl: item.imageUrl,
          name: item.name,
          id: item.id,
        })),
      });
    }
  }, [data, user, isPending]);

  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      profileForm.setValue("image", url);
      profileForm.setValue("imageFile", file);
    }
  };

  const handleChangeOrgImage = (
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target?.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const organization = organizationForm.getValues(`organizations.${index}`);
      organizationForm.setValue(`organizations.${index}`, {
        ...organization,
        imageUrl: url,
        imageFile: file,
      });
      const organizations = organizationForm.getValues("organizations");
      organizationForm.reset({
        organizations: organizations,
      });
    }
  };

  const profileSubmit = async (data: AdminProfileSchemaType) => {
    const fileName = uuid();
    const file = profileForm.getValues("imageFile");
    if (!file) {
      profileUpdateMutation.mutate({
        name: data.name,
      });
    } else {
      try {
        setIsProfileUpdating(true);
        const {
          data: { url },
        } = await axiosInstance.get(
          `/admin/organizations/presigned-url/${fileName}`
        );
        await axios.put(url, file, {
          headers: {
            "Content-Type": file.type,
          },
        });
        const fileUrl = `https://check-in-bucket-89067.s3.eu-north-1.amazonaws.com/${fileName}`;
        profileForm.setValue("image", fileUrl);
        profileUpdateMutation.mutate({
          name: data.name,
          image: fileUrl,
        });
      } catch (error) {
        console.log(error);
        setIsProfileUpdating(false);
      }
    }
  };

  const handleUpdateOrganization = async (index: number) => {
    const organization = organizationForm.getValues("organizations")[index];
    const fileName = uuid();
    const file = organization.imageFile;
    if (file) {
      try {
        setIsOrganizationUpdating((prev) => [...prev, organization.id]);
        const {
          data: { url },
        } = await axiosInstance.get(
          `/admin/organizations/presigned-url/${fileName}`
        );
        await axios.put(url, file, {
          headers: {
            "Content-Type": file.type,
          },
        });
        const fileUrl = `https://check-in-bucket-89067.s3.eu-north-1.amazonaws.com/${fileName}`;
        organizationUpdateMutation.mutate({
          imageUrl: fileUrl,
          name: organization.name,
          organizationId: organization.id,
        });
      } catch (error) {
        console.log(error);
        setIsOrganizationUpdating((prev) =>
          prev.filter((item) => item !== organization.id)
        );
      }
    } else {
      setIsOrganizationUpdating((prev) => [...prev, organization.id]);

      organizationUpdateMutation.mutate({
        imageUrl: organization.imageUrl || "",
        name: organization.name,
        organizationId: organization.id,
      });
    }
  };
  const isProfilePending = profileUpdateMutation.isPending || isProfileUpdating;
  if (isPending) {
    return <LoadingScreen />;
  }
  return (
    <div className="w-full mt-16 flex flex-col">
      <div className="max-w-2xl w-full mx-auto">
        <h1 className="text-neutral-800 font-bold font-sansitia text-2xl">
          Update Your Profile
        </h1>
        <p className="text-base text-neutral-600">
          Here you can update your profile information and photo.
        </p>
        <div className="flex flex-col mt-4">
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(profileSubmit)}
              className="space-y-6"
            >
              <FormField
                control={profileForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <label className="cursor-pointer w-fit">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleChangeImage}
                        />
                        <Avatar className="w-24 h-24">
                          <AvatarImage
                            src={field.value}
                            alt={`${user?.name} profile image`}
                            className="object-contain"
                          />
                          <AvatarFallback className="bg-neutral-300 text-foreground text-3xl">
                            {user?.name.substring(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                      </label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
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
              <Button
                disabled={isProfilePending}
                className="bg-green-500 hover:bg-green-600"
              >
                Update profile
              </Button>
            </form>
          </Form>
        </div>
        <div className="flex flex-col mt-4">
          <h1 className="text-neutral-800 font-bold font-sansitia text-2xl">
            Update Your Organizations
          </h1>
          <p className="text-base text-neutral-600">
            Here you can update your organizations information and photo.
          </p>
          <div className="flex flex-col mt-4">
            {fields.map((_, index) => {
              const imageUrl = organizationForm.getValues(
                `organizations.${index}.imageUrl`
              );
              const name = organizationForm.getValues(
                `organizations.${index}.name`
              );
              const id = organizationForm.getValues(
                `organizations.${index}.id`
              );
              const isOrganizationPending = isOrganizationUpdating.includes(id);

              return (
                <div key={index} className="flex items-center gap-4">
                  <label className="w-fit cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleChangeOrgImage(index, e)}
                    />
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`${name} image`}
                        className="w-24 h-24 object-contain rounded-full border border-neutral-200"
                      />
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center rounded-full bg-neutral-300 text-foreground text-xl font-medium">
                        {name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                  </label>

                  <Input
                    {...organizationForm.register(
                      `organizations.${index}.name`
                    )}
                    placeholder="Organization name"
                    className="flex-1"
                  />

                  <Button
                    disabled={isOrganizationPending}
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => handleUpdateOrganization(index)}
                  >
                    Update
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
