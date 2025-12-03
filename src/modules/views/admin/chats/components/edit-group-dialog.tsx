import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGetQueryError } from "@/hooks/use-get-query-error";
import { axiosInstance } from "@/lib/axios-instance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { UsersIcon } from "lucide-react";
import Image from "next/image";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  roomId: string;
  setRoomId: Dispatch<SetStateAction<string>>;
}

type GroupProps = {
  id: string;
  name: string;
  image?: string;
};

export const EditGroupDialog = ({
  isOpen,
  setIsOpen,
  roomId,
  setRoomId,
}: Props) => {
  const query = useQueryClient();
  const [name, setName] = useState("");
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

  const {
    data,
    isPending,
    error: groupError,
  } = useQuery({
    queryKey: ["get-group"],
    queryFn: async () => {
      const response = await axiosInstance.get(`/admin/groups/group/${roomId}`);
      return response.data as GroupProps;
    },
  });
  const editMutation = useMutation({
    mutationFn: async () => {
      if (!data) return;
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
      const response = await axiosInstance.put("/admin/groups/edit", {
        id: data.id,
        name,
        image: imageUrl || data.image,
      });
      return response.data;
    },
    onSuccess: () => {
      query.invalidateQueries({
        queryKey: ["get-chat-members"],
      });
      setRoomId("");
      setIsOpen(false);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong!";
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    if (data) {
      setName(data.name);
    }
  }, [data]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImage({
      file,
      url,
    });
  };
  if (isPending) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full h-[350px] flex items-center justify-center">
          <LoadingScreen />
        </DialogContent>
      </Dialog>
    );
  }
  if (groupError) {
    setIsOpen(false);
    const { errorMessage } = useGetQueryError(
      groupError as AxiosError<{ message: string }>
    );
    toast.error(errorMessage);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>
            Here you can edit your group name and image.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-1 cursor-pointer">
            <span className="text-sm text-neutral-800">
              Group Image (optional)
            </span>
            {image || data?.image ? (
              <div className="w-[80px] h-[80px] rounded-full bg-foreground">
                <Image
                  src={image?.url || data?.image || ""}
                  alt="Group Image"
                  width={150}
                  height={150}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="w-[80px] h-[80px] rounded-full flex items-center justify-center bg-neutral-200">
                <UsersIcon className="text-neutral-800 size-8" />
              </div>
            )}
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
          <div className="flex items-center gap-3">
            <Button
              disabled={editMutation.isPending}
              className="flex-1"
              onClick={() => editMutation.mutate()}
            >
              {editMutation.isPending ? "Editing..." : "Edit Group"}
            </Button>
            <Button
              disabled={editMutation.isPending}
              className="flex-1 bg-rose-400 hover:bg-rose-500"
              onClick={() => {
                setRoomId("");
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
