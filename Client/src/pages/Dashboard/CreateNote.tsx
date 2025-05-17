import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { host } from "../../constant/api-constants";
import { Modal, message } from "antd";

const CreateNote: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${host}/api/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create note");

      // On success, show modal
      Modal.confirm({
        title: "Note Created",
        content: "Do you want to start editing this note now?",
        okText: "Yes, Edit",
        cancelText: "No, Go to My Notes",
        onOk: () => navigate(`/notes/${data._id}/edit`),
        onCancel: () => navigate("/dashboard/my-notes"),

        okButtonProps: {
          className:
            "bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md px-4 py-2",
        },
        cancelButtonProps: {
          className:
            "bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md px-4 py-2",
        },
      });

      message.success("Note created successfully");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Create New Note</h2>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <input
        type="text"
        placeholder="Title"
        className="w-full px-4 py-2 border rounded mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Content"
        className="w-full px-4 py-2 border rounded mb-4 h-40 resize-none"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button
        onClick={handleCreate}
        disabled={loading || !title}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Note"}
      </button>
    </div>
  );
};

export default CreateNote;
