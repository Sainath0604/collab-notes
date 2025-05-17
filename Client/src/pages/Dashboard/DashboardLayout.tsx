// src/pages/Dashboard/DashboardLayout.tsx
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logoutAPI } from "../../constant/api-constants";

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const links = [
    { to: "/dashboard/my-notes", label: "My Notes" },
    { to: "/dashboard/shared-with-me", label: "Shared with Me" },
    { to: "/dashboard/create-note", label: "Create New Note" },
  ];

  const handleLogout = async () => {
    const bearerToken = localStorage.getItem("token");

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

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-6">Dashboard</h2>
          <nav className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-3 py-2 rounded ${
                  location.pathname === link.to
                    ? "bg-gray-700"
                    : "hover:bg-gray-700"
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
      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
