import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

// IMPORTANT: Replace this with the actual relative path to your api.ts file.
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

export const RESUME_LIMIT = 3;

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

// Files selected in the browser but not yet uploaded.
export type LocalResumeStatus =
  | "selected"
  | "uploading"
  | "failed";

export interface SelectedResume {
  id: string;
  file: File;
  objectUrl: string;
  addedAt: Date;
  status: LocalResumeStatus;
}

// Resume metadata received from the backend.
export interface ResumeRecord {
  id: string;
  originalFilename: string;
  mimeType: string | null;
  sizeBytes: number | null;
  uploadStatus: "PENDING_UPLOAD" | "UPLOADED" | "DELETING";
  createdAt: string;
}

interface ResumeLibraryValue {
  selectedFiles: SelectedResume[];
  resumes: ResumeRecord[];
  error: string | null;
  loading: boolean;
  getResumeDownloadUrl: (resumeId: string) => Promise<string>;

  addFiles: (files: FileList | File[]) => void;
  removeSelectedFile: (id: string) => void;
  updateSelectedFileStatus: (
    id: string,
    status: LocalResumeStatus,
  ) => void;
  clearSelectedFiles: () => void;
  loadResumes: () => Promise<void>;
}

const ResumeLibraryContext =
  createContext<ResumeLibraryValue | null>(null);

export function ResumeLibraryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { status, user } = useAuth();
  const userId = user?.id;

  // Locally selected files.
  const [selectedFiles, setSelectedFiles] = useState<SelectedResume[]>([]);

  // Persisted resumes fetched from PostgreSQL through the backend.
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Keeps track of temporary browser preview URLs.
  const objectUrls = useRef(new Map<string, string>());

  // Fetch saved resumes from the backend.
  const loadResumes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<{
        resumes: ResumeRecord[];
      }>("/api/resumes");

      setResumes(response.data.resumes);
    } catch (error: unknown) {
      console.error("Failed to load resumes:", error);
      setError("Unable to load your saved resumes.");
    } finally {
      setLoading(false);
    }
  }, []);
  const getResumeDownloadUrl = useCallback(
  async (resumeId: string): Promise<string> => {
    const response = await api.get(
      `/api/resumes/${resumeId}/download`
    );

    return response.data.downloadUrl;
  },
  []
);

  const uploadResume = useCallback(
  async (selected: SelectedResume) => {
    const { id, file } = selected;

    try {
      // 1. Update UI status
      setSelectedFiles((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, status: "uploading" }
            : item
        )
      );

      // 2. Determine MIME type
      const mimeType = file.name.toLowerCase().endsWith(".pdf")
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      // 3. Register the upload with the backend
      const initResponse = await api.post(
        "/api/resumes/upload-init",
        {
          originalFilename: file.name,
          mimeType,
          sizeBytes: file.size,
        }
      );

      const { resumeId } = initResponse.data;

      // 4. Send the file to the backend, which stores it in S3
      await api.put(`/api/resumes/${resumeId}/file`, file, {
        headers: { "Content-Type": mimeType },
      });

      // 5. Ask backend to verify the uploaded file
      await api.post(
        `/api/resumes/${resumeId}/complete`
      );

      // 6. Refresh saved resumes
      await loadResumes();

      // 7. Remove temporary local file
      const objectUrl = objectUrls.current.get(id);

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrls.current.delete(id);
      }

      setSelectedFiles((current) =>
        current.filter((item) => item.id !== id)
      );

    } catch (error) {
      console.error("Resume upload failed:", error);

      setSelectedFiles((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, status: "failed" }
            : item
        )
      );

      setError(
        error instanceof Error
          ? error.message
          : "Resume upload failed."
      );
    }
  },
  [loadResumes]
);

  // Add files to local browser state.
 const addFiles = useCallback(
  async (files: FileList | File[]) => {
    setError(null);

    const incomingFiles = Array.from(files);
    const accepted: SelectedResume[] = [];

    let remainingSlots =
      RESUME_LIMIT - (resumes.length + selectedFiles.length);

    const errors: string[] = [];

    for (const file of incomingFiles) {
      if (remainingSlots <= 0) {
        errors.push(
          `You can add up to ${RESUME_LIMIT} resumes. Delete one to add another.`,
        );
        break;
      }

      const lowerName = file.name.toLowerCase();

      if (
        !ALLOWED_EXTENSIONS.some((extension) =>
          lowerName.endsWith(extension),
        )
      ) {
        errors.push(`${file.name}: choose a PDF or DOCX file.`);
        continue;
      }

      if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
        errors.push(`${file.name}: the maximum file size is 15 MB.`);
        continue;
      }

      const id = crypto.randomUUID();
      const objectUrl = URL.createObjectURL(file);

      objectUrls.current.set(id, objectUrl);

      accepted.push({
        id,
        file,
        objectUrl,
        addedAt: new Date(),
        status: "selected",
      });

      remainingSlots -= 1;
    }

    // Add accepted files to local state
    if (accepted.length > 0) {
      setSelectedFiles((current) => [...current, ...accepted]);

      // Upload files one by one
      for (const selected of accepted) {
        await uploadResume(selected);
      }
    }

    if (errors.length > 0) {
      setError(errors.join(" "));
    }
  },
  [resumes.length, selectedFiles.length, uploadResume],
);

  // Remove a locally selected file.
  const removeSelectedFile = useCallback((id: string) => {
    const objectUrl = objectUrls.current.get(id);

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrls.current.delete(id);
    }

    setSelectedFiles((current) =>
      current.filter((file) => file.id !== id),
    );

    setError(null);
  }, []);

  // Update the status of a locally selected file.
  const updateSelectedFileStatus = useCallback(
    (id: string, status: LocalResumeStatus) => {
      setSelectedFiles((current) =>
        current.map((file) =>
          file.id === id ? { ...file, status } : file,
        ),
      );
    },
    [],
  );

  // Clear all locally selected files.
  const clearSelectedFiles = useCallback(() => {
    objectUrls.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    objectUrls.current.clear();
    setSelectedFiles([]);
    setError(null);
  }, []);

  // Load saved resumes for the signed-in user, and drop everything
  // (resumes, selected files) the moment the user changes or signs out so
  // one account never sees another account's data.
  useEffect(() => {
    setResumes([]);
    clearSelectedFiles();

    if (status === "authenticated") {
      void loadResumes();
    } else {
      setLoading(status === "loading");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, userId, loadResumes]);

  // Clean up temporary preview URLs when the provider unmounts.
  useEffect(() => {
    return () => {
      objectUrls.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      objectUrls.current.clear();
    };
  }, []);

  // Context value shared with consuming components.
  const value = useMemo(
    () => ({
      selectedFiles,
      resumes,
      error,
      loading,
      getResumeDownloadUrl,
      addFiles,
      removeSelectedFile,
      updateSelectedFileStatus,
      clearSelectedFiles,
      loadResumes,
    }),
    [
      selectedFiles,
      resumes,
      error,
      loading,
      addFiles,
      removeSelectedFile,
      getResumeDownloadUrl,
      updateSelectedFileStatus,
      clearSelectedFiles,
      loadResumes,
    ],
  );

  return (
    <ResumeLibraryContext.Provider value={value}>
      {children}
    </ResumeLibraryContext.Provider>
  );
}

// Custom hook to access the resume library.
export function useResumeLibrary(): ResumeLibraryValue {
  const context = useContext(ResumeLibraryContext);

  if (!context) {
    throw new Error(
      "useResumeLibrary must be used within a ResumeLibraryProvider.",
    );
  }

  return context;
}
