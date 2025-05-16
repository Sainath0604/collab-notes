import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    const bearerToken = localStorage.getItem("token");

    try {
      await fetch("http://localhost:5000/api/auth/logout", {
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
    <div className="min-h-screen bg-white p-6 relative">
      {/* Logout Button top right */}
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
      >
        Logout
      </button>

      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <nav>
        <ul className="space-y-2">
          <li>
            <Link
              to="/dashboard/my-notes"
              className="text-blue-600 hover:underline"
            >
              My Notes
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/shared-with-me"
              className="text-blue-600 hover:underline"
            >
              Shared with Me
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/create-note"
              className="text-blue-600 hover:underline"
            >
              Create New Note
            </Link>
          </li>
        </ul>
      </nav>

      <p className="mt-8 text-gray-600">Choose a section</p>
    </div>
  );
};

export default Dashboard;
