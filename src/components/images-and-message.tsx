import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface Props {
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  images: { imageUrl: string; file: File; fileName: string }[];
  setImages: Dispatch<
    SetStateAction<{ imageUrl: string; file: File; fileName: string }[]>
  >;
  handleSubmit: () => void;
}

export const ImagesAndMessage = ({
  message,
  setMessage,
  images,
  setImages,
  handleSubmit,
}: Props) => {
  return (
    <div className="resize-none w-full flex-1 min-h-11 border border-neutral-300 rounded-md text-base text-neutral-800 flex flex-col p-2 gap-3">
      <div
        className={cn(
          "relative bg-neutral-200 rounded-lg p-1.5 w-[150px] aspect-square grid gap-2",
          images.length === 1 && "grid-cols-1",
          images.length > 2 && "grid-cols-4",
          images.length > 2 && "grid-cols-2"
        )}
      >
        {images.slice(0, 4).map((item, index) => (
          <div
            key={index}
            className={cn(
              "w-full shrink-0 bg-white p-1 rounded-lg flex grow",
              images.length === 1 && "h-full",
              images.length === 2 && "h-[70px]",
              images.length > 2 && "h-[70px]"
            )}
          >
            <img
              src={item.imageUrl}
              alt={`Image ${index}`}
              className="w-full h-full shrink-0 grow object-cover rounded-lg"
            />
          </div>
        ))}
        {images.length > 4 && (
          <div className="bg-foreground w-10 h-10 rounded-lg flex items-center justify-center absolute -right-2 -bottom-2 text-xs text-white text-center">
            +{images.length - 4} More
          </div>
        )}
        <button
          onClick={() => setImages([])}
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
