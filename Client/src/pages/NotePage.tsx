import React, { useEffect, useState } from "react";
import NoteEditor from "../components/NoteEditor";

interface NotePageProps {
  noteId: string;
}

const NotePage: React.FC<NotePageProps> = ({ noteId }) => {
  const [initialContent, setInitialContent] = useState("");

  useEffect(() => {
    // TODO: Fetch initial note content from API
    fetch(`/api/notes/${noteId}`)
      .then((res) => res.json())
      .then((data) => setInitialContent(data.content))
      .catch(console.error);
  }, [noteId]);

  if (!initialContent) return <div>Loading...</div>;

  return <NoteEditor noteId={noteId} initialContent={initialContent} />;
};

export default NotePage;
