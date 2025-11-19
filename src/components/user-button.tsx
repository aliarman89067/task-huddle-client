import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axios-instance";
import { userStore } from "@/zustand/user.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { SleekButton } from "./sleek-button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ChevronDownIcon } from "lucide-react";

interface Props {
  isName?: boolean;
  isPrivate?: boolean;
}

export const UserButton = ({ isName = false, isPrivate = false }: Props) => {
  const { user, logoutUser } = userStore();
  const router = useRouter();

  const queryClient = useQueryClient();

  // Mutations
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post("/auth/logout");
      return response.data;
    },
    onSuccess: () => {
      logoutUser();
      queryClient.invalidateQueries({
        queryKey: ["get-session"],
      });
      if (isPrivate) {
        router.push("/");
      }
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message =
        error.response?.data.message ||
        "Something went wrong. Please try again.";
      toast.error(message);
    },
  });

  return (
    <>
      {user ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-1.5 cursor-pointer">
                <Avatar className="w-11 h-11">
                  <AvatarImage
                    src={user.image || ""}
                    alt={`${user.name} profile image`}
                  />
                  <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                {isName && (
                  <>
                    <span className="text-foreground text-sm">{user.name}</span>
                    <ChevronDownIcon className="size-3 text-foreground" />
                  </>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    user.role === "admin"
                      ? `/dashboard/profile`
                      : `/dashboard/member/profile`
                  )
                }
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => logoutMutation.mutate()}
                variant="destructive"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <SleekButton title="Login" onClick={() => router.push("/login")} />
      )}
    </>
  );
};
