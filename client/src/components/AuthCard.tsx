import { ArrowUpRight, Fingerprint, Github, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, type ReactNode } from "react";

export type AuthMode = "signin" | "signup";

interface AuthCardProps {
  mode: AuthMode;
  children: ReactNode;
}

export default function AuthCard({ mode, children }: AuthCardProps) {
  const [demoNotice, setDemoNotice] = useState(false);

  return (
    <section className="auth-card" aria-labelledby="auth-heading">
      <div className="auth-card-main">
        <div className="auth-eyebrow">
          <LockKeyhole size={12} strokeWidth={1.8} />
          SECURE ACCESS NODE
        </div>
        <h1 className="auth-heading" id="auth-heading">
          Access your sovereign career workspace.
        </h1>
        <p className="auth-intro">
          A private environment for your career intelligence. Your next move starts here.
        </p>

        <div className="auth-mode-switch" aria-label="Authentication mode">
          <Link
            to="/signin"
            className={mode === "signin" ? "auth-mode-link active" : "auth-mode-link"}
            aria-current={mode === "signin" ? "page" : undefined}
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className={mode === "signup" ? "auth-mode-link active" : "auth-mode-link"}
            aria-current={mode === "signup" ? "page" : undefined}
          >
            Create Account
          </Link>
        </div>

        <div className="auth-options" aria-label="Other sign-in options">
          <div className="auth-option">
            <Github size={15} strokeWidth={1.8} />
            <span>GitHub SSH</span>
          </div>
          <div className="auth-option">
            <Fingerprint size={15} strokeWidth={1.8} />
            <span>FIDO2 / YubiKey</span>
          </div>
        </div>

        <div className="auth-divider">
          <span />
          <span className="auth-divider-label">OR CONTINUE WITH EMAIL</span>
          <span />
        </div>

        {children}

        <div className="auth-guarantee">
          <ShieldCheck size={15} strokeWidth={1.7} />
          <p>
            This UI-only preview does not send or save credentials. Authentication is not
            connected yet.
          </p>
        </div>
      </div>

      <div className="demo-strip">
        <span>Just exploring? Enter the demo workspace.</span>
        <button
          className="demo-button"
          type="button"
          onClick={() => setDemoNotice(true)}
        >
          Launch Demo <ArrowUpRight size={12} strokeWidth={1.8} />
        </button>
        {demoNotice && (
          <span className="demo-notice" role="status">
            Demo workspace coming soon.
          </span>
        )}
      </div>
    </section>
  );
}
