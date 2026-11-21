import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCandidateProfile } from "../lib/candidateProfileApi";
import { useAuth } from "./AuthContext";

interface CandidateProfileContextValue {
  // True once a candidate profile has been generated for the signed-in user.
  hasProfile: boolean;
  // True while we are still checking whether a saved profile exists.
  isLoading: boolean;
  markProfileGenerated: () => void;
}

const CandidateProfileContext =
  createContext<CandidateProfileContextValue | null>(null);

export function CandidateProfileProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const userId = user?.id;

  useEffect(() => {
    if (status !== "authenticated") {
      setHasProfile(false);
      setIsLoading(status === "loading");
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    getCandidateProfile()
      .then((result) => {
        if (isMounted) setHasProfile(Boolean(result.candidateProfile));
      })
      .catch(() => {
        if (isMounted) setHasProfile(false);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [status, userId]);

  const markProfileGenerated = useCallback(() => setHasProfile(true), []);

  const value = useMemo(
    () => ({ hasProfile, isLoading, markProfileGenerated }),
    [hasProfile, isLoading, markProfileGenerated],
  );

  return (
    <CandidateProfileContext.Provider value={value}>
      {children}
    </CandidateProfileContext.Provider>
  );
}

export function useCandidateProfileStatus(): CandidateProfileContextValue {
  const context = useContext(CandidateProfileContext);

  if (!context) {
    throw new Error(
      "useCandidateProfileStatus must be used within a CandidateProfileProvider.",
    );
  }

  return context;
}
