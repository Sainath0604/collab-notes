import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { host } from "../constant/api-constants";
import { io, Socket } from "socket.io-client";

const NoteEditor: React.FC = () => {
  const { token } = useAuth();
  const { noteId } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false); // <-- track unsaved changes

  const socketRef = useRef<Socket | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(`${host}/api/notes/${noteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load note");

        setTitle(data.title);
        setContent(data.content);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId, token]);

  useEffect(() => {
    const socket = io(host, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.emit("note:join", noteId);

    socket.on("note:sync", (data: { title: string; content: string }) => {
      setTitle(data.title);
      setContent(data.content);
    });

    return () => {
      socket.emit("note:leave", noteId);
      socket.disconnect();
    };
  }, [noteId, token]);

  const broadcastChange = (newTitle: string, newContent: string) => {
    socketRef.current?.emit("note:update", {
      noteId,
      title: newTitle,
      content: newContent,
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    broadcastChange(newTitle, content);
    setDirty(true);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    broadcastChange(title, newContent);
    setDirty(true);
  };

  const handleSave = async () => {
    if (!dirty) return; // skip if no changes
    try {
      const res = await fetch(`${host}/api/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save note");
      setDirty(false); // reset dirty state after save
    } catch (err: any) {
      console.error("Autosave failed:", err.message);
    }
  };

  // ⏱️ Autosave every 5 seconds
  useEffect(() => {
    autosaveTimer.current = setInterval(() => {
      handleSave();
    }, 10000);
    return () => {
      if (autosaveTimer.current) clearInterval(autosaveTimer.current);
    };
  }, [title, content]);

  if (loading) return <p className="p-4">Loading note...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        onBlur={handleSave}
        className="w-full text-2xl font-semibold border-b focus:outline-none"
        placeholder="Note Title"
      />
      <textarea
        value={content}
        onChange={handleContentChange}
        onBlur={handleSave}
        className="w-full h-[60vh] border rounded-lg p-4 resize-none focus:outline-none focus:ring"
        placeholder="Start writing..."
      />
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default NoteEditor;
