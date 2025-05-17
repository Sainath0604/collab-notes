import { io, Socket } from "socket.io-client";
import { host } from "../constant/api-constants";

let socket: Socket;

export const connectSocket = (token: string) => {
  // console.log("[Socket] Attempting connection with token:", token);

  if (!socket || !socket.connected) {
    // console.log("[Socket] Connecting to server with token...");
    socket = io(host, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      // console.log("[Socket] Connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("[Socket] Disconnected:", reason);
    });
  } else {
    // console.log("[Socket] Already connected, skipping reconnection");
  }

  return socket;
};

export const getSocket = () => socket;
