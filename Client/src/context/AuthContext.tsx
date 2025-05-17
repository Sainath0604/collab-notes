import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { connectSocket, getSocket } from "../utils/socket";
import { getLocalUser } from "../utils/utils";
import { notification as antdNotification } from "antd";

export interface Notification {
  _id: string;
  message: string;
  createdAt: string;
  type: string;
  note: string;
  read: boolean;
}

interface AuthContextType {
  token: string | null;
  login: (token: string, email: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  newNotification: Notification | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const lastNotificationRef = useRef<{
    message: string;
    timestamp: number;
  } | null>(null);

  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem("token")
  );
  const [newNotification, setNewNotification] = useState<Notification | null>(
    null
  );
  const [user] = useState(() => getLocalUser());

  const login = (newToken: string, email: string) => {
    sessionStorage.setItem("loggedInEmail", email);
    sessionStorage.setItem("token", newToken);
    sessionStorage.setItem("loggedInUser", JSON.stringify(user));
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("loggedInEmail");

    const socket = getSocket();
    if (socket && socket.connected) {
      // console.log("[Socket] Disconnecting on logout");
      socket.disconnect();
    }

    navigate("/login");
  };

  // Connect socket when token becomes available
  useEffect(() => {
    if (token) {
      // console.log("[Socket] Connecting to server with token...");
      const s = connectSocket(token);

      s.on("connect", () => {
        // console.log("[Socket] Connected:", s.id);
        const user = getLocalUser();
        if (user?._id) {
          // console.log(`[Socket] Emitting join for user ${user._id}`);
          s.emit("join", user._id);
        }
      });

      s.on("new_notification", (notification) => {
        // console.log("[Socket] 🔔 New Notification Received:", notification);
        setNewNotification(notification);

        // Show Ant Design notification
        const now = Date.now();
        const last = lastNotificationRef.current;

        const isDuplicate =
          last &&
          last.message === notification.message &&
          now - last.timestamp < 10_000; // 10 seconds

        if (!isDuplicate) {
          antdNotification.open({
            message: "New Notification",
            description: notification.message,
            placement: "topRight",
          });

          lastNotificationRef.current = {
            message: notification.message,
            timestamp: now,
          };
        } else {
          // console.log("[Socket] 🔕 Skipped duplicate notification");
        }
      });

      return () => {
        // console.log("[Socket] Cleaning up socket connection");
        s.off("new_notification");
        s.disconnect();
      };
    }
  }, [token]);

  // Join user-specific socket room
  useEffect(() => {
    const socket = getSocket();
    if (token && user?._id && socket) {
      // console.log(`[Socket] Emitting join for user: ${user._id}`);
      socket.emit("join", user._id);
    }
  }, [token, user?._id]);

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        isAuthenticated: !!token,
        newNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
