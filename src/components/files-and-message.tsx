import { cn, getFileThumbnail } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Textarea } from "./ui/textarea";

interface Props {
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  files: { fileUrl: string; file: File; fileName: string; ext: string }[];
  setFiles: Dispatch<
    SetStateAction<
      { fileUrl: string; file: File; fileName: string; ext: string }[]
    >
  >;
  handleSubmit: () => void;
}

export const FilesAndMessage = ({
  message,
  setMessage,
  files,
  setFiles,
  handleSubmit,
}: Props) => {
  return (
    <div className="resize-none w-full flex-1 min-h-11 border border-neutral-300 rounded-md text-base text-neutral-800 flex flex-col p-2 gap-3">
      <div
        className={cn(
          "relative bg-neutral-200 rounded-lg p-1.5 w-[150px] aspect-square grid gap-2",
          files.length === 1 && "grid-cols-1",
          files.length > 2 && "grid-cols-4",
          files.length > 2 && "grid-cols-2"
        )}
      >
        {files.slice(0, 4).map((item, index) => {
          return (
            <div
              key={index}
              className={cn(
                "w-full shrink-0 bg-white p-1 rounded-lg flex grow",
                files.length === 1 && "h-full",
                files.length === 2 && "h-[70px]",
                files.length > 2 && "h-[70px]"
              )}
            >
              <img
                src={item.fileUrl}
                alt={`Image ${index}`}
                className="w-full h-full shrink-0 grow object-cover rounded-lg"
              />
            </div>
          );
        })}
        {files.length > 4 && (
          <div className="bg-foreground w-10 h-10 rounded-lg flex items-center justify-center absolute -right-2 -bottom-2 text-xs text-white text-center">
            +{files.length - 4} More
          </div>
        )}
        <button
          onClick={() => setFiles([])}
          className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-rose-400 cursor-pointer"
        >
          <XIcon className="size-4 text-white" />
        </button>
      </div>
      <Textarea
        autoFocus
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        className="resize-none w-full flex-1 min-h-11 max-h-36 border-transparent outline-0 ring-0 focus-within:ring-0 focus:ring-0 focus-within:outline-0 focus-visible:ring-0 focus-visible:outline-0 focus-visible:border-0 focus:outline-0 rounded-md text-base text-neutral-800"
        placeholder="Type your message..."
      ></Textarea>
    </div>
  );
};
