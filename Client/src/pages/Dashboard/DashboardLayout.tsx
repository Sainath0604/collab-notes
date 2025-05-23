// src/pages/Dashboard/DashboardLayout.tsx
import React, { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logoutAPI } from "../../constant/api-constants";
import { notification } from "antd";
import { getSocket } from "../../utils/socket";
import NotificationBell from "../../components/NotificationBell";

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const links = [
    { to: "/dashboard/my-notes", label: "My Notes" },
    { to: "/dashboard/shared-with-me", label: "Shared with Me" },
    { to: "/dashboard/create-note", label: "Create New Note" },
  ];

  const handleLogout = async () => {
    const bearerToken = sessionStorage.getItem("token");

    try {
      await fetch(logoutAPI, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });
    } catch (err) {
      console.warn("Logout API call failed", err);
    } finally {
      logout();
    }
  };

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    socket.on("new_notification", (data) => {
      notification.open({
        message: "New Notification",
        description: data.message,
        duration: 5,
      });

      // Optionally store in context or refetch notifications
    });

    return () => {
      socket.off("new_notification");
    };
  }, []);

  return (
    <div className="flex min-h-screen relative">
      <div className="absolute top-4 right-4 z-50">
        <NotificationBell />
      </div>
      <aside className="w-64 bg-emerald-200 text-gray-800 p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-6 text-emerald-900">Dashboard</h2>

          <nav className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-3 py-2 rounded ${
                  (location.pathname === "/dashboard" &&
                    link.to === "/dashboard/my-notes") ||
                  location.pathname === link.to
                    ? "bg-emerald-400 text-emerald-800"
                    : "hover:bg-emerald-400 text-emerald-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </aside>
      <main className="flex-1 p-6 bg-emerald-50">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
