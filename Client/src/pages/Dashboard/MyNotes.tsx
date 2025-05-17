import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { host } from "../../constant/api-constants";
import ShareModal from "../../components/ShareModal";
import { Tooltip } from "antd";

interface Collaborator {
  userId: string;
  permission: "read" | "write";
  _id: string;
}
interface Note {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
  collaborators: Collaborator[];
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
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeNoteCollaborators, setActiveNoteCollaborators] = useState<
    string[]
  >([]);
  const [allUsers, setAllUsers] = useState<{
    [id: string]: { name: string; email: string };
  }>({});

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await fetch(`${host}/api/auth/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch users");

        const userMap: { [id: string]: { name: string; email: string } } = {};
        for (const user of data) {
          userMap[user._id] = { name: user.name, email: user.email };
        }
        setAllUsers(userMap);
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };

    fetchAllUsers();
  }, [token]);

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
            <p className="text-xs text-gray-500/60 mt-1">
              Last updated: {new Date(note.updatedAt).toLocaleString()}
            </p>
            {note.collaborators.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.collaborators.map((collab) => {
                  const user = allUsers[collab.userId];
                  if (!user) return null;
                  return (
                    <Tooltip
                      title={"Collaborator"}
                      placement="left"
                      color="blue"
                    >
                      <span
                        key={collab._id}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full border"
                      >
                        {user.name} ({user.email})
                      </span>
                    </Tooltip>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                // onClick={() => openShareModal(note._id)}
                onClick={() => {
                  setActiveNoteId(note._id);
                  setActiveNoteCollaborators(
                    note.collaborators.map((c) => c.userId)
                  );
                }}
                className="text-blue-600 hover:underline text-sm"
              >
                Share
              </button>
            </div>
          </div>
        ))}

        {activeNoteId && (
          <ShareModal
            noteId={activeNoteId}
            existingCollaboratorIds={activeNoteCollaborators}
            onClose={() => {
              setActiveNoteId(null);
              setActiveNoteCollaborators([]);
            }}
          />
        )}
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
