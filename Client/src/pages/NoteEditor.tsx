import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { host } from "../constant/api-constants";
import { getLoggedInEmail } from "../utils/utils";
import { io, Socket } from "socket.io-client";

interface Collaborator {
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  permission: "read" | "write";
}

const NoteEditor: React.FC = () => {
  const { token } = useAuth();
  const { noteId } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loggedInEmail = getLoggedInEmail();
  const [dirty, setDirty] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const autosaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const otherCollaborators = collaborators.filter(
    (c) => c.userId.email !== loggedInEmail
  );

  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastReceivedUpdateRef = useRef<{
    title: string;
    content: string;
  } | null>(null);
  const lastSentUpdateRef = useRef<{ title: string; content: string } | null>(
    null
  );

  // Fetch note
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
        setCollaborators(data.collaborators);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [noteId, token]);

  // Setup socket connection
  useEffect(() => {
    const socket = io(host, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.emit("join-note", noteId);
    // console.log("[Socket] ✅ Joined note room:", noteId);

    socket.on("receive-update", (data: { title: string; content: string }) => {
      // console.log("[Socket] ✏️ receive-update received:", data);

      // Skip update if it's the same as last sent (avoid loop)
      const lastSent = lastSentUpdateRef.current;
      if (
        lastSent &&
        lastSent.title === data.title &&
        lastSent.content === data.content
      ) {
        // console.log("[Socket] 🔁 Ignored own echo");
        return;
      }

      lastReceivedUpdateRef.current = data;

      if (!isTypingRef.current) {
        // console.log("[Socket] ✅ Applying remote update");
        setTitle(data.title);
        setContent(data.content);
      } else {
        // console.log("[Socket] ✋ Skipped sync - user is typing");
      }
    });

    return () => {
      socket.emit("note:leave", noteId);
      socket.disconnect();
      // console.log("[Socket] ❌ Disconnected from note room:", noteId);
    };
  }, [noteId, token]);

  const broadcastChange = (newTitle: string, newContent: string) => {
    // console.log("[Socket] 📤 Emitting send-update", { newTitle, newContent });

    lastSentUpdateRef.current = { title: newTitle, content: newContent };

    socketRef.current?.emit("send-update", {
      noteId,
      updatedContent: {
        title: newTitle,
        content: newContent,
      },
    });
  };

  const markTyping = () => {
    isTypingRef.current = true;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      // console.log("[Typing] User stopped typing");
    }, 2000); // 2s of no activity = stopped typing
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setDirty(true);
    broadcastChange(newTitle, content);
    markTyping();
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setDirty(true);
    broadcastChange(title, newContent);
    markTyping();
  };

  const handleSave = async () => {
    if (!dirty) return;
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
      setDirty(false);
      // console.log("[Save] ✅ Autosaved");
    } catch (err: any) {
      console.error("[Save] ❌ Autosave failed:", err.message);
    }
  };

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

      {otherCollaborators.length > 0 && (
        <div className="text-sm text-gray-600">
          Shared with:{" "}
          {otherCollaborators.map((c, i) => (
            <span key={c.userId._id} className="mr-2">
              {c.userId.email}
              {i < otherCollaborators.length - 1 && ","}
            </span>
          ))}
        </div>
      )}

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
