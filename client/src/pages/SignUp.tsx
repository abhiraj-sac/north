import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import AuthCard from "../components/AuthCard";
import { AuthField, PasswordField } from "../components/AuthField";

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState("");

  const nameError = submitted && !fullName.trim() ? "Enter your full name." : undefined;
  const emailError = submitted
    ? !email.trim()
      ? "Enter your email address."
      : !validEmail(email)
        ? "Enter a valid email address."
        : undefined
    : undefined;
  const passwordError = submitted
    ? !password
      ? "Create a password."
      : password.length < 8
        ? "Use at least 8 characters."
        : undefined
    : undefined;
  const confirmError = submitted
    ? !confirmPassword
      ? "Confirm your password."
      : confirmPassword !== password
        ? "Passwords do not match."
        : undefined
    : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setNotice("");
    if (
      !fullName.trim() ||
      !email.trim() ||
      !validEmail(email) ||
      password.length < 8 ||
      confirmPassword !== password
    ) {
      return;
    }
    setNotice("Account creation is not connected yet. Nothing was sent or saved.");
  }

  return (
    <AuthCard mode="signup">
      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        <AuthField
          id="signup-name"
          label="FULL NAME"
          value={fullName}
          onChange={setFullName}
          autoComplete="name"
          error={nameError}
        />
        <AuthField
          id="signup-email"
          label="EMAIL ADDRESS"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          error={emailError}
        />
        <PasswordField
          id="signup-password"
          label="PASSWORD"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          error={passwordError}
        />
        <PasswordField
          id="signup-confirm-password"
          label="CONFIRM PASSWORD"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          error={confirmError}
        />
        <button className="auth-submit" type="submit">
          <span>Create Workspace Account</span>
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
