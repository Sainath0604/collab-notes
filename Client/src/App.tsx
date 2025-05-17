import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";

import NotePage from "./pages/NotePage";
import AuthPage from "./pages/AuthPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "../tailwind.css";
import "antd/dist/reset.css";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import MyNotes from "./pages/Dashboard/MyNotes";
import SharedWithMe from "./pages/Dashboard/SharedWithMe";
import CreateNote from "./pages/Dashboard/CreateNote";
import NoteEditor from "./pages/NoteEditor";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const RedirectIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <>{children}</>
  );
};

const NotePageWrapper: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  if (!noteId)
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-lg">
        Note ID missing
      </div>
    );
  return <NotePage noteId={noteId} />;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route
              path="/login"
              element={
                <RedirectIfAuthenticated>
                  <AuthPage />
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="/signup"
              element={
                <RedirectIfAuthenticated>
                  <AuthPage />
                </RedirectIfAuthenticated>
              }
            />

            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route index element={<MyNotes />} />
              <Route path="my-notes" element={<MyNotes />} />
              <Route path="shared-with-me" element={<SharedWithMe />} />
              <Route path="create-note" element={<CreateNote />} />
            </Route>

            <Route
              path="/note/:noteId"
              element={
                <RequireAuth>
                  <NotePageWrapper />
                </RequireAuth>
              }
            />
            <Route path="/notes/:noteId/edit" element={<NoteEditor />} />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
