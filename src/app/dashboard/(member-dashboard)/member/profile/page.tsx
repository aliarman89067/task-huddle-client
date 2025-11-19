"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userStore } from "@/zustand/user.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { v4 as uuid } from "uuid";
import axios, { AxiosError } from "axios";
import { axiosInstance } from "@/lib/axios-instance";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { organizationStore } from "@/zustand/member.store";
import { IPErrorMessage } from "@/constant";
import { IPErrorDialog } from "@/components/dialogs/ip-error-dialog";

const memberProfileSchema = z.object({
  name: z
    .string({ message: "Name is required!" })
    .min(1, { message: "Name is required!" }),
  image: z.string().optional(),
  imageFile: z.any(),
});

type MemberProfileSchemaType = z.infer<typeof memberProfileSchema>;

const Page = () => {
  const { user, setUser } = userStore();
  const { selectedOrganizationId } = organizationStore();
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  // Mutations
  const profileUpdateMutation = useMutation({
    mutationFn: async ({ image, name }: { image?: string; name: string }) => {
      const res = await axiosInstance.post("/member/auth/update-member", {
        image,
        name,
        organizationId: selectedOrganizationId,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setUser(data);
      toast.success("Profile updated successfully");
      setIsProfileUpdating(false);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message;
      if (message === IPErrorMessage) {
        setIsErrorOpen(true);
        return;
      }
      toast.error(message);
      setIsProfileUpdating(false);
    },
  });

  const profileForm = useForm<MemberProfileSchemaType>({
    resolver: zodResolver(memberProfileSchema),
    defaultValues: {
      name: "",
      image: "",
      imageFile: null,
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        image: user.image || "",
      });
    }
  }, [user]);

  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      profileForm.setValue("image", url);
      profileForm.setValue("imageFile", file);
    }
  };

  const profileSubmit = async (data: MemberProfileSchemaType) => {
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
        } = await axiosInstance.post(`/member/auth/presigned-url/${fileName}`);
        await axios.put(url, file, {
          headers: {
            "Content-Type": file.type,
          },
        });
        const fileUrl = `https://check-in-bucket-89067.s3.eu-north-1.amazonaws.com/${fileName}`;
        console.log(fileUrl);
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

  const isProfilePending = profileUpdateMutation.isPending || isProfileUpdating;

  return (
    <div className="w-full mt-16 flex flex-col">
      <IPErrorDialog isOpen={isErrorOpen} setIsOpen={setIsErrorOpen} />
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
      </div>
    </div>
  );
};

export default Page;
