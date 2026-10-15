import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import AuthCard from "../components/AuthCard";
import { AuthField, PasswordField } from "../components/AuthField";

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberSession, setRememberSession] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState("");

  const emailError = submitted
    ? !email.trim()
      ? "Enter your email address."
      : !validEmail(email)
        ? "Enter a valid email address."
        : undefined
    : undefined;
  const passwordError = submitted && !password ? "Enter your password." : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setNotice("");
    if (!email.trim() || !validEmail(email) || !password) return;
    setNotice("Authentication is not connected yet. Nothing was sent or saved.");
  }

  return (
    <AuthCard mode="signin">
      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        <AuthField
          id="signin-email"
          label="EMAIL ADDRESS"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          error={emailError}
        />
        <PasswordField
          id="signin-password"
          label="PASSWORD"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          error={passwordError}
        />

        <div className="session-row">
          <label className="remember-label">
            <input
              type="checkbox"
              checked={rememberSession}
              onChange={(event) => setRememberSession(event.currentTarget.checked)}
            />
            <span>Remember this session</span>
          </label>
          <span className="session-badge">THIS DEVICE ONLY</span>
        </div>

        <button className="auth-submit" type="submit">
          <span>Sign In to Workspace</span>
          <ArrowRight size={15} strokeWidth={1.8} />
        </button>
        {notice && (
          <p className="auth-submit-notice" role="status">
            {notice}
          </p>
        )}
      </form>
    </AuthCard>
  );
}
