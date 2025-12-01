import { LoadingScreen } from "@/components/loading-screen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { SocketContext } from "@/lib/socket-context";
import { cn } from "@/lib/utils";
import { userStore } from "@/zustand/user.store";
import { QueryClient, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { UsersIcon } from "lucide-react";
import Image from "next/image";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  organizationId: string;
}

type MembersProps = {
  id: string;
  name: string;
  image: string;
  email: string;
  checks: string;
  projects: string;
  designation: string;
};

export const CreateGroupDialog = ({
  isOpen,
  setIsOpen,
  organizationId,
}: Props) => {
  const query = new QueryClient();
  const [name, setName] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
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
  const socket = useContext(SocketContext);
  const { user } = userStore();

  const {
    data,
    isPending,
    error: membersError,
  } = useQuery({
    queryKey: ["get-members"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/admin/members/${organizationId}`
      );
      return response.data as MembersProps[];
    },
  });

  useEffect(() => {
    if (!socket) return;
    socket.on("room-created", () => {
      query.invalidateQueries({
        queryKey: ["get-chat-members"],
      });
      setIsOpen(false);
      setIsLoading(false);
      setSelectedMemberIds([]);
      setImage(null);
    });

    return () => {
      socket.off("room-created", () => {
        setIsOpen(false);
      });
    };
  }, [socket]);

  const handleCreate = async () => {
    try {
      setIsLoading(true);
      setError({
        type: "NONE",
        error: "",
      });
      if (!name.trim()) {
        setError({
          type: "NAME",
          error: "Please enter a group name!",
        });
        return;
      }
      if (!selectedMemberIds || !selectedMemberIds.length) {
        setError({
          type: "MEMBERS",
          error: "Please select atleast 1 member!",
        });
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

      const body = {
        adminId: user?.id || "",
        name,
        organizationId,
        members: selectedMemberIds,
        imageUrl,
      };

      socket?.emit("create-group", JSON.stringify(body));
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast.error("Something went wrong!");
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
  if (isPending) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full h-[350px] flex items-center justify-center">
          <LoadingScreen />
        </DialogContent>
      </Dialog>
    );
  }
  if (membersError) {
    setIsOpen(false);
    const { errorMessage } = useGetQueryError(
      membersError as AxiosError<{ message: string }>
    );
    toast.error(errorMessage);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>
            Create a new group for your team. Enter a name and add the members
            you want.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-1 cursor-pointer">
            <span className="text-sm text-neutral-800">
              Group Image (optional)
            </span>
            {image ? (
              <div className="w-[80px] h-[80px] rounded-full bg-foreground">
                <Image
                  src={image.url}
                  alt="Group Image"
                  width={30}
                  height={30}
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
          <div className="w-full h-[200px] overflow-y-scroll sidebar-scrollbar-sm flex flex-col gap-2">
            {data &&
              data.map((member, index) => (
                <label key={index} className="flex items-center gap-2">
                  <Checkbox
                    className="w-5 h-5 border-neutral-600"
                    checked={!!selectedMemberIds.find((id) => id === member.id)}
                    onCheckedChange={() => {
                      const isExist = selectedMemberIds.find(
                        (id) => id === member.id
                      );
                      if (isExist) {
                        setSelectedMemberIds((prev) =>
                          prev.filter((id) => id !== member.id)
                        );
                      } else {
                        setSelectedMemberIds((prev) => [...prev, member.id]);
                      }
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <Avatar className={cn("w-14 h-14")}>
                      <AvatarImage
                        src={member.image || ""}
                        alt="User Profile Image"
                      />
                      <AvatarFallback className="rounded-md!">
                        {member.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <Badge>{member.designation}</Badge>
                      <h2 className="text-foreground font-semibold text-base">
                        {member.name}
                      </h2>
                      <span className="text-neutral-600 text-sm">
                        {member.email}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
          </div>
          {error.type === "MEMBERS" && (
            <span className="text-sm text-rose-500">{error.error}</span>
          )}
          <div className="flex items-center gap-3">
            <Button
              disabled={isLoading}
              className="flex-1"
              onClick={handleCreate}
            >
              {isLoading ? "Creating..." : "Create Group"}
            </Button>
            <Button
              disabled={isLoading}
              className="flex-1 bg-rose-400 hover:bg-rose-500"
              onClick={() => {
                setSelectedMemberIds([]);
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
