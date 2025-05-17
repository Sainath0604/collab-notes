import React, { useEffect, useState } from "react";
import { Badge, Dropdown, List, Spin } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { Notification, useAuth } from "../context/AuthContext";
import { host } from "../constant/api-constants";

const NotificationBell: React.FC = () => {
  const { token, newNotification } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${host}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    await fetch(`${host}/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = async (id: string) => {
    await fetch(`${host}/api/notifications/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const clearAll = async () => {
    await fetch(`${host}/api/notifications`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setNotifications([]);
  };

  useEffect(() => {
    fetchNotifications();
  }, []); // Only run once on mount

  useEffect(() => {
    if (newNotification) {
      console.log(
        "[Bell] Received notification from context:",
        newNotification
      );
      if (newNotification) {
        setNotifications((prev) => [newNotification, ...prev]);
      }
    }
  }, [newNotification]);

  const menu = (
    <div className="w-80 max-h-96 overflow-y-auto bg-white shadow rounded">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <span className="font-semibold text-sm">Notifications</span>
        <button
          className="text-xs text-blue-500 hover:underline"
          onClick={clearAll}
        >
          Clear All
        </button>
      </div>
      {loading ? (
        <div className="p-4">
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No notifications</div>
      ) : (
        <List
          size="small"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                item.read ? "opacity-60" : ""
              }`}
              onClick={() => markAsRead(item._id)}
              actions={[
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(item._id);
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Delete
                </span>,
              ]}
            >
              <div>
                <div className="font-medium">{item.message}</div>
                <div className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );

  const notificationDropdown = {
    items: [
      {
        key: "custom",
        label: menu, // the same custom JSX block you already built
      },
    ],
  };

  return (
    <Dropdown menu={notificationDropdown} trigger={["click"]}>
      <div className="cursor-pointer relative">
        <Badge count={notifications.length} size="small">
          <BellOutlined className="text-xl" />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default NotificationBell;
