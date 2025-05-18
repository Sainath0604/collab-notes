import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { host } from "../../constant/api-constants";
import ShareModal from "../../components/ShareModal";
import { Tooltip } from "antd";
import { getLoggedInEmail } from "../../utils/utils";

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

const SharedWithMe: React.FC = () => {
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

  const loggedInEmail = getLoggedInEmail();

  // Fetch all users once on mount (or token change)
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

  // Fetch notes for current page
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${host}/api/notes/shared-with-me?page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
            <h2 className="text-xl font-semibold text-gray-700">
              You don’t have any shared notes.
            </h2>
            {/* <p className="text-gray-500">Get started by creating notes.</p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/dashboard/create-note")}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
              >
                Create Note
              </button>
            </div> */}
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => {
              // Filter collaborators to exclude logged-in user and invalid users
              const filteredCollaborators = note.collaborators.filter(
                (collab) => {
                  const user = allUsers[collab.userId];
                  return user && user.email !== loggedInEmail;
                }
              );

              return (
                <div
                  key={note._id}
                  className="bg-white shadow-md rounded-xl p-4 border hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold">{note.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {note.content}
                  </p>
                  <p className="text-xs text-gray-500/60 mt-1">
                    Last updated: {new Date(note.updatedAt).toLocaleString()}
                  </p>

                  {/* Show filtered collaborators only if exists */}
                  {filteredCollaborators.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {filteredCollaborators.map((collab) => {
                        const user = allUsers[collab.userId];
                        if (!user) return null;
                        return (
                          <Tooltip
                            key={collab._id}
                            title="Collaborator"
                            placement="left"
                            color="blue"
                          >
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full border">
                              {user.name} ({user.email})
                            </span>
                          </Tooltip>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-end mt-4 space-x-4">
                    <button
                      onClick={() => navigate(`/notes/${note._id}/edit`)}
                      className="text-green-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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

export default SharedWithMe;
