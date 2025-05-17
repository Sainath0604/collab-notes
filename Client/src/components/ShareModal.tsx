import React, { useEffect, useState } from "react";
import { Modal, Select, message } from "antd";
import { useAuth } from "../context/AuthContext";
import { host } from "../constant/api-constants";

interface ShareModalProps {
  noteId: string;
  onClose: () => void;
  existingCollaboratorIds: string[];
}

interface User {
  _id: string;
  name: string;
  email: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  noteId,
  onClose,
  existingCollaboratorIds,
}) => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [permission, setPermission] = useState<"read" | "write">("write");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${host}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch users");
        setUsers(data);
      } catch (err: any) {
        message.error(err.message);
      }
    };
    fetchUsers();
  }, [token]);

  const handleShare = async () => {
    if (!selectedUserId) return;

    setLoading(true);
    try {
      const res = await fetch(`${host}/api/notes/${noteId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: selectedUserId, permission }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Share failed");

      message.success("Note shared successfully!");
      onClose();
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open
      title="Share Note"
      onCancel={onClose}
      footer={
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={!selectedUserId || loading}
            className={`px-4 py-2 rounded text-white ${
              loading || !selectedUserId
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <Select
          style={{ width: "100%" }}
          placeholder="Select a user"
          onChange={setSelectedUserId}
          value={selectedUserId}
        >
          {users.map((user) => (
            <Select.Option
              key={user._id}
              value={user._id}
              disabled={existingCollaboratorIds.includes(user._id)}
            >
              {user.name} ({user.email})
            </Select.Option>
          ))}
        </Select>

        <Select
          style={{ width: "100%" }}
          value={permission}
          onChange={(value) => setPermission(value)}
        >
          <Select.Option value="read">Read</Select.Option>
          <Select.Option value="write">Write</Select.Option>
        </Select>
      </div>
    </Modal>
  );
};

export default ShareModal;
