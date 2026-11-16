import { useNavigate, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ApplicationWorkspacePage from "./pages/ApplicationWorkspacePage";
import {
  ResumeLibraryProvider,
  useResumeLibrary,
} from "./auth/ResumeLibraryContext";
import ResumeStudioPage from "./pages/ResumeStudioPage";
import EngineeringPreview from "./components/EngineeringPreview";
import FeatureStrip from "./components/FeatureStrip";
import Header from "./components/Header";
import SystemFooter from "./components/SystemFooter";
import WorkspaceStatus from "./components/WorkspaceStatus";
import Landing from "./pages/Landing";
import PlaceholderPage from "./pages/PlaceholderPage";
import ProfileResumesPage from "./pages/ProfileResumesPage";
import SignIn from "./pages/SignIn";
import DiscoveredRolesPage from "./pages/DiscoveredRolesPage";
import SignUp from "./pages/SignUp";

export default function App() {
  return (
    <AuthProvider>
      <ResumeLibraryProvider>
        <AppRoutes />
      </ResumeLibraryProvider>
    </AuthProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthShell />}>
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
        </Route>
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<WorkspaceShell />}>
          <Route index element={<Landing />} />
          <Route path="profile" element={<ProfileResumesPage />} />
          <Route path="roles" element={<DiscoveredRolesPage />} />
          <Route
  path="applications/new/:jobId"
  element={<ApplicationWorkspacePage />}
/>
          <Route
  path="studio/:jobId"
  element={<ResumeStudioPage />}
/>
          <Route
            path="journey"
            element={<PlaceholderPage title="Application Journey" />}
          />
        </Route>
      </Route>
      <Route path="*" element={<UnknownRoute />} />
    </Routes>
  );
}

function AuthShell() {
  return (
    <main className="page-shell">
      <div className="application-frame">
        <Header variant="auth" />
        <WorkspaceStatus />
        <FeatureStrip />
        <section className="auth-page-content" aria-label="Sign in or create an account">
          <div className="auth-page-form">
            <Outlet />
          </div>
          <EngineeringPreview />
        </section>
        <SystemFooter />
      </div>
    </main>
  );
}

function WorkspaceShell() {
  const { signOut } = useAuth();
  const { clearSelectedFiles } = useResumeLibrary();
  const navigate = useNavigate();

  function handleSignOut() {
    clearSelectedFiles()
    signOut();
    navigate("/signin", { replace: true });
  }

  return (
    <main className="page-shell">
      <div className="application-frame">
        <Header onLogout={handleSignOut} />
        <section className="workspace-content" aria-label="NORTH workspace">
          <Outlet />
        </section>
      </div>
    </main>
  );
}

function PublicOnlyRoute() {
  const { status, error, retrySessionCheck } = useAuth();

  if (status === "loading") {
    return <SessionScreen message="Checking your NORTH session..." loading />;
  }

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  if (status === "error") {
    return (
      <SessionScreen
        message="Your session could not be checked."
        detail={error ?? undefined}
        actionLabel="Try again"
        onAction={retrySessionCheck}
      />
    );
  }

  return <Outlet />;
}

function UnknownRoute() {
  const { status, error, retrySessionCheck } = useAuth();

  if (status === "loading") {
    return <SessionScreen message="Checking your NORTH session..." loading />;
  }

  if (status === "error") {
    return (
      <SessionScreen
        message="Your session could not be checked."
        detail={error ?? undefined}
        actionLabel="Try again"
        onAction={retrySessionCheck}
      />
    );
  }

  return <Navigate to={status === "authenticated" ? "/" : "/signin"} replace />;
}

function RequireAuth() {
  const { status, error, retrySessionCheck } = useAuth();

  if (status === "loading") {
    return <SessionScreen message="Checking your NORTH session..." loading />;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/signin" replace />;
  }

  if (status === "error") {
    return (
      <SessionScreen
        message="Your session could not be checked."
        detail={error ?? undefined}
        actionLabel="Try again"
        onAction={retrySessionCheck}
      />
    );
  }

  return <Outlet />;
}

function SessionScreen({
  message,
  detail,
  actionLabel,
  onAction,
  loading = false,
}: {
  message: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
}) {
  return (
    <main className="session-screen">
      <section className="session-message" role="status" aria-live="polite">
        {loading && <span className="session-spinner" aria-hidden="true" />}
        <h1>{message}</h1>
        {detail && <p>{detail}</p>}
        {actionLabel && onAction && (
          <button className="session-retry" type="button" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </section>
    </main>
  );
}
