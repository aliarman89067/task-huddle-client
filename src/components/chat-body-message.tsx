import { cn } from "@/lib/utils";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  Loader2Icon,
  TrashIcon,
  UploadIcon,
} from "lucide-react";
import { userStore } from "@/zustand/user.store";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios-instance";
import { saveAs } from "file-saver";
import JSZip from "jszip";

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

export const ChatBodyMessages = React.memo(
  ({
    messages,
    isUploading,
    setMessages,
  }: {
    messages: ChatResponseType[];
    setMessages: Dispatch<SetStateAction<ChatResponseType[]>>;
    isUploading: {
      chatId: string;
      isUploading: boolean;
      percentage: number;
    }[];
  }) => {
    const { user } = userStore();
    const [images, setImages] = useState<string[]>([]);
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState<string[]>([]);

    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (divRef.current) {
        divRef.current.scrollTo({
          top: divRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, [messages]);

    function formatMessageTime(createdAt: string) {
      const messageTime = new Date(createdAt);
      const now = new Date();
      const diffMs = now.getTime() - messageTime.getTime(); // difference in milliseconds
      const diffMinutes = Math.floor(diffMs / 60000); // convert to minutes
      const diffHours = diffMinutes / 60;

      if (diffHours < 1) {
        if (diffMinutes < 1) return "Just now";
        return `${diffMinutes} min`;
      } else {
        // Format as "HH:MM AM/PM"
        let hours = messageTime.getHours();
        const minutes = messageTime.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        return `${hours}:${minutes} ${ampm}`;
      }
    }
    const handleDownload = async (
      fileUrl: string,
      fileName: string,
      ext: string,
      chatId: string
    ) => {
      try {
        setIsDownloading((prev) => [...prev, chatId]);
        const res = await fetch(fileUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(new Blob([blob]));

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${fileName}.${ext}`);

        document.body.appendChild(link);
        link.click();
        link?.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error fetching the file:", error);
      } finally {
        setIsDownloading((prev) => prev.filter((id) => id !== chatId));
      }
    };

    const getFileUrl = (iconUrl: string, fileUrl: string, ext: string) => {
      const isImage = ["jpg", "jpeg", "png", "gif", "svg"].includes(ext);
      console.log(isImage);
      console.log(fileUrl);
      if (isImage) {
        return fileUrl;
      } else {
        return iconUrl;
      }
    };

    return (
      <div
        ref={divRef}
        className="flex-1 px-5 py-4 flex overflow-y-scroll sidebar-scrollbar-sm mb-2"
      >
        <ImagesDialog
          images={images}
          setImages={setImages}
          isImageOpen={isImageOpen}
          setIsImageOpen={setIsImageOpen}
        />
        <div className="mt-auto flex flex-col gap-4 w-full max-h-screen">
          {messages.map((item, index) => {
            const uploading = isUploading.find(
              (i) => i.isUploading && i.chatId === item.chatId
            );
            const download = isDownloading.includes(item.chatId);
            return (
              <div
                key={index}
                className={cn(
                  "flex gap-1 items-start",
                  item.id === user?.id ? "flex-row-reverse" : "flex-row",
                  item.status === "SENDING"
                    ? "opacity-70"
                    : item.status === "SENDED"
                    ? "opacity-100"
                    : ""
                )}
              >
                <div
                  className={cn(
                    "group relative w-fit flex gap-1",
                    item.id === user?.id ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {user && item.status === "SENDED" && (
                    <OptionsDialog
                      chatId={item.chatId}
                      files={item.files}
                      role={user.role}
                      setIsDownloading={setIsDownloading}
                      isDownloading={isDownloading}
                      isUser={user.id === item.id}
                      images={item.images}
                      setMessages={setMessages}
                    />
                  )}

                  <Avatar className="w-10 h-10 rounded-full bg-foreground p-0.5 shrink-0 translate-y-3">
                    <AvatarImage
                      src={item.image || ""}
                      alt={`${item.name} image`}
                    />
                    <AvatarFallback>{item.name.substring(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "flex flex-col",
                      item.id === user?.id ? "items-end" : "items-start"
                    )}
                  >
                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                      {formatMessageTime(item.createdAt)}{" "}
                      <span className="text-neutral-800">
                        {item.id !== user?.id && item.name}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex flex-col gap-1",
                        user?.id === item.id ? "items-end" : "items-start"
                      )}
                    >
                      {item?.images && item?.images.length > 0 && (
                        <div
                          className={cn(
                            "relative bg-neutral-200 rounded-lg p-1.5 w-[150px] aspect-square grid gap-2",
                            item.images.length === 1 && "grid-cols-1",
                            item.images.length > 2 && "grid-cols-4",
                            item.images.length > 2 && "grid-cols-2"
                          )}
                        >
                          {uploading && (
                            <div className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center flex-col gap-1 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-[200]">
                              <span className="text-sm text-white">
                                {uploading.percentage}%
                              </span>
                              <UploadIcon className="size-5 text-white" />
                            </div>
                          )}
                          {download && (
                            <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center flex-col gap-1 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-[200]">
                              <Loader2Icon className="size-6 text-white animate-spin" />
                            </div>
                          )}
                          {item?.images?.slice(0, 4)?.map((url, index) => (
                            <button
                              key={index}
                              disabled={item.status !== "SENDED" || download}
                              onClick={() => {
                                setIsImageOpen(true);
                                setImages(item.images);
                              }}
                              className={cn(
                                "w-full shrink-0 bg-white p-1 rounded-lg flex grow cursor-pointer hover:scale-[105%]",
                                item.images.length === 1 && "h-full",
                                item.images.length === 2 && "h-[70px]",
                                item.images.length > 2 && "h-[70px]"
                              )}
                            >
                              <img
                                src={url}
                                alt={`Image ${index}`}
                                className="w-full h-full shrink-0 grow object-cover rounded-lg"
                              />
                            </button>
                          ))}
                          {item?.images?.length > 4 && (
                            <div className="bg-foreground w-10 h-10 rounded-lg flex items-center justify-center absolute -right-2 -bottom-2 text-xs text-white text-center">
                              +{item?.images?.length - 4} More
                            </div>
                          )}
                        </div>
                      )}
                      {item?.files && item?.files.length > 0 && (
                        <div
                          className={cn(
                            "relative bg-neutral-200 rounded-lg p-1.5 w-[150px] aspect-square grid gap-2",
                            item.files.length === 1 && "grid-cols-1",
                            item.files.length > 2 && "grid-cols-4",
                            item.files.length > 2 && "grid-cols-2"
                          )}
                        >
                          {uploading && (
                            <div className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center flex-col gap-1 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-[200]">
                              <span className="text-sm text-white">
                                {uploading.percentage}%
                              </span>
                              <UploadIcon className="size-5 text-white" />
                            </div>
                          )}
                          {download && (
                            <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center flex-col gap-1 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-[200]">
                              <Loader2Icon className="size-6 text-white animate-spin" />
                            </div>
                          )}
                          {item?.files?.slice(0, 4)?.map((url, index) => (
                            <button
                              key={index}
                              disabled={item.status !== "SENDED" || download}
                              onClick={() =>
                                handleDownload(
                                  url.fileUrl,
                                  url.fileName,
                                  url.ext,
                                  item.chatId
                                )
                              }
                              className={cn(
                                "w-full shrink-0 bg-white p-1 rounded-lg flex grow cursor-pointer hover:scale-[105%]",
                                item.files.length === 1 && "h-full",
                                item.files.length === 2 && "h-[70px]",
                                item.files.length > 2 && "h-[70px]"
                              )}
                            >
                              {item.status === "SENDED" ? (
                                <img
                                  src={getFileUrl(
                                    url.iconUrl,
                                    url.fileUrl,
                                    url.ext
                                  )}
                                  alt={`Image ${index}`}
                                  className="w-full h-full shrink-0 grow object-cover rounded-lg"
                                />
                              ) : (
                                <img
                                  src={url.iconUrl}
                                  alt={`Image ${index}`}
                                  className="w-full h-full shrink-0 grow object-cover rounded-lg"
                                />
                              )}
                            </button>
                          ))}
                          {item?.images?.length > 4 && (
                            <div className="bg-foreground w-10 h-10 rounded-lg flex items-center justify-center absolute -right-2 -bottom-2 text-xs text-white text-center">
                              +{item?.images?.length - 4} More
                            </div>
                          )}
                        </div>
                      )}
                      {item.message.trim() !== "" && (
                        <div
                          className={cn(
                            "relative rounded-md min-w-20 max-w-[350px] py-2 px-3 text-white translate-y-1",
                            item.id === user?.id
                              ? "bg-primary before:border-b-primary before:-right-1.5 before:rotate-45"
                              : "bg-foreground before:border-b-foreground before:-left-1.5 before:-rotate-45",
                            // shared triangle styles
                            "before:absolute before:top-[-3px] before:border-l-10 before:border-r-10 before:border-b-[13px] before:border-l-transparent before:border-r-transparent before:content-['']"
                          )}
                        >
                          <p className="text-sm">{item.message}</p>
                        </div>
                      )}
                    </div>
                    {item.status === "SENDING" && item.id === user?.id && (
                      <span className="text-neutral-700 text-xs flex items-center gap-1 my-1">
                        Sending <Loader2Icon className="size-4 animate-spin" />
                      </span>
                    )}
                    {item.status === "SENDED" &&
                      item.chatId === messages[messages.length - 1].chatId &&
                      item.id === user?.id && (
                        <span className="text-neutral-700 text-xs flex items-center gap-1 my-1">
                          Sended <CheckIcon className="size-4" />
                        </span>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

interface OptionsDialogProps {
  chatId: string;
  setMessages: Dispatch<SetStateAction<ChatResponseType[]>>;
  role: "admin" | "member";
  isUser: boolean;
  files: { fileUrl: string; iconUrl: string; fileName: string; ext: string }[];
  images: string[];
  isDownloading: string[];
  setIsDownloading: Dispatch<SetStateAction<string[]>>;
}

const OptionsDialog = ({
  chatId,
  setMessages,
  role,
  files,
  isUser,
  images,
  isDownloading,
  setIsDownloading,
}: OptionsDialogProps) => {
  const deleteForMeMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.put(`/${role}/chats/delete-for-me`, {
        chatId,
      });
      return res.data.chatId;
    },
    onSuccess: (chatId) => {
      setMessages((prev) => prev.filter((item) => item.chatId !== chatId));
    },
  });

  const handleDownloadFiles = async () => {
    try {
      setIsDownloading((prev) => [...prev, chatId]);
      const zip = new JSZip();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await fetch(file.fileUrl);
        const blob = await res.blob();
        const fileName = file.fileName + "." + file.ext;
        zip.file(fileName, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, Date.now() + "." + "zip");
    } catch (error) {
      console.log(error);
    } finally {
      setIsDownloading((prev) => prev.filter((id) => id !== chatId));
    }
  };

  const handleDownloadImage = async () => {
    try {
      setIsDownloading((prev) => [...prev, chatId]);
      const zip = new JSZip();

      for (let i = 0; i < images.length; i++) {
        const fileUrl = images[i];

        const response = await fetch(fileUrl);
        const blob = await response.blob();

        // Detect content type
        const contentType =
          response.headers.get("Content-Type") || "application/octet-stream";

        // Guess extension
        let ext = "";
        if (contentType.includes("png")) ext = "png";
        else if (contentType.includes("jpeg") || contentType.includes("jpg"))
          ext = "jpg";
        else if (contentType.includes("gif")) ext = "gif";
        else if (contentType.includes("svg")) ext = "svg";
        else if (contentType.includes("webp")) ext = "webp";
        else if (contentType.includes("postscript")) ext = "eps";
        else ext = "bin";

        const fileName = `${Date.now()}-i.${ext}`;
        zip.file(fileName, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, Date.now() + "." + "zip");
    } catch (err) {
      console.error("Error creating ZIP:", err);
    } finally {
      setIsDownloading((prev) => prev.filter((id) => id !== chatId));
    }
  };
  const downloading = isDownloading.includes(chatId);
  if (files?.length < 1 && images?.length < 1 && !isUser) return;

  return (
    <div
      className={cn(
        "bg-foreground py-1.5 px-1.5 -top-2 rounded-full flex items-center justify-center gap-2 absolute z-[100] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
        isUser ? "-right-2" : "-left-2"
      )}
    >
      {files && files.length > 0 ? (
        <button
          disabled={downloading}
          onClick={handleDownloadFiles}
          className="bg-transparent outline-0 border-0 ring-0 cursor-pointer"
        >
          <DownloadIcon className="size-4 text-white" />
        </button>
      ) : images && images.length > 0 ? (
        <button
          disabled={downloading}
          onClick={handleDownloadImage}
          className="bg-transparent outline-0 border-0 ring-0 cursor-pointer"
        >
          <DownloadIcon className="size-4 text-white" />
        </button>
      ) : null}
      {isUser && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="bg-transparent outline-0 border-0 ring-0 cursor-pointer">
              <EllipsisVerticalIcon className="size-4 text-white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => deleteForMeMutation.mutate()}
              variant="destructive"
            >
              Delete for me
            </DropdownMenuItem>
            {/* <DropdownMenuItem variant="destructive">
          Delete for everyone
        </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

interface ImagesDialogProps {
  images: string[];
  setImages: Dispatch<SetStateAction<string[]>>;
  isImageOpen: boolean;
  setIsImageOpen: Dispatch<SetStateAction<boolean>>;
}

const ImagesDialog = ({
  images,
  setImages,
  isImageOpen,
  setIsImageOpen,
}: ImagesDialogProps) => {
  const [handlerIndex, setHandlerIndex] = useState(0);
  const handleIncreament = () => {
    if (handlerIndex < images.length - 1) {
      setHandlerIndex(handlerIndex + 1);
    }
  };
  const handleDecreament = () => {
    if (handlerIndex > 0) {
      setHandlerIndex(handlerIndex - 1);
    }
  };

  return (
    <Dialog
      open={isImageOpen}
      onOpenChange={(value) => {
        setIsImageOpen(value);
        setHandlerIndex(0);
        setImages([]);
      }}
    >
      <DialogContent>
        <div className="relative w-full h-full mt-3 flex overflow-hidden">
          <button
            onClick={handleDecreament}
            className="z-[100] flex items-center justify-center cursor-pointer absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-foreground/50 text-white"
          >
            <ChevronLeftIcon className="size-6" />
          </button>
          <button
            onClick={handleIncreament}
            className="z-[100] flex items-center justify-center cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-foreground/50 text-white"
          >
            <ChevronRightIcon className="size-6" />
          </button>
          {images &&
            images.length > 0 &&
            images.map((url, index) => (
              <img
                src={url}
                alt={`Image ${index}`}
                style={{
                  translate: `-${handlerIndex * 100}% 0px`,
                }}
                className="min-w-full aspect-square object-contain transition-all duration-200 ease-in-out"
              />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
