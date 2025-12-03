import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios-instance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  organizationId: string;
  prevName: string;
  prevImage: string;
}

export const UpdateOrganizationDialog = ({
  isOpen,
  setIsOpen,
  organizationId,
  prevImage,
  prevName,
}: Props) => {
  const query = useQueryClient();
  const [name, setName] = useState(prevName);
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<{
    file: File;
    url: string;
  } | null>(null);
  const [error, setError] = useState<{
    type: "NONE" | "NAME" | "MEMBERS";
    error: string;
  }>({
    type: "NONE",
    error: "",
  });

  const updateMutation = useMutation({
    mutationFn: async (imageUrl?: string) => {
      const response = await axiosInstance.post(
        "/admin/organizations/update-organization",
        {
          organizationId,
          name,
          imageUrl: imageUrl || prevImage,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      setIsLoading(false);
      query.invalidateQueries({
        queryKey: ["get-organization"],
      });
      query.invalidateQueries({
        queryKey: ["get-organizations"],
      });
      toast.success("Organization updated successfully");
      setIsOpen(false);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong!";
      toast.error(errorMessage);
    },
  });

  const handleUpdateOrganization = async () => {
    try {
      setIsLoading(true);
      setError({
        type: "NONE",
        error: "",
      });
      if (!name.trim()) {
        setError({
          type: "NAME",
          error: "Please enter a organization name!",
        });
        return;
      }
      let imageUrl = "";
      if (image) {
        const fileName = Date.now().toString();
        const { data } = await axiosInstance.get(
          `/admin/organizations/presigned-url/${fileName}`
        );
        await axios.put(data.url, image.file, {
          headers: {
            "Content-Type": image.file.type,
          },
        });

        imageUrl = `https://check-in-bucket-89067.s3.eu-north-1.amazonaws.com/${fileName}`;
      }
      updateMutation.mutate(imageUrl);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast.error("Something went wrong");
      setIsOpen(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImage({
      file,
      url,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Organization</DialogTitle>
          <DialogDescription>
            Here you can update your organization name and image.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-1 cursor-pointer">
            <span className="text-sm text-neutral-800">
              Group Image (optional)
            </span>
            {image?.url || prevImage ? (
              <div className="w-[80px] h-[80px] rounded-full bg-foreground">
                <Image
                  src={image?.url || prevImage}
                  alt="Group Image"
                  width={150}
                  height={150}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            ) : null}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-neutral-800">Group Name</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Developers Group..."
            />
            {error.type === "NAME" && (
              <span className="text-sm text-rose-500">{error.error}</span>
            )}
          </label>
        </div>
        <div className="flex items-center gap-3">
          <Button
            disabled={isLoading}
            className="flex-1"
            onClick={handleUpdateOrganization}
          >
            {isLoading ? "Updating..." : "Update"}
          </Button>
          <Button
            disabled={isLoading}
            className="flex-1 bg-rose-400 hover:bg-rose-500"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
