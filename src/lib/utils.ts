import { useQuery } from "@tanstack/react-query";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { axiosInstance } from "./axios-instance";
import { AxiosError } from "axios";
import { Dispatch, SetStateAction } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSession = () => {
  const { isPending, isError, isSuccess, data } = useQuery({
    queryKey: ["get-session"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/auth/get-session");
      return data.data;
    },
    retry: 1,
  });
  return { isPending, isError, isSuccess, data };
};

interface GetServerErrorProps {
  error: AxiosError<{ message: string }>;
  setServerError: Dispatch<SetStateAction<string>>;
}

export const getServerError = ({
  error,
  setServerError,
}: GetServerErrorProps) => {
  const message = error.response?.data.message || "Something went wrong!";
  setServerError(message);
};

export function getFileThumbnail(fileName = "", fileUrl = "") {
  const ext = fileName.split(".")[1];
  console.log("ext ", ext);
  const isImage = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "bmp",
    "tiff",
    "svg",
    "heic",
  ].includes(ext);
  const isVideo = ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv"].includes(
    ext
  );
  const isAudio = ["mp3", "wav", "ogg", "aac", "flac", "m4a"].includes(ext);
  const isPdf = ["pdf"].includes(ext);
  const isDoc = ["doc", "docx", "rtf", "odt"].includes(ext);
  const isExcel = ["xls", "xlsx", "csv", "ods"].includes(ext);
  const isPpt = ["ppt", "pptx", "key"].includes(ext);
  const isText = [
    "txt",
    "log",
    "md",
    "json",
    "xml",
    "html",
    "css",
    "js",
  ].includes(ext);
  const isArchive = ["zip", "rar", "7z", "tar", "gz"].includes(ext);
  const isEps = ["eps"].includes(ext);
  const isAi = ["ai"].includes(ext);
  const isPsd = ["psd"].includes(ext);
  const isDesign = ["xd", "fig", "sketch", "cdr"].includes(ext);

  // --- Default icons ---
  const icons = {
    image: "", // real image shown
    video: "/images/video.png",
    audio: "/images/audio.png",
    pdf: "/images/pdf.png",
    doc: "/images/doc.png",
    excel: "/images/excel.png",
    ppt: "/images/ppt.png",
    text: "/images/text.png",
    zip: "/images/zip.png",
    design: "/images/design.png",
    eps: "/images/eps.png",
    ai: "/images/ai.png",
    psd: "/images/psd.png",
    default: "/images/file.png",
  };

  let icon = "";

  // --- Logic ---
  if (isImage) {
    // For images & videos, return actual media file URL
    icon = fileUrl;
  } else if (isVideo) {
    icon = icons.video;
  } else if (isPdf) {
    icon = icons.pdf;
  } else if (isDoc) {
    icon = icons.doc;
  } else if (isExcel) {
    icon = icons.excel;
  } else if (isPpt) {
    icon = icons.ppt;
  } else if (isText) {
    icon = icons.text;
  } else if (isArchive) {
    icon = icons.zip;
  } else if (isAudio) {
    icon = icons.audio;
  } else if (isDesign) {
    icon = icons.design;
  } else if (isEps) {
    icon = icons.eps;
  } else if (isAi) {
    icon = icons.ai;
  } else if (isPsd) {
    icon = icons.psd;
  } else {
    icon = icons.default;
  }

  return { icon, ext };
}
