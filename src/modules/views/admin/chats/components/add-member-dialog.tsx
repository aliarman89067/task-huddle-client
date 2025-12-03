import { LoadingScreen } from "@/components/loading-screen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetQueryError } from "@/hooks/use-get-query-error";
import { axiosInstance } from "@/lib/axios-instance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

type ResponseType = {
  id: string;
  name: string;
  email: string;
  image?: string;
  designation: string;
};

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  roomId: string;
  organizationId: string;
  setRoomId: Dispatch<SetStateAction<string>>;
}

export const AddMemberDialog = ({
  roomId,
  setRoomId,
  isOpen,
  organizationId,
  setIsOpen,
}: Props) => {
  const [loadingMemberIds, setLoadingMemberIds] = useState<string[]>([]);

  const query = useQueryClient();

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["get-remaining-members"],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/admin/groups/remaining-members/${roomId}/${organizationId}`
      );
      return response.data as ResponseType[];
    },
    enabled: !!roomId,
  });
  const addMutation = useMutation({
    mutationFn: async (memberId: string) => {
      setLoadingMemberIds([...loadingMemberIds, memberId]);
      await axiosInstance.put("/admin/groups/add-members", {
        roomId,
        memberId,
      });
      return memberId;
    },
    onSuccess: (memberId: string) => {
      setLoadingMemberIds((prev) => prev.filter((id) => id !== memberId));
      query.invalidateQueries({ queryKey: ["get-remaining-members"] });
      query.invalidateQueries({ queryKey: ["get-chat-members"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong!";
      toast.error(errorMessage);
    },
  });

  if (isPending) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full h-[350px] flex items-center justify-center">
          <LoadingScreen />
        </DialogContent>
      </Dialog>
    );
  }
  if (error) {
    setIsOpen(false);
    const { errorMessage } = useGetQueryError(
      error as AxiosError<{ message: string }>
    );
    toast.error(errorMessage);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => {
        if (!value) {
          setRoomId("");
        }
        setIsOpen(value);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add members</DialogTitle>
          <DialogDescription>
            Here you can add members that are present in your organization.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-2">
          {data && !data.length && (
            <div className="flex flex-col items-center justify-center gap-2">
              <Image
                src="/images/not_found.png"
                width={200}
                height={200}
                alt="Not Found Image"
                className="object-contain"
              />
              <h3 className="text-neutral-700 font-semibold text-lg text-center">
                This group has all members of this organization!
              </h3>
            </div>
          )}
          {data &&
            data.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between w-full bg-neutral-200 px-3 py-2 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={member.image || ""}
                      alt={`${member.name} profile image`}
                    />
                    <AvatarFallback>
                      {member.name.substring(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <Badge>{member.designation}</Badge>
                    <h3 className="text-foreground font-semibold text-base">
                      {member.name}
                    </h3>
                    <span className="text-neutral-700 text-sm">
                      {member.email}
                    </span>
                  </div>
                </div>
                <Button
                  disabled={loadingMemberIds.includes(member.id)}
                  onClick={() => addMutation.mutate(member.id)}
                >
                  {loadingMemberIds.includes(member.id) ? "Adding..." : "Add"}
                </Button>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
