"use client";
import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { SocketContext } from "@/lib/socket-context";
import { userStore } from "@/zustand/user.store";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance";
import { LoadingScreen } from "@/components/loading-screen";
import { v4 as uuid } from "uuid";
import { Textarea } from "@/components/ui/textarea";
import { ImagesAndMessage } from "../../../../../components/images-and-message";
import { Socket } from "socket.io-client";
import { ChatBodyMessages } from "@/components/chat-body-message";
import { FilesAndMessage } from "@/components/files-and-message";
import { getFileThumbnail } from "@/lib/utils";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  EllipsisVerticalIcon,
  ImageIcon,
  PaperclipIcon,
  SendIcon,
  SmilePlusIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetQueryError } from "@/hooks/use-get-query-error";
import { ErrorCard } from "@/components/error-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type ChatResponseType = {
  id: string;
  chatId: string;
  email: string;
  image: string | null;
  images: string[];
  files: { fileUrl: string; iconUrl: string; fileName: string; ext: string }[];
  name: string;
  status: string;
  message: string;
  createdAt: string;
};

interface Props {
  organizationId: string;
  selectedMember: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    socketId: string;
    designation?: string;
    isAdmin: boolean;
  } | null;
  setSelectedMember: Dispatch<
    SetStateAction<{
      id: string;
      name: string;
      email: string;
      image: string | null;
      designation?: string;
      socketId: string;
      isAdmin: boolean;
    } | null>
  >;
  messages: ChatResponseType[];
  setMessages: Dispatch<SetStateAction<ChatResponseType[]>>;
  selectedGroup: {
    id: string;
    name: string;
    image: string | null;
    members: {
      id: string;
      name: string;
      email: string;
      image?: string;
      designation: string;
    }[];
  } | null;
  setSelectedGroup: Dispatch<
    SetStateAction<{
      id: string;
      name: string;
      image: string | null;
      members: {
        id: string;
        name: string;
        email: string;
        image?: string;
        designation: string;
      }[];
    } | null>
  >;
}

export const ChatBody = ({
  organizationId,
  selectedMember,
  selectedGroup,
  setSelectedGroup,
  messages,
  setMessages,
}: Props) => {
  const query = useQueryClient();
  const { user } = userStore();
  const emojiDivRef = useRef<HTMLDivElement | null>(null);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);

  const [message, setMessage] = useState("");
  const [images, setImages] = useState<
    { imageUrl: string; file: File; fileName: string }[]
  >([]);
  const [files, setFiles] = useState<
    { fileUrl: string; file: File; fileName: string; ext: string }[]
  >([]);
  const [isUploading, setIsUploading] = useState<
    {
      chatId: string;
      isUploading: boolean;
      percentage: number;
    }[]
  >([]);
  const [isEmoji, setIsEmoji] = useState(false);

  const socket = useContext(SocketContext);
  // Queries
  const {
    data: chatsData,
    isPending: isChatDataPending,
    error: chatDataError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["get-admin-chats"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/chats/${selectedMember?.id}/${organizationId}`
      );
      return res.data as ChatResponseType[];
    },
    retry: !!selectedMember?.id,
    enabled: !!selectedMember?.id,
    refetchOnWindowFocus: false,
  });
  const {
    data: groupChatsData,
    isPending: isGroupChatDataPending,
    error: groupChatDataError,
    isFetching: isGroupFetching,
    refetch: groupRefetch,
  } = useQuery({
    queryKey: ["get-admin-group-chats"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/chats/group/${selectedGroup?.id}/${organizationId}`
      );
      return res.data as ChatResponseType[];
    },
    retry: !!selectedGroup?.id,
    enabled: !!selectedGroup?.id,
    refetchOnWindowFocus: false,
  });
  // Mutations
  const deleteAllChatsMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await axiosInstance.delete(
        `/admin/chats/delete-all-chats/${memberId}`
      );
      return res.data;
    },
    onSuccess: () => {
      setMessages([]);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data.message || "Something went wrong!";
      toast.error(message);
    },
  });
  const deleteGroupMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const response = await axiosInstance.delete(`/admin/groups/${roomId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Group deleted successfully");
      query.invalidateQueries({
        queryKey: ["get-chat-members"],
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const errorMessage =
        error.response?.data.message || "Something went wrong!";
      toast.error(errorMessage);
    },
  });
  const deleteGroupChatsMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const response = await axiosInstance.delete(
        `/admin/groups/chats/${roomId}`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("All chats deleted successfully");
      setMessages([]);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const errorMessage =
        error.response?.data.message || "Something went wrong!";
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    if (selectedMember) {
      refetch();
      setMessages([]);
    }
    if (selectedGroup) {
      groupRefetch();
      setMessages([]);
    }
  }, [selectedMember, selectedGroup]);

  useEffect(() => {
    if (chatsData && selectedMember) {
      setMessages(chatsData);
    }
    if (groupChatsData && selectedGroup) {
      setMessages(groupChatsData);
    }
  }, [chatsData, groupChatsData, isFetching, isGroupFetching]);

  useEffect(() => {
    const handleMessageReceive = (
      data: ChatResponseType & { toId: string; roomId: string }
    ) => {
      const isValidMember =
        data.toId === selectedMember?.id && selectedMember?.id;
      const isValidGroup =
        data.roomId === selectedGroup?.id && selectedGroup?.id;

      if (isValidMember || isValidGroup) {
        const isExisting = messages.find(
          (message) => message.chatId === data.chatId
        );
        if (isExisting) {
          setMessages((prev) => {
            if (!prev) return prev;
            return prev.map((message) => {
              if (message.chatId === data.chatId) {
                return data;
              } else {
                return message;
              }
            });
          });
        } else {
          setMessages((prev) => [...prev, data]);
        }
      }
    };
    socket?.on("message-receive", handleMessageReceive);

    return () => {
      socket?.off("message-receive", handleMessageReceive);
    };
  }, [socket, message]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        emojiDivRef.current &&
        !emojiDivRef.current.contains(e.target as Node)
      ) {
        setIsEmoji(false);
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const handleGetPresignedUrl = async (items: any[]) => {
    try {
      let result: {
        url: string;
        fileName: string;
        fileUrl: string;
        ext: string;
        file: File | undefined;
      }[] = [];
      const res = await axiosInstance.post("/admin/chats/presigned-urls", {
        fileNames: items.map((item) => item.fileName),
      });
      const data = res.data as { fileName: string; url: string }[];
      data.forEach(async (item) => {
        const file = items.find((i) => i.fileName === item.fileName);
        result.push({
          file: file?.file,
          fileName: item.fileName,
          fileUrl: file.fileUrl,
          url: item.url,
          ext: file.ext,
        });
      });
      return result;
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendMessage = async () => {
    if (!socket) {
      toast.error("Socket not connected!");
      return;
    }
    if (!user) {
      toast.error("User not exist!");
      return;
    }
    if (!selectedMember && !selectedGroup) {
      toast.error("Please select an member/group first!");
      return;
    }
    const chatId = uuid();
    if (images.length > 0) {
      sendImageMessage(socket, chatId, !!selectedGroup?.id);
    } else if (files.length > 0) {
      sendFileMessage(socket, chatId, !!selectedGroup?.id);
    } else {
      sendTextMessage(socket, chatId, !!selectedGroup?.id);
    }
  };

  const sendTextMessage = (
    socket: Socket,
    chatId: string,
    isGroup: boolean
  ) => {
    if (!user) return;
    socket.emit(
      isGroup ? "group-message" : "message",
      JSON.stringify({
        message,
        chatId,
        adminId: user.id,
        organizationId,
        name: user.name,
        image: user.image,
        images: [],
        files: [],
        email: user.email,
        ...(selectedMember?.id && { toId: selectedMember?.id }),
        ...(selectedGroup?.id && { roomId: selectedGroup.id }),
        members: selectedGroup?.members || null,
        createdAt: new Date().toISOString(),
        type: isGroup ? "ADMIN_MEMBERS" : "ADMIN_MEMBER",
      })
    );
    setMessage("");
    setImages([]);
    setMessages((prev) => [
      ...prev,
      {
        id: user.id,
        chatId,
        email: user.email,
        image: user.image,
        images: [],
        files: [],
        name: user.name,
        status: "SENDING",
        message,
        createdAt: new Date().toLocaleString(),
      },
    ]);
  };

  const sendImageMessage = async (
    socket: Socket,
    chatId: string,
    isGroup: boolean
  ) => {
    if (!user) return;
    setMessage("");
    setMessages((prev) => [
      ...prev,
      {
        id: user.id,
        chatId,
        email: user.email,
        organizationId,
        image: user.image,
        images: images.map((img) => img.imageUrl),
        files: [],
        name: user.name,
        status: "SENDING",
        message,
        createdAt: new Date().toISOString(),
      },
    ]);
    setImages([]);
    setIsUploading((prev) => [
      ...prev,
      {
        chatId,
        isUploading: true,
        percentage: 0,
      },
    ]);
    const imagesUrl: string[] = [];
    const urls = await handleGetPresignedUrl(images);

    let uploadedUrls = 0;
    if (urls && urls.length > 0) {
      await Promise.all(
        urls.map(async (url) => {
          try {
            await axios.put(url.url, url.file, {
              headers: {
                "Content-Type": url.file?.type,
              },
            });
            const fileUrl = `https://check-in-bucket-89067.s3.eu-north-1.amazonaws.com/${url.fileName}`;
            imagesUrl.push(fileUrl);
            const percentage = Math.floor((uploadedUrls / urls.length) * 100);
            setIsUploading((prev) => {
              return prev.map((item) => {
                if (item.chatId === chatId) {
                  return { ...item, percentage };
                } else {
                  return item;
                }
              });
            });
            uploadedUrls++;
          } catch (error) {
            console.log(error);
          }
        })
      );
      setIsUploading((prev) => prev.filter((item) => item.chatId !== chatId));
      socket.emit(
        isGroup ? "group-message" : "message",
        JSON.stringify({
          message,
          chatId,
          adminId: user.id,
          name: user.name,
          image: user.image,
          files: [],
          images: imagesUrl,
          organizationId,
          email: user.email,
          ...(selectedGroup?.id && { roomId: selectedGroup.id }),
          members: selectedGroup?.members || null,
          ...(selectedMember?.id && { toId: selectedMember?.id }),
          type: isGroup ? "ADMIN_MEMBERS" : "ADMIN_MEMBER",
        })
      );
    }
  };

  const sendFileMessage = async (
    socket: Socket,
    chatId: string,
    isGroup: boolean
  ) => {
    if (!user) return;
    setMessage("");
    setMessages((prev) => [
      ...prev,
      {
        id: user.id,
        chatId,
        email: user.email,
        image: user.image,
        images: [],
        organizationId,
        files: files.map((item) => ({
          fileUrl: "",
          iconUrl: item.fileUrl,
          fileName: item.fileName,
          ext: item.ext,
        })),
        name: user.name,
        status: "SENDING",
        message,
        createdAt: new Date().toISOString(),
      },
    ]);
    setFiles([]);
    setIsUploading((prev) => [
      ...prev,
      {
        chatId,
        isUploading: true,
        percentage: 0,
      },
    ]);
    const filesUrl: {
      fileUrl: string;
      iconUrl: string;
      fileName: string;
      ext: string;
    }[] = [];
    const urls = await handleGetPresignedUrl(files);
    let uploadedUrls = 0;
    if (urls && urls.length > 0) {
      await Promise.all(
        urls.map(async (url) => {
          try {
            await axios.put(url.url, url.file, {
              headers: {
                "Content-Type": url.file?.type,
              },
            });
            const fileUrl = `https://check-in-bucket-89067.s3.eu-north-1.amazonaws.com/${url.fileName}`;
            filesUrl.push({
              fileUrl,
              iconUrl: url.fileUrl,
              fileName: url.fileName,
              ext: url.ext,
            });
            const percentage = Math.floor((uploadedUrls / urls.length) * 100);
            setIsUploading((prev) => {
              return prev.map((item) => {
                if (item.chatId === chatId) {
                  return { ...item, percentage };
                } else {
                  return item;
                }
              });
            });
            uploadedUrls++;
          } catch (error) {
            console.log(error);
          }
        })
      );
      setIsUploading((prev) => prev.filter((item) => item.chatId !== chatId));
      socket.emit(
        isGroup ? "group-message" : "message",
        JSON.stringify({
          message,
          chatId,
          adminId: user.id,
          name: user.name,
          organizationId,
          image: user.image,
          files: filesUrl,
          images: [],
          email: user.email,
          ...(selectedMember?.id && { toId: selectedMember?.id }),
          ...(selectedGroup?.id && { roomId: selectedGroup.id }),
          members: selectedGroup?.members || null,
          type: isGroup ? "ADMIN_MEMBERS" : "ADMIN_MEMBER",
        })
      );
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImages([]);
    setFiles([]);
    const files = e.target.files;
    if (!files || files.length < 1) return;

    let totalSize = 0;
    const maxSize = 50 * 1024 * 1024;
    const validImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      totalSize += file.size;

      if (totalSize > maxSize) {
        toast.error("Total image size exceeds 50MB limit");
        setImages([]);
        return;
      }
      const fileName = uuid();
      const url = URL.createObjectURL(file);
      validImages.push({ imageUrl: url, file, fileName });
    }

    setImages(validImages);
    e.target.value = "";
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImages([]);
    setFiles([]);
    const files = e.target.files;
    if (!files || files.length < 1) return;

    let totalSize = 0;
    const maxSize = 50 * 1024 * 1024;
    const validFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      totalSize += file.size;

      if (totalSize > maxSize) {
        toast.error("Total image size exceeds 50MB limit");
        setImages([]);
        return;
      }
      const fileName = uuid();
      const url = URL.createObjectURL(file);
      const { icon, ext } = getFileThumbnail(file.name, url);
      validFiles.push({ fileUrl: icon, file, fileName, ext });
    }

    setFiles(validFiles);
    e.target.value = "";
  };

  const getSendPermissions = () => {
    if (images.length > 0) {
      return false;
    } else if (files.length > 0) {
      return false;
    } else if (message.trim() !== "") {
      return false;
    } else {
      return true;
    }
  };

  if (chatDataError) {
    const { errorMessage } = useGetQueryError(
      chatDataError as AxiosError<{ message: string }>
    );
    return <ErrorCard title="Oops!" description={errorMessage} />;
  }

  return (
    <div className="w-full bg-neutral-100 shadow-lg border border-neutral-300 rounded-xl h-[calc(100vh-110px)] sidebar-scrollbar flex flex-col">
      {selectedGroup && (
        <GroupMembersDialog
          members={selectedGroup.members}
          isOpen={isMembersDialogOpen}
          setIsOpen={setIsMembersDialogOpen}
        />
      )}
      <div className="w-full bg-white border-b border-neutral-300 py-3 px-5 flex items-center justify-between rounded-t-xl">
        {selectedMember && (
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={selectedMember?.image || ""}
                  alt={`${selectedMember?.name} image`}
                />
                <AvatarFallback>
                  {selectedMember?.name.substring(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="w-3 h-3 rounded-full bg-green-400 absolute top-0 left-0 p-0.5">
                <div className="w-full h-full rounded-full bg-green-300"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-neutral-800 text-base font-semibold">
                {selectedMember?.name}
              </span>
              <span className="text-neutral-700 text-xs">
                {selectedMember?.designation || ""}
              </span>
            </div>
          </div>
        )}
        {selectedGroup && (
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={selectedGroup?.image || ""}
                  alt={`${selectedGroup?.name} image`}
                />
                <AvatarFallback>
                  {selectedGroup?.name.substring(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="w-3 h-3 rounded-full bg-green-400 absolute top-0 left-0 p-0.5">
                <div className="w-full h-full rounded-full bg-green-300"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-neutral-800 text-base font-semibold">
                {selectedGroup?.name}
              </span>
              <span
                onClick={() => setIsMembersDialogOpen(true)}
                className="text-neutral-600 text-sm underline underline-offset-2 cursor-pointer"
              >
                {selectedGroup?.members.length} Member
                {selectedGroup?.members.length > 1 && "s"}
              </span>
            </div>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <EllipsisVerticalIcon className="size-4 text-neutral-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {selectedMember?.id && (
              <DropdownMenuItem
                onClick={() =>
                  deleteAllChatsMutation.mutate(selectedMember?.id || "")
                }
                variant="destructive"
              >
                Delete all chats
              </DropdownMenuItem>
            )}
            {selectedGroup?.id && (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    deleteGroupChatsMutation.mutate(selectedGroup?.id || "")
                  }
                  variant="destructive"
                >
                  Delete all chats
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    deleteGroupMutation.mutate(selectedGroup?.id || "")
                  }
                  variant="destructive"
                >
                  Delete group
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isFetching || isGroupFetching ? (
        <LoadingScreen />
      ) : (
        <>
          {messages && messages.length > 0 ? (
            <ChatBodyMessages
              messages={messages}
              setMessages={setMessages}
              isUploading={isUploading}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm text-center">
              {selectedMember?.id ? (
                <>You have no chats with {selectedMember?.name}</>
              ) : selectedGroup?.id ? (
                <>This group have no chats yet.</>
              ) : (
                "You have no chats"
              )}
            </div>
          )}
        </>
      )}

      <div className="mt-auto flex items-end w-[90%] mx-auto gap-2 mb-3">
        <label className="group flex items-center justify-center gap-2 border cursor-pointer border-neutral-300 bg-neutral-100 h-11 w-11 hover:bg-neutral-200 outline-none ring-0 text-white">
          <input
            type="file"
            accept="*"
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
          <PaperclipIcon className="text-neutral-500 size-5" />
        </label>
        <label className="group flex items-center justify-center gap-2 border cursor-pointer border-neutral-300 bg-neutral-100 h-11 w-11 hover:bg-neutral-200 outline-none ring-0 text-white">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            multiple
            onChange={handleImageChange}
          />
          <ImageIcon className="text-neutral-500 size-5" />
        </label>
        <div
          ref={emojiDivRef}
          onClick={() => setIsEmoji(true)}
          className="relative group flex items-center justify-center gap-2 border cursor-pointer border-neutral-300 bg-neutral-100 h-11 w-11 hover:bg-neutral-200 outline-none ring-0 text-white"
        >
          <SmilePlusIcon className="text-neutral-500 size-5" />
          {isEmoji && (
            <div className="absolute bottom-[50px] left-[0px]  z-[500]">
              <Picker
                data={data}
                onEmojiSelect={(e: { native: string }) => {
                  setMessage((prev) => prev + e.native);
                  setIsEmoji(false);
                }}
              />
            </div>
          )}
        </div>
        {images && images.length > 0 ? (
          <ImagesAndMessage
            message={message}
            setMessage={setMessage}
            handleSubmit={handleSendMessage}
            images={images}
            setImages={setImages}
          />
        ) : files && files.length > 0 ? (
          <FilesAndMessage
            message={message}
            setMessage={setMessage}
            handleSubmit={handleSendMessage}
            files={files}
            setFiles={setFiles}
          />
        ) : (
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                const trimmed = message.trim();
                if (trimmed === "") {
                  e.preventDefault();
                  return;
                }

                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="resize-none w-full flex-1 min-h-11 max-h-36 border border-neutral-300 rounded-md text-base text-neutral-800"
            placeholder="Type your message..."
          />
        )}
        <Button
          onClick={handleSendMessage}
          disabled={getSendPermissions()}
          className="group flex items-center gap-2 bg-foreground h-11 hover:bg-foreground/90 w-[100px] border-none outline-none ring-0 text-white"
        >
          Send{" "}
          <SendIcon className="size-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
        </Button>
      </div>
    </div>
  );
};

interface GroupMembersDialogProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  members: {
    id: string;
    name: string;
    email: string;
    image?: string;
    designation: string;
  }[];
}

export const GroupMembersDialog = ({
  isOpen,
  setIsOpen,
  members,
}: GroupMembersDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Group Member</DialogTitle>
          <DialogDescription>
            This group have {members.length} members{members.length > 1 && "s"}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-1.5 w-full">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-2 w-full">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={member.image || ""}
                  alt={`${member.name} profile image`}
                />
                <AvatarFallback>{member.name.substring(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <Badge>{member.designation}</Badge>
                <h2 className="text-foreground font-semibold text-base">
                  {member.name}
                </h2>
                <span className="text-neutral-600 text-sm">{member.email}</span>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
