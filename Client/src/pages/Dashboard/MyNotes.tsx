import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { host } from "../../constant/api-constants";

interface Note {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface ApiResponse {
  currentPage: number;
  totalPages: number;
  totalNotes: number;
  notesPerPageLimit: number;
  notes: Note[];
}

const MyNotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${host}/api/notes?page=${page}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data: ApiResponse = await res.json();
        if (!res.ok)
          throw new Error((data as any).message || "Failed to fetch notes");

        setNotes(data.notes);
        setTotalPages(data.totalPages);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [page, token]);

  const handlePrev = () => setPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setPage((prev) => Math.min(prev + 1, totalPages));

  if (loading) return <p className="p-4">Loading notes...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] px-4 py-6">
      {/* Scrollable Notes Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {notes.map((note) => (
          <div
            key={note._id}
            className="bg-white shadow-md rounded-xl p-4 border hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">{note.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3">{note.content}</p>
            <p className="text-xs text-gray-400 mt-2">
              {/* Created: {new Date(note.createdAt).toLocaleString()} */}
            </p>
            <p className="text-xs text-gray-500/60">
              Last updated: {new Date(note.updatedAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 pt-4 border-t flex justify-center items-center space-x-4">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm font-medium">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MyNotesPage;
