import { useNavigate, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import FeatureStrip from "./components/FeatureStrip";
import Header from "./components/Header";
import EngineeringPreview from "./components/EngineeringPreview";
import SystemFooter from "./components/SystemFooter";
import WorkspaceStatus from "./components/WorkspaceStatus";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route element={<LandingShell />}>
          <Route index element={<Navigate to="/signin" replace />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="signup" element={<SignUp />} />
        </Route>
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<WorkspaceShell />}>
          <Route path="workspace" element={<Dashboard />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
}

function LandingShell() {
  return (
    <main className="page-shell">
      <div className="application-frame">
        <Header />
        <WorkspaceStatus />
        <FeatureStrip />
        <section className="content-reservation" aria-label="Workspace content">
          <div className="reserved-column reserved-column-primary">
            <Outlet />
          </div>
          <div className="reserved-column reserved-column-secondary">
            <EngineeringPreview />
          </div>
        </section>
        <SystemFooter />
      </div>
    </main>
  );
}

function WorkspaceShell() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate("/signin", { replace: true });
  }

  return (
    <main className="page-shell">
      <div className="application-frame">
        <Header onLogout={handleSignOut} />
        <section className="dashboard-content" aria-label="NORTH workspace">
          <Outlet />
        </section>
      </div>
    </main>
  );
}

function PublicOnlyRoute() {
  const { status } = useAuth();

  if (status === "loading") {
    return <SessionScreen message="Checking your NORTH session..." loading />;
  }

  if (status === "authenticated") {
    return <Navigate to="/workspace" replace />;
  }

  return <Outlet />;
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
