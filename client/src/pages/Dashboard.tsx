import { FileStack, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="dashboard-loading" role="status">
        Loading your workspace...
      </div>
    );
  }

  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="dashboard-inner">
      <div className="dashboard-intro">
        <p className="dashboard-kicker">
          <span className="status-dot" />
          YOUR PRIVATE WORKSPACE
        </p>
        <h1>Welcome, {user.name}.</h1>
        <p className="dashboard-lede">
          A clearer view of your experience starts with the work you have already done.
        </p>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card profile-card" aria-labelledby="profile-title">
          <div className="dashboard-card-heading">
            <span className="dashboard-icon">
              <UserRound size={16} strokeWidth={1.7} />
            </span>
            <span className="dashboard-label">ACCOUNT PROFILE</span>
          </div>
          <div className="profile-identity">
            <span className="profile-avatar" aria-hidden="true">
              {initials || "N"}
            </span>
            <div className="profile-copy">
              <h2 id="profile-title">{user.name}</h2>
              <p>{user.email}</p>
            </div>
          </div>
          <div className="profile-footnote">
            <ShieldCheck size={13} strokeWidth={1.8} />
            <span>Profile details confirmed from your NORTH account.</span>
          </div>
        </section>

        <section className="dashboard-card resume-card" aria-labelledby="resume-title">
          <div className="resume-card-topline">
            <div className="dashboard-card-heading">
              <span className="dashboard-icon">
                <FileStack size={16} strokeWidth={1.7} />
              </span>
              <span className="dashboard-label">CAREER INTELLIGENCE</span>
            </div>
            <span className="resume-limit">UP TO 3 RESUMES</span>
          </div>
          <h2 id="resume-title">Build your career record.</h2>
          <p className="resume-description">
            Bring together up to three resumes to prepare a consolidated view of your
            technical skills and experience.
          </p>
          <div className="resume-next-step">
            <span className="resume-next-step-mark" aria-hidden="true" />
            <p>
              Resume intake and analysis are not connected yet. This workspace will show
              your profile here when that capability is available.
            </p>
          </div>
        </section>
      </div>

      <p className="dashboard-note">
        Job discovery and tailored resumes will be available in a later workspace phase.
      </p>
    </div>
  );
}
