"use client";
import { createContext, ReactNode, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { axiosInstance } from "./axios-instance";
import { userStore } from "@/zustand/user.store";

export const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  // const [role, setRole] = useState("");
  const { user } = userStore();

  useEffect(() => {
    // Check role from database
    const connectWs = async () => {
      const { data } = await axiosInstance.get("/auth/get-session");
      let serverUri = "";
      const role = data.data.role;
      if (role === "admin") {
        serverUri = process.env.NEXT_PUBLIC_ADMIN_SERVER_URI!;
      } else if (role === "member") {
        serverUri = process.env.NEXT_PUBLIC_MEMBER_SERVER_URI!;
      }
      // Geting client IP address
      const response = await fetch("https://api.ipify.org?format=json");
      const ipData = await response.json();
      const ip = ipData.ip;
      // Connect ws to server on the base of role
      const socketIo = io(serverUri, {
        transports: ["websocket"],
        withCredentials: true,
        forceNew: true,
        auth: {
          role: data.data.role,
          ip,
        },
      });
      // const socketIo = io("https://backend.taskhuddle.live", {
      //   path: `/${role}/socket.io`,
      //   transports: ["websocket"],
      //   withCredentials: true,
      //   forceNew: true,
      //   auth: {
      //     role: data.data.role,
      //     ip,
      //   },
      // });

      socketIo.on("connect", async () => {
        console.log("✅ Connected to admin socket server");
        setSocket(socketIo);
      });

      socketIo.on("test", (data) => {
        console.log(data);
      });

      socketIo.on("disconnect", (reason) => {
        console.warn("⚠️ Disconnected from admin socket:", reason);
      });

      return () => {
        socketIo.disconnect();
      };
    };
    connectWs();
  }, [user]);

  // useEffect(() => {
  //   if (!socket || !socket.id || !role) return;

  //   const updateSocket = async () => {
  //     try {
  //       const res = await axiosInstance.post(
  //         `/${role === "admin" ? "admin" : "member"}/organizations/socket`,
  //         {
  //           socketId: socket.id,
  //         }
  //       );
  //       console.log("🔗 Socket ID updated:", res.data);
  //     } catch (err) {
  //       console.error("❌ Failed to update socket ID:", err);
  //     }
  //   };

  //   updateSocket();
  // }, [socket?.id, role]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
