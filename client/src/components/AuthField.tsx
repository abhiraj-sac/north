import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";

type TextInputType = Extract<InputHTMLAttributes<HTMLInputElement>["type"], "text" | "email">;

interface AuthFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: TextInputType;
  autoComplete: string;
  error?: string;
}

export function AuthField({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  error,
}: AuthFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="auth-field">
      <label className="auth-field-label" htmlFor={id}>
        {label}
      </label>
      <input
        className={error ? "auth-input has-error" : "auth-input"}
        id={id}
        name={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.currentTarget.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span className="auth-field-error" id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  error?: string;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  error,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;

  return (
    <div className="auth-field">
      <label className="auth-field-label" htmlFor={id}>
        {label}
      </label>
      <div className={error ? "password-input-wrap has-error" : "password-input-wrap"}>
        <input
          className="auth-input"
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.currentTarget.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        <button
          className="password-visibility"
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {error && (
        <span className="auth-field-error" id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
