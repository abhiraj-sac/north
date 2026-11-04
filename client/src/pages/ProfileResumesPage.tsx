import {
  ArrowDownToLine,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  CloudUpload,
  FileText,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  RESUME_LIMIT,
  useResumeLibrary,
  type SelectedResume,
  type ResumeRecord,
  type LocalResumeStatus,
} from "../auth/ResumeLibraryContext";
interface ProfileDetails {
  headline: string;
  location: string;
  summary: string;
}

const initialProfile: ProfileDetails = {
  headline: "",
  location: "",
  summary: "",
};

const trajectory = [
  {
    role: "Senior Software Engineer",
    company: "Northstar Systems",
    dates: "2022 — Present",
    achievements: [
      "Led a service reliability initiative across a distributed platform.",
      "Improved deployment confidence through automated release checks.",
    ],
  },
  {
    role: "Software Engineer",
    company: "Fieldwork Labs",
    dates: "2019 — 2022",
    achievements: [
      "Built customer-facing product workflows with a cross-functional team.",
    ],
  },
];

const skills = [
  { category: "Programming languages", values: ["TypeScript", "Python", "SQL", "Go"] },
  { category: "Frameworks", values: ["React", "Node.js", "FastAPI"] },
  { category: "Databases", values: ["PostgreSQL", "Redis", "MongoDB"] },
  { category: "Cloud & infrastructure", values: ["AWS", "Docker", "Kubernetes", "CI/CD"] },
  { category: "Systems & architecture", values: ["Distributed systems", "Observability"] },
];

const projects = [
  {
    name: "Distributed Systems Toolkit",
    description:
      "A set of practical patterns and observability tools for resilient services.",
    technologies: ["Go", "PostgreSQL", "Docker"],
    contribution: "Technical lead · architecture and core services",
    githubUrl: "https://github.com/topics/distributed-systems",
    verification: "Illustrative example · not verified",
  },
  {
    name: "Open Data Explorer",
    description:
      "A data exploration interface designed for clear, reproducible analysis.",
    technologies: ["TypeScript", "React", "Python"],
    contribution: "Contributor · product engineering",
    githubUrl: "https://github.com/topics/open-data",
    verification: "Illustrative example · not verified",
  },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileType(file: File): string {
  return file.name.toLowerCase().endsWith(".docx") ? "DOCX" : "PDF";
}

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "N"
  );
}

function getStatusLabel(status: LocalResumeStatus): string {
  switch (status) {
    case "selected":
      return "On this device";

    case "uploading":
      return "Uploading...";

    case "failed":
      return "Upload failed";

    default:
      return "Unknown status";
  }
}

function ResumeCard({
  resume,
  onDelete,
}: {
  resume: SelectedResume;
  onDelete: (resume: SelectedResume) => void;
}) {
  const addedDate = resume.addedAt.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="pr-resume-card">
      <div className="pr-resume-card-main">
        <span className="pr-file-icon" aria-hidden="true">
          <FileText size={19} strokeWidth={1.7} />
        </span>
        <div className="pr-file-copy">
          <h3 title={resume.file.name}>{resume.file.name}</h3>
          <p>
            {getFileType(resume.file)} <span aria-hidden="true">·</span>{" "}
            {formatFileSize(resume.file.size)}
          </p>
        </div>
        <span className={`pr-status pr-status-${resume.status}`}>
  {resume.status === "selected" && "On this device"}
  {resume.status === "uploading" && "Uploading..."}
  {resume.status === "failed" && "Upload failed"}
</span>
      </div>
      <div className="pr-resume-card-bottom">
        <span>Selected {addedDate}</span>
        <div className="pr-resume-actions" aria-label={`Actions for ${resume.file.name}`}>
          <a
            href={resume.objectUrl}
            target="_blank"
            rel="noreferrer"
            className="pr-text-action"
            aria-label={`Preview ${resume.file.name}`}
          >
            Preview
          </a>
          <a
            href={resume.objectUrl}
            download={resume.file.name}
            className="pr-icon-action"
            aria-label={`Download ${resume.file.name}`}
          >
            <ArrowDownToLine size={15} />
          </a>
          <button
            className="pr-icon-action pr-delete-action"
            type="button"
            onClick={() => onDelete(resume)}
            aria-label={`Delete ${resume.file.name}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}

function ResumeUploadCard({
  remainingSlots,
  disabled,
  error,
  onFiles,
}: {
  remainingSlots: number;
  disabled: boolean;
  error: string | null;
  onFiles: (files: FileList | File[]) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      onFiles(event.dataTransfer.files);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.currentTarget.files) {
      onFiles(event.currentTarget.files);
      event.currentTarget.value = "";
    }
  }

  return (
    <div
      className={`pr-upload-card${isDragging ? " is-dragging" : ""}${disabled ? " is-disabled" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsDragging(false);
        }
      }}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        className="pr-visually-hidden"
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple
        onChange={handleFileChange}
        disabled={disabled}
        tabIndex={-1}
        aria-label="Choose PDF or DOCX resumes"
      />
      <div className="pr-upload-content">
        <span className="pr-upload-icon" aria-hidden="true">
          <CloudUpload size={20} strokeWidth={1.6} />
        </span>
        <div className="pr-upload-copy">
          <h3>{disabled ? "Resume limit reached" : "Add a resume"}</h3>
          <p className="pr-upload-description">
            {disabled
              ? "Remove one of your selected files to make room for another."
              : "Drop a file here, or browse to select from your device."}
          </p>
        </div>
        <button
          type="button"
          className="pr-button pr-button-primary pr-browse-button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <Plus size={15} />
          {disabled ? "Limit reached" : "Browse files"}
        </button>
      </div>
      <p className="pr-upload-formats">PDF or DOCX · Maximum 15 MB</p>
      <span className="pr-slots-remaining">
        {remainingSlots} {remainingSlots === 1 ? "slot" : "slots"} remaining
      </span>
      {error && (
        <p className="pr-upload-error" role="alert">
          <CircleAlert size={14} />
          {error}
        </p>
      )}
    </div>
  );
}


function ResumeSection({
  resumes,
  selectedFiles,
  error,
  onFiles,
  onDelete,
  onDownload,
}: {
  onDownload: (resumeId: string) => void;
  resumes: ResumeRecord[];
  selectedFiles: SelectedResume[];
  error: string | null;
  onFiles: (files: FileList | File[]) => void;
  onDelete: (resume: SelectedResume) => void;
}) {
  const remainingSlots = RESUME_LIMIT - (resumes.length + selectedFiles.length);

  return (
    <section className="pr-section" aria-labelledby="pr-resumes-heading">
      <div className="pr-section-heading">
        <div>
          <h2 id="pr-resumes-heading">Your Resumes</h2>
          <p className="pr-section-description">
            Keep and manage up to three resumes in one place.
          </p>
        </div>

        <span className="pr-usage-count" aria-live="polite">
          {resumes.length + selectedFiles.length} of {RESUME_LIMIT} used
        </span>
      </div>

      <div className={`pr-resume-layout pr-resume-count-${resumes.length + selectedFiles.length}`}>
        {resumes.map((resume) => (
          <article className="pr-resume-card" key={resume.id}>
            <div className="pr-resume-card-main">
              <span className="pr-file-icon">
                <FileText size={19} strokeWidth={1.7} />
              </span>

              <div className="pr-file-copy">
                <h3 title={resume.originalFilename}>
                  {resume.originalFilename}
                </h3>
                <p>
                  {resume.mimeType === "application/pdf" ? "PDF" : "DOCX"}
                  {" · "}
                  {resume.sizeBytes ? formatFileSize(resume.sizeBytes) : "Unknown size"}
                </p>
              </div>

              <span className={`pr-status pr-status-${resume.uploadStatus.toLowerCase()}`}>
                {resume.uploadStatus === "UPLOADED" ? "Uploaded" : resume.uploadStatus}
              </span>
            </div>

            <div className="pr-resume-card-bottom">
              <span>
                Saved {new Date(resume.createdAt).toLocaleDateString()}
              </span>
            </div>
            <button
  type="button"
  className="pr-icon-action"
  onClick={() => onDownload(resume.id)}
  aria-label={`Download ${resume.originalFilename}`}
>
  <ArrowDownToLine size={15} />
</button>
          </article>
          
        ))}

        {selectedFiles.map((resume) => (
          <ResumeCard
            key={resume.id}
            resume={resume}
            onDelete={onDelete}
          />
        ))}

        <ResumeUploadCard
          remainingSlots={remainingSlots}
          disabled={remainingSlots <= 0}
          error={error}
          onFiles={onFiles}
        />
      </div>
    </section>
  );
}


function ProfileOverview({
  name,
  email,
  details,
  onSave,
}: {
  name: string;
  email: string;
  details: ProfileDetails;
  onSave: (details: ProfileDetails) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(details);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(draft);
    setIsEditing(false);
  }

  return (
    <section className="pr-profile-card" aria-labelledby="pr-profile-heading">
      <div className="pr-card-heading">
        <span className="pr-card-icon" aria-hidden="true">
          <UserRound size={16} />
        </span>
        <div>
          <p className="pr-eyebrow">PROFILE OVERVIEW</p>
          <h2 id="pr-profile-heading">Professional identity</h2>
        </div>
        {!isEditing && (
          <button
            className="pr-button pr-button-secondary pr-edit-button"
            type="button"
            onClick={() => {
              setDraft(details);
              setIsEditing(true);
            }}
          >
            <Pencil size={13} />
            Edit profile
          </button>
        )}
      </div>

      {isEditing ? (
        <form className="pr-profile-form" onSubmit={handleSubmit}>
          <label>
            Professional headline
            <input
              value={draft.headline}
              onChange={(event) =>
                setDraft({ ...draft, headline: event.currentTarget.value })
              }
              placeholder="e.g. Senior Software Engineer"
              maxLength={100}
            />
          </label>
          <label>
            Location
            <input
              value={draft.location}
              onChange={(event) =>
                setDraft({ ...draft, location: event.currentTarget.value })
              }
              placeholder="City, region or remote"
              maxLength={100}
            />
          </label>
          <label className="pr-summary-field">
            Short professional summary
            <textarea
              value={draft.summary}
              onChange={(event) =>
                setDraft({ ...draft, summary: event.currentTarget.value })
              }
              placeholder="A few sentences about your work and what you do best."
              rows={3}
              maxLength={500}
            />
          </label>
          <div className="pr-form-actions">
            <button
              className="pr-button pr-button-secondary"
              type="button"
              onClick={() => setIsEditing(false)}
            >
              <X size={14} />
              Cancel
            </button>
            <button className="pr-button pr-button-primary" type="submit">
              Save changes
            </button>
          </div>
        </form>
      ) : (
        <div className="pr-profile-body">
          <div className="pr-profile-identity">
            <span className="pr-avatar" aria-hidden="true">
              {getInitials(name)}
            </span>
            <div className="pr-profile-name">
              <h3>{name}</h3>
              <p>{details.headline || "Add a professional headline"}</p>
              <span>{email}</span>
            </div>
          </div>
          <p className="pr-profile-summary">
            {details.summary || "Add a short summary to introduce your experience and strengths."}
          </p>
          <div className="pr-profile-location">
            <MapPin size={14} />
            {details.location || "Add your location"}
          </div>
        </div>
      )}
    </section>
  );
}

function EmptyIntelligence({ hasResumes }: { hasResumes: boolean }) {
  if (hasResumes) return null;

  return (
    <div className="pr-intelligence-empty">
      <span className="pr-intelligence-empty-icon" aria-hidden="true">
        <Sparkles size={16} />
      </span>
      <div>
        <strong>Your career intelligence is waiting.</strong>
        <p>Upload a resume to start organizing your experience, skills, and signals.</p>
      </div>
    </div>
  );
}

function CareerTrajectory({ hasResumes }: { hasResumes: boolean }) {
  return (
    <section className="pr-intel-card" aria-labelledby="pr-trajectory-heading">
      <div className="pr-intel-card-heading">
        <span className="pr-card-icon" aria-hidden="true">
          <BriefcaseBusiness size={16} />
        </span>
        <div>
          <p className="pr-eyebrow">EXPERIENCE</p>
          <h3 id="pr-trajectory-heading">Career trajectory</h3>
        </div>
        {hasResumes && <span className="pr-illustrative-label">Illustrative</span>}
      </div>
      {hasResumes ? (
        <div className="pr-timeline">
          {trajectory.map((item, index) => (
            <article className="pr-timeline-item" key={item.role}>
              <span className="pr-timeline-marker" aria-hidden="true">
                {index === 0 ? <BadgeCheck size={13} /> : <span />}
              </span>
              <div className="pr-timeline-copy">
                <div className="pr-timeline-title">
                  <h4>{item.role}</h4>
                  <span>{item.dates}</span>
                </div>
                <p className="pr-company">{item.company}</p>
                <ul>
                  {item.achievements.map((achievement) => (
                    <li key={achievement}>{achievement}</li>
                  ))}
                </ul>
                <span className="pr-source-reference">Example source · resume experience entry</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyIntelligence hasResumes={hasResumes} />
      )}
    </section>
  );
}

function TechnicalSkills({ hasResumes }: { hasResumes: boolean }) {
  return (
    <section className="pr-intel-card" aria-labelledby="pr-skills-heading">
      <div className="pr-intel-card-heading">
        <span className="pr-card-icon" aria-hidden="true">
          <Sparkles size={16} />
        </span>
        <div>
          <p className="pr-eyebrow">CAPABILITIES</p>
          <h3 id="pr-skills-heading">Technical skills & expertise</h3>
        </div>
        {hasResumes && <span className="pr-illustrative-label">Illustrative</span>}
      </div>
      {hasResumes ? (
        <div className="pr-skill-groups">
          {skills.map((group) => (
            <div className="pr-skill-group" key={group.category}>
              <span>{group.category}</span>
              <div className="pr-skill-tags">
                {group.values.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyIntelligence hasResumes={hasResumes} />
      )}
    </section>
  );
}

function ProjectArtifacts({ hasResumes }: { hasResumes: boolean }) {
  return (
    <section className="pr-intel-card" aria-labelledby="pr-projects-heading">
      <div className="pr-intel-card-heading">
        <span className="pr-card-icon" aria-hidden="true">
          <FileText size={16} />
        </span>
        <div>
          <p className="pr-eyebrow">PROOF OF WORK</p>
          <h3 id="pr-projects-heading">Projects & engineering artifacts</h3>
        </div>
        {hasResumes && <span className="pr-illustrative-label">Illustrative</span>}
      </div>
      {hasResumes ? (
        <div className="pr-project-list">
          {projects.map((project) => (
            <article className="pr-project" key={project.name}>
              <div className="pr-project-title">
                <h4>{project.name}</h4>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Explore ${project.name} topics on GitHub`}
                >
                  GitHub <ArrowUpRight size={13} />
                </a>
              </div>
              <p>{project.description}</p>
              <div className="pr-skill-tags">
                {project.technologies.map((technology) => (
                  <span key={technology}>{technology}</span>
                ))}
              </div>
              <span className="pr-project-contribution">{project.contribution}</span>
              <span className="pr-project-verification">{project.verification}</span>
            </article>
          ))}
        </div>
      ) : (
        <EmptyIntelligence hasResumes={hasResumes} />
      )}
    </section>
  );
}

function ProfileIntegrity({ hasResumes }: { hasResumes: boolean }) {
  return (
    <section
      className="pr-intel-card"
      id="profile-integrity"
      aria-labelledby="pr-integrity-heading"
    >
      <div className="pr-intel-card-heading">
        <span className="pr-card-icon" aria-hidden="true">
          <ShieldCheck size={16} />
        </span>
        <div>
          <p className="pr-eyebrow">QUALITY CHECKS</p>
          <h3 id="pr-integrity-heading">Profile integrity</h3>
        </div>
      </div>
      {hasResumes ? (
        <div className="pr-integrity-list">
          <div className="pr-integrity-row">
            <span className="pr-integrity-indicator is-positive">
              <Check size={12} />
            </span>
            <span>Resume consistency</span>
            <strong>Aligned</strong>
          </div>
          <div className="pr-integrity-row">
            <span className="pr-integrity-indicator is-neutral">
              <CircleAlert size={12} />
            </span>
            <span>Missing information</span>
            <strong>2 items to review</strong>
          </div>
          <div className="pr-integrity-row">
            <span className="pr-integrity-indicator is-positive">
              <Check size={12} />
            </span>
            <span>Chronology conflicts</span>
            <strong>None detected</strong>
          </div>
          <p className="pr-integrity-footnote">
            <ShieldCheck size={13} />
            Example verification state — not a validation of your documents.
          </p>
        </div>
      ) : (
        <EmptyIntelligence hasResumes={hasResumes} />
      )}
    </section>
  );
}

function SynthesisStatus({
  resumeCount,
  hasResumes,
}: {
  resumeCount: number;
  hasResumes: boolean;
}) {
  return (
    <section className="pr-synthesis-card" aria-labelledby="pr-synthesis-heading">
      <div className="pr-synthesis-copy">
        <span className="pr-synthesis-icon" aria-hidden="true">
          <Sparkles size={17} />
        </span>
        <div>
          <p className="pr-eyebrow">NORTH SYNTHESIS</p>
          <h3 id="pr-synthesis-heading">
            {hasResumes ? "Your files are ready for synthesis" : "Your profile is ready to begin"}
          </h3>
          <p>
            {hasResumes
              ? "Selected files remain on this device. Career signals appear once secure processing is connected."
              : "Add a resume to begin building a clear, consolidated career record."}
          </p>
        </div>
      </div>
      <div className="pr-synthesis-metrics">
        <div>
          <strong>{resumeCount}</strong>
          <span>FILES SELECTED</span>
        </div>
        <div>
          <strong>—</strong>
          <span>VERIFIED SIGNALS</span>
        </div>
        <div>
          <strong>—</strong>
          <span>CHRONOLOGY CONFLICTS</span>
        </div>
        <div className="pr-synthesis-processing">
          <strong>Not processed</strong>
          <span>PROCESSING STATUS</span>
        </div>
      </div>
      <a
        className="pr-button pr-button-primary pr-review-button"
        href="#pr-resumes-heading"
      >
        {hasResumes ? "Manage selected resumes" : "Add your first resume"}
        <ChevronRight size={15} />
      </a>
    </section>
  );
}


export default function ProfileResumesPage() {
  const { user, status } = useAuth();

const {
  resumes,
  selectedFiles,
  error: uploadError,
  addFiles,
  removeSelectedFile,
  getResumeDownloadUrl,
} = useResumeLibrary();

  const [profileDetails, setProfileDetails] = useState(initialProfile);
  const handleDownload = async (resumeId: string) => {
  try {
    const downloadUrl = await getResumeDownloadUrl(resumeId);

    window.open(downloadUrl, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error("Resume download failed:", error);
  }
};

  // Saved resumes + newly selected local files
  const totalResumeCount = resumes.length + selectedFiles.length;
  const hasResumes = totalResumeCount > 0;

  if (status === "loading" || !user) {
    return (
      <div className="pr-loading" role="status">
        Loading your professional identity…
      </div>
    );
  }

  return (
    <main className="pr-page">
      <div className="pr-page-inner">
        <header className="pr-page-header">
          <div>
            <p className="pr-page-kicker">
              YOUR PROFESSIONAL IDENTITY
            </p>
            <h1>Your Professional Identity</h1>
            <p>
              Build, manage and consolidate your professional experience.
            </p>
          </div>

          <div
            className="pr-header-usage"
            aria-label={`${totalResumeCount} of ${RESUME_LIMIT} resume slots used`}
          >
            <span className="pr-usage-progress" aria-hidden="true">
              {Array.from({ length: RESUME_LIMIT }, (_, index) => (
                <span
                  className={index < totalResumeCount ? "is-filled" : ""}
                  key={index}
                />
              ))}
            </span>

            <span>
              {totalResumeCount} of {RESUME_LIMIT} resumes used
            </span>
          </div>
        </header>

        <ResumeSection
  resumes={resumes}
  selectedFiles={selectedFiles}
  error={uploadError}
  onFiles={addFiles}
  onDelete={(resume) => removeSelectedFile(resume.id)}
  onDownload={handleDownload}
/>

        <section
          className="pr-section pr-intelligence-section"
          aria-labelledby="pr-intelligence-heading"
        >
          <div className="pr-section-heading">
            <div>
              <p className="pr-eyebrow">EVIDENCE-LED OVERVIEW</p>
              <h2 id="pr-intelligence-heading">Career intelligence</h2>
            </div>

            <span className="pr-illustrative-note">
              {hasResumes ? "Illustrative example" : "Ready when you are"}
            </span>
          </div>

          <ProfileOverview
            name={user.name}
            email={user.email}
            details={profileDetails}
            onSave={setProfileDetails}
          />

          {hasResumes && (
            <p className="pr-demo-disclaimer">
              Example career data for interface preview only. Resume files
              are not analyzed or sent to a server in this UI phase.
            </p>
          )}

          <div className="pr-intelligence-grid">
            <CareerTrajectory hasResumes={hasResumes} />
            <TechnicalSkills hasResumes={hasResumes} />
            <ProjectArtifacts hasResumes={hasResumes} />
            <ProfileIntegrity hasResumes={hasResumes} />
          </div>

          <SynthesisStatus
            resumeCount={totalResumeCount}
            hasResumes={hasResumes}
          />
        </section>
      </div>
    </main>
  );
}
