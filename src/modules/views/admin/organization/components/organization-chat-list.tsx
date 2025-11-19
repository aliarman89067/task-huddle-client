"use client";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CTAButton } from "@/components/cta-button";
import { axiosInstance } from "@/lib/axios-instance";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ResponseType = {
  id: string;
  name: string;
  email: string;
  image: string;
  chatId: string;
  message: string;
  status: string;
  createdAt: string;
};

interface Props {
  organizationId: string;
}

export const OrganizationChatList = ({ organizationId }: Props) => {
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["get-recent-chats"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/chats/recents/chats/${organizationId}`
      );
      return res.data as ResponseType[];
    },
  });

  return (
    <div className="flex flex-col w-full gap-3 max-h-[400px] overflow-x-hidden overflow-y-scroll sidebar-scrollbar-sm pr-2">
      {data && data.length > 0 ? (
        <>
          {data?.map((chat, index) => (
            <Link
              key={index}
              href={`/dashboard/chats?memberId=${chat.id}`}
              className={cn(
                "flex items-center justify-between bg-neutral-700 rounded-xl px-4 py-2"
              )}
            >
              <div className="flex gap-2 items-center w-full">
                <Avatar className="w-14 h-14">
                  <AvatarImage
                    src={chat.image}
                    className="object-cover"
                    alt={`${chat.name} profile image`}
                  />
                  <AvatarFallback>{chat.name.substring(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white font-medium text-base">
                      {chat.name}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {new Date(chat.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-neutral-300 text-sm line-clamp-2">
                    {chat.message}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </>
      ) : (
        <div className="flex w-full h-[400px] items-center justify-center flex-col gap-2">
          <Image
            src="/images/message.png"
            alt="Message icon"
            width={200}
            height={200}
            className="w-[80%] object-contain"
          />
          <h2 className="text-neutral-300 text-center text-xl">
            You have no recent chats
          </h2>
          <CTAButton
            title="Go To Chats"
            onClick={() => router.push(`/dashboard/chats`)}
            classNames="w-[350px] h-14"
          />
        </div>
      )}
    </div>
  );
};
