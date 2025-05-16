import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface NoteEditorProps {
  noteId: string;
  initialContent: string;
}

const SOCKET_SERVER_URL = "http://localhost:5000"; // Change if different

const NoteEditor: React.FC<NoteEditorProps> = ({ noteId, initialContent }) => {
  const [content, setContent] = useState(initialContent);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect socket
    socketRef.current = io(SOCKET_SERVER_URL);

    // Join the note room
    socketRef.current.emit("join-note", noteId);

    // Listen for incoming updates from collaborators
    socketRef.current.on("receive-update", (updatedContent: string) => {
      setContent(updatedContent);
    });

    // Cleanup on unmount
    return () => {
      socketRef.current?.disconnect();
    };
  }, [noteId]);

  // Emit updates when content changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Send update to server to broadcast
    socketRef.current?.emit("send-update", {
      noteId,
      updatedContent: newContent,
    });
  };

  return (
    <div>
      <h2>Note Editor</h2>
      <textarea
        rows={10}
        cols={50}
        value={content}
        onChange={handleChange}
        placeholder="Start typing your note..."
      />
    </div>
  );
};

export default NoteEditor;
