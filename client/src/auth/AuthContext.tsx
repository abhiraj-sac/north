import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../lib/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";
type SessionStorage = Storage;

interface AuthContextValue {
  status: AuthStatus;
  user: UserProfile | null;
  error: string | null;
  establishSession: (token: string, rememberSession: boolean) => Promise<void>;
  signOut: () => void;
  retrySessionCheck: () => void;
}

interface StoredSession {
  token: string;
  storage: SessionStorage;
  user: UserProfile | null;
}

const TOKEN_KEY = "north_token";
const USER_KEY = "north_user";

const AuthContext = createContext<AuthContextValue | null>(null);

function isUserProfile(value: unknown): value is UserProfile {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const profile = value as Record<string, unknown>;
  return (
    typeof profile.id === "string" &&
    typeof profile.name === "string" &&
    typeof profile.email === "string"
  );
}

function readStoredUser(storage: SessionStorage): UserProfile | null {
  const serializedUser = storage.getItem(USER_KEY);
  if (!serializedUser) {
    return null;
  }

  try {
    const user: unknown = JSON.parse(serializedUser);
    return isUserProfile(user) ? user : null;
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return null;
    }
    throw error;
  }
}

function readStoredSession(): StoredSession | null {
  const localToken = localStorage.getItem(TOKEN_KEY);
  if (localToken) {
    return {
      token: localToken,
      storage: localStorage,
      user: readStoredUser(localStorage),
    };
  }

  const sessionToken = sessionStorage.getItem(TOKEN_KEY);
  if (sessionToken) {
    return {
      token: sessionToken,
      storage: sessionStorage,
      user: readStoredUser(sessionStorage),
    };
  }

  return null;
}

function clearStoredSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

function isInvalidSessionError(error: unknown): boolean {
  return (
    axios.isAxiosError(error) &&
    [401, 403, 404].includes(error.response?.status ?? 0)
  );
}

function getSessionErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message;
  }

  return error instanceof Error
    ? error.message
    : "Unable to validate your session.";
}

async function fetchCurrentUser(): Promise<UserProfile> {
  const response = await api.get<{ user: unknown }>("/api/users/me");
  if (!isUserProfile(response.data.user)) {
    throw new Error("The profile response is missing valid user details.");
  }
  return response.data.user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateStoredSession = useCallback(async () => {
    setStatus("loading");
    setError(null);

    const storedSession = readStoredSession();
    if (!storedSession) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    setUser(storedSession.user);
    try {
      const profile = await fetchCurrentUser();
      storedSession.storage.setItem(USER_KEY, JSON.stringify(profile));
      setUser(profile);
      setStatus("authenticated");
    } catch (requestError: unknown) {
      if (isInvalidSessionError(requestError)) {
        clearStoredSession();
        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      setError(getSessionErrorMessage(requestError));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void validateStoredSession();
  }, [validateStoredSession]);

  const establishSession = useCallback(
    async (token: string, rememberSession: boolean) => {
      clearStoredSession();
      const storage = rememberSession ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, token);
      setStatus("loading");
      setError(null);
      setUser(null);

      try {
        const profile = await fetchCurrentUser();
        storage.setItem(USER_KEY, JSON.stringify(profile));
        setUser(profile);
        setStatus("authenticated");
      } catch (requestError: unknown) {
        clearStoredSession();
        setUser(null);
        setStatus("unauthenticated");
        throw requestError;
      }
    },
    [],
  );

  const signOut = useCallback(() => {
    clearStoredSession();
    setUser(null);
    setError(null);
    setStatus("unauthenticated");
  }, []);

  const contextValue = useMemo(
    () => ({
      status,
      user,
      error,
      establishSession,
      signOut,
      retrySessionCheck: () => void validateStoredSession(),
    }),
    [status, user, error, establishSession, signOut, validateStoredSession],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
