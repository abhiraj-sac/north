import FeatureStrip from "./components/FeatureStrip";
import Header from "./components/Header";
import EngineeringPreview from "./components/EngineeringPreview";
import SystemFooter from "./components/SystemFooter";
import WorkspaceStatus from "./components/WorkspaceStatus";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <Routes>
      <Route element={<ApplicationShell />}>
        <Route index element={<Navigate to="/signin" replace />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Route>
    </Routes>
  );
}

function ApplicationShell() {
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
