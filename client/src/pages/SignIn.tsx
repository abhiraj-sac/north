import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import AuthCard from "../components/AuthCard";
import { AuthField, PasswordField } from "../components/AuthField";
import { api } from "../lib/api";
import axios from "axios";
import { useAuth, type UserProfile } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberSession, setRememberSession] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState("");
  const { establishSession } = useAuth();
  const navigate = useNavigate();

  const emailError = submitted
    ? !email.trim()
      ? "Enter your email address."
      : !validEmail(email)
        ? "Enter a valid email address."
        : undefined
    : undefined;
  const passwordError = submitted && !password ? "Enter your password." : undefined;


  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setNotice("");

    if (!email.trim() || !validEmail(email) || !password) {
      return;
    }

    let validatingProfile = false;
    try {
      const response = await api.post<{ user: UserProfile; token: string }>(
        "/api/auth/signin",
        {
          email: email.trim().toLowerCase(),
          password,
        },
      );

      const { user, token } = response.data;

      if (
        typeof token !== "string" ||
        !token ||
        !user ||
        typeof user.id !== "string" ||
        typeof user.name !== "string" ||
        typeof user.email !== "string"
      ) {
        setNotice("Login response is missing user or token.");
        return;
      }

      validatingProfile = true;
      await establishSession(token, rememberSession);
      navigate("/workspace", { replace: true });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Signin error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        if (error.response?.status === 401) {
          setNotice(
            validatingProfile
              ? "Your session could not be validated. Please sign in again."
              : "Invalid email or password.",
          );
        } else if (!error.response) {
          setNotice(
            validatingProfile
              ? "Unable to validate your profile. Please try again."
              : "Unable to connect to the server. Please try again.",
          );
        } else {
          setNotice(
            error.response.data?.message ||
              (validatingProfile
                ? "Unable to validate your profile. Please try again."
                : "Sign in failed. Please try again."),
          );
        }
      } else {
        console.error("Unexpected signin error:", error);
        setNotice("An unexpected error occurred.");
      }
    }
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
