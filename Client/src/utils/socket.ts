// utils/socket.ts
import { io, Socket } from "socket.io-client";
import { host } from "../constant/api-constants";

let socket: Socket;

export const connectSocket = (token: string) => {
  socket = io(host, {
    auth: { token },
    transports: ["websocket"],
  });
  return socket;
};

export const getSocket = () => socket;
