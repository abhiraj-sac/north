import {
  getCandidateProfile,
  generateCandidateProfile,
  updateCandidateProfile,
  type CandidateProfile,
} from "../lib/candidateProfileApi";
import { useCandidateProfileStatus } from "../auth/CandidateProfileContext";
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
  Award,
  GraduationCap,
  Github,
  Globe,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useRef, useState,useEffect, type ReactNode, type ChangeEvent, type DragEvent, type FormEvent } from "react";
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

// Editable overview values: user customizations win, then AI-extracted data.
function buildProfileDetails(
  profile: CandidateProfile,
  customizations?: Partial<ProfileDetails> | null,
): ProfileDetails {
  return {
    headline:
      customizations?.headline ||
      profile.headline ||
      profile.work_experience[0]?.role ||
      "",
    location:
      customizations?.location || profile.personal_information.location || "",
    summary:
      customizations?.summary || profile.professional_summary || "",
  };
}

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
  profile,
  onSave,
}: {
  name: string;
  email: string;
  details: ProfileDetails;
  profile: CandidateProfile | null;
  onSave: (details: ProfileDetails) => void;
}) {
  const pi = profile?.personal_information;
  const displayName = pi?.full_name || name;
  const displayEmail = pi?.email || email;
  const contactLinks = [
    { icon: <Linkedin size={13} />, label: "LinkedIn", href: pi?.linkedin_url },
    { icon: <Github size={13} />, label: "GitHub", href: pi?.github_url },
    { icon: <Globe size={13} />, label: "Portfolio", href: pi?.portfolio_url },
  ].filter((l) => Boolean(l.href));
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
              {getInitials(displayName)}
            </span>
            <div className="pr-profile-name">
              <h3>{displayName}</h3>
              <p>{details.headline || "Add a professional headline"}</p>
              <span>{displayEmail}</span>
            </div>
          </div>
          {(pi?.phone || contactLinks.length > 0) && (
            <div className="pr-contact-row">
              {displayEmail && (
                <span className="pr-contact-item">
                  <Mail size={13} />
                  {displayEmail}
                </span>
              )}
              {pi?.phone && (
                <span className="pr-contact-item">
                  <Phone size={13} />
                  {pi.phone}
                </span>
              )}
              {contactLinks.map((link) => (
                <a
                  key={link.label}
                  className="pr-contact-item pr-contact-link"
                  href={link.href as string}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.icon}
                  {link.label}
                </a>
              ))}
            </div>
          )}
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

function EmptyIntelligence({
  hasResumes,
  hasProfile,
  label,
}: {
  hasResumes: boolean;
  hasProfile: boolean;
  label?: string;
}) {
  if (hasProfile) {
    return (
      <p className="pr-section-empty">
        {label ?? "Nothing was found in your resumes for this section."}
      </p>
    );
  }

  return (
    <div className="pr-intelligence-empty">
      <span className="pr-intelligence-empty-icon" aria-hidden="true">
        <Sparkles size={16} />
      </span>
      <div>
        <strong>Your career intelligence is waiting.</strong>
        <p>
          {hasResumes
            ? "Generate your profile to see your experience, skills and projects here."
            : "Upload a resume to start organizing your experience, skills, and signals."}
        </p>
      </div>
    </div>
  );
}

type ProfileSectionProps = {
  profile: CandidateProfile | null;
  hasResumes: boolean;
};

function IntelCard({
  id,
  eyebrow,
  title,
  icon,
  count,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  icon: ReactNode;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section className="pr-intel-card" aria-labelledby={id}>
      <div className="pr-intel-card-heading">
        <span className="pr-card-icon" aria-hidden="true">
          {icon}
        </span>
        <div>
          <p className="pr-eyebrow">{eyebrow}</p>
          <h3 id={id}>{title}</h3>
        </div>
        {typeof count === "number" && count > 0 && (
          <span className="pr-count-pill">{count}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function formatDateRange(
  start?: string | null,
  end?: string | null,
  isCurrent?: boolean | null,
): string {
  const to = isCurrent ? "Present" : end;
  if (start && to) return `${start} — ${to}`;
  return start || to || "";
}

function CareerTrajectory({ profile, hasResumes }: ProfileSectionProps) {
  const items = profile?.work_experience ?? [];

  return (
    <IntelCard
      id="pr-trajectory-heading"
      eyebrow="EXPERIENCE"
      title="Career trajectory"
      icon={<BriefcaseBusiness size={16} />}
      count={items.length}
    >
      {items.length > 0 ? (
        <div className="pr-timeline">
          {items.map((item, index) => {
            const meta = [item.employment_type, item.location]
              .filter(Boolean)
              .join(" · ");
            return (
              <article
                className="pr-timeline-item"
                key={`${item.company}-${item.role}-${index}`}
              >
                <span className="pr-timeline-marker" aria-hidden="true">
                  {index === 0 ? <BadgeCheck size={13} /> : <span />}
                </span>
                <div className="pr-timeline-copy">
                  <div className="pr-timeline-title">
                    <h4>{item.role || "Role not specified"}</h4>
                    <span>
                      {formatDateRange(
                        item.start_date,
                        item.end_date,
                        item.is_current,
                      )}
                    </span>
                  </div>
                  <p className="pr-company">
                    {item.company || "Company not specified"}
                    {meta && <span className="pr-meta"> · {meta}</span>}
                  </p>
                  {item.responsibilities.length > 0 && (
                    <>
                      <span className="pr-list-label">Responsibilities</span>
                      <ul>
                        {item.responsibilities.map((text, i) => (
                          <li key={i}>{text}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {item.achievements.length > 0 && (
                    <>
                      <span className="pr-list-label">Achievements</span>
                      <ul>
                        {item.achievements.map((text, i) => (
                          <li key={i}>{text}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {item.technologies.length > 0 && (
                    <div className="pr-skill-tags">
                      {item.technologies.map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyIntelligence
          hasResumes={hasResumes}
          hasProfile={Boolean(profile)}
          label="No work experience was found in your resumes."
        />
      )}
    </IntelCard>
  );
}

const SKILL_GROUPS: Array<{
  key: keyof CandidateProfile["technical_skills"];
  label: string;
}> = [
  { key: "programming_languages", label: "Programming languages" },
  { key: "frameworks", label: "Frameworks & libraries" },
  { key: "databases", label: "Databases" },
  { key: "cloud_platforms", label: "Cloud platforms" },
  { key: "tools", label: "Tools" },
  { key: "other_skills", label: "Other skills" },
];

function TechnicalSkills({ profile, hasResumes }: ProfileSectionProps) {
  const groups = profile
    ? SKILL_GROUPS.filter((g) => profile.technical_skills[g.key].length > 0)
    : [];
  const total = groups.reduce(
    (sum, g) => sum + (profile?.technical_skills[g.key].length ?? 0),
    0,
  );

  return (
    <IntelCard
      id="pr-skills-heading"
      eyebrow="CAPABILITIES"
      title="Technical skills & expertise"
      icon={<Sparkles size={16} />}
      count={total}
    >
      {groups.length > 0 && profile ? (
        <div className="pr-skill-groups">
          {groups.map((group) => (
            <div className="pr-skill-group" key={group.key}>
              <span>{group.label}</span>
              <div className="pr-skill-tags">
                {profile.technical_skills[group.key].map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyIntelligence
          hasResumes={hasResumes}
          hasProfile={Boolean(profile)}
          label="No technical skills were found in your resumes."
        />
      )}
    </IntelCard>
  );
}

function ProjectArtifacts({ profile, hasResumes }: ProfileSectionProps) {
  const items = profile?.projects ?? [];

  return (
    <IntelCard
      id="pr-projects-heading"
      eyebrow="PROOF OF WORK"
      title="Projects & engineering artifacts"
      icon={<FileText size={16} />}
      count={items.length}
    >
      {items.length > 0 ? (
        <div className="pr-project-list pr-scroll-list" tabIndex={0}>
          {items.map((project, index) => (
            <article className="pr-project" key={`${project.name}-${index}`}>
              <div className="pr-project-title">
                <h4>{project.name || "Untitled project"}</h4>
                {project.project_url && (
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${project.name || "project"}`}
                  >
                    View <ArrowUpRight size={13} />
                  </a>
                )}
              </div>
              {project.description && <p>{project.description}</p>}
              {project.contributions.length > 0 && (
                <ul className="pr-project-points">
                  {project.contributions.map((text, i) => (
                    <li key={i}>{text}</li>
                  ))}
                </ul>
              )}
              {project.technologies.length > 0 && (
                <div className="pr-skill-tags">
                  {project.technologies.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <EmptyIntelligence
          hasResumes={hasResumes}
          hasProfile={Boolean(profile)}
          label="No projects were found in your resumes."
        />
      )}
    </IntelCard>
  );
}

function EducationSection({ profile, hasResumes }: ProfileSectionProps) {
  const items = profile?.education ?? [];

  return (
    <IntelCard
      id="pr-education-heading"
      eyebrow="BACKGROUND"
      title="Education"
      icon={<GraduationCap size={16} />}
      count={items.length}
    >
      {items.length > 0 ? (
        <div className="pr-entry-list">
          {items.map((edu, index) => (
            <article className="pr-entry" key={`${edu.institution}-${index}`}>
              <div className="pr-timeline-title">
                <h4>{edu.institution || "Institution not specified"}</h4>
                {edu.graduation_year && <span>{edu.graduation_year}</span>}
              </div>
              <p className="pr-company">
                {[edu.degree, edu.field_of_study].filter(Boolean).join(" · ") ||
                  "Degree not specified"}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyIntelligence
          hasResumes={hasResumes}
          hasProfile={Boolean(profile)}
          label="No education details were found in your resumes."
        />
      )}
    </IntelCard>
  );
}

function CredentialsSection({ profile, hasResumes }: ProfileSectionProps) {
  const certs = profile?.certifications ?? [];
  const achievements = profile?.achievements ?? [];
  const total = certs.length + achievements.length;

  return (
    <IntelCard
      id="pr-credentials-heading"
      eyebrow="RECOGNITION"
      title="Certifications & achievements"
      icon={<Award size={16} />}
      count={total}
    >
      {total > 0 ? (
        <div className="pr-entry-list">
          {certs.map((cert, index) => (
            <article className="pr-entry" key={`cert-${cert.name}-${index}`}>
              <div className="pr-timeline-title">
                <h4>{cert.name || "Certification"}</h4>
                {cert.issue_date && <span>{cert.issue_date}</span>}
              </div>
              <p className="pr-company">
                {cert.issuer || "Certification"}
                {cert.credential_url && (
                  <>
                    {" · "}
                    <a href={cert.credential_url} target="_blank" rel="noreferrer">
                      Credential
                    </a>
                  </>
                )}
              </p>
            </article>
          ))}
          {achievements.map((item, index) => (
            <article className="pr-entry" key={`ach-${item.title}-${index}`}>
              <div className="pr-timeline-title">
                <h4>{item.title || "Achievement"}</h4>
                {item.date && <span>{item.date}</span>}
              </div>
              {item.description && <p className="pr-entry-text">{item.description}</p>}
            </article>
          ))}
        </div>
      ) : (
        <EmptyIntelligence
          hasResumes={hasResumes}
          hasProfile={Boolean(profile)}
          label="No certifications or achievements were found in your resumes."
        />
      )}
    </IntelCard>
  );
}

// Real completeness checks computed from the generated profile.
function getProfileChecks(profile: CandidateProfile) {
  const pi = profile.personal_information;
  const ts = profile.technical_skills;
  const skillCount = SKILL_GROUPS.reduce((n, g) => n + ts[g.key].length, 0);

  return [
    { label: "Full name", ok: Boolean(pi.full_name) },
    { label: "Email", ok: Boolean(pi.email) },
    { label: "Phone", ok: Boolean(pi.phone) },
    { label: "Location", ok: Boolean(pi.location) },
    {
      label: "Professional links",
      ok: Boolean(pi.linkedin_url || pi.github_url || pi.portfolio_url),
    },
    { label: "Professional summary", ok: Boolean(profile.professional_summary) },
    { label: "Technical skills", ok: skillCount > 0 },
    { label: "Work experience", ok: profile.work_experience.length > 0 },
    { label: "Projects", ok: profile.projects.length > 0 },
    { label: "Education", ok: profile.education.length > 0 },
  ];
}

function ProfileIntegrity({ profile, hasResumes }: ProfileSectionProps) {
  const checks = profile ? getProfileChecks(profile) : [];
  const missing = checks.filter((c) => !c.ok);
  const score = checks.length
    ? Math.round(((checks.length - missing.length) / checks.length) * 100)
    : 0;

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
          <h3 id="pr-integrity-heading">Profile completeness</h3>
        </div>
        {profile && <span className="pr-count-pill">{score}%</span>}
      </div>
      {profile ? (
        <div className="pr-integrity-list">
          {checks.map((check) => (
            <div className="pr-integrity-row" key={check.label}>
              <span
                className={`pr-integrity-indicator ${
                  check.ok ? "is-positive" : "is-neutral"
                }`}
              >
                {check.ok ? <Check size={12} /> : <CircleAlert size={12} />}
              </span>
              <span>{check.label}</span>
              <strong>{check.ok ? "Found" : "Missing"}</strong>
            </div>
          ))}
          <p className="pr-integrity-footnote">
            <ShieldCheck size={13} />
            {missing.length === 0
              ? "Everything we look for was found in your resumes."
              : "Add the missing details to your resume and regenerate to fill these in."}
          </p>
        </div>
      ) : (
        <EmptyIntelligence hasResumes={hasResumes} hasProfile={false} />
      )}
    </section>
  );
}

const GENERATION_STAGES = [
  { from: 0, label: "Verifying your resumes" },
  { from: 12, label: "Reading resume content" },
  { from: 28, label: "Analyzing experience, skills and projects" },
  { from: 70, label: "Structuring your profile" },
  { from: 90, label: "Saving your profile" },
];

// Generation runs as one server request with no progress feed, so the
// percentage is an estimate: it eases toward 95% and hits 100% on completion.
function GenerationProgressModal({
  isOpen,
  isDone,
}: {
  isOpen: boolean;
  isDone: boolean;
}) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setPercent(0);
      return;
    }
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const seconds = (Date.now() - startedAt) / 1000;
      setPercent(Math.min(95, Math.round(95 * (1 - Math.exp(-seconds / 35)))));
    }, 300);
    return () => window.clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const shown = isDone ? 100 : percent;
  const stage = isDone
    ? "Profile ready"
    : [...GENERATION_STAGES].reverse().find((s) => shown >= s.from)!.label;

  return (
    <div className="pr-modal-backdrop" role="presentation">
      <div
        className="pr-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pr-gen-title"
      >
        <span className="pr-synthesis-icon" aria-hidden="true">
          <Sparkles size={18} />
        </span>
        <h3 id="pr-gen-title">Generating your profile</h3>
        <p className="pr-modal-stage" aria-live="polite">{stage}…</p>
        <div
          className="pr-progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={shown}
        >
          <div className="pr-progress-fill" style={{ width: `${shown}%` }} />
        </div>
        <strong className="pr-progress-percent">{shown}%</strong>
        <p className="pr-modal-note">
          This can take a minute or two. Please keep this tab open.
        </p>
      </div>
    </div>
  );
}

function SynthesisStatus({
  resumeCount,
  hasResumes,
  candidateProfile,
  isGenerating,
  onGenerate,
}: {
  resumeCount: number;
  hasResumes: boolean;
  candidateProfile: CandidateProfile | null;
  isGenerating: boolean;
  onGenerate: () => void;
}) {
  const checks = candidateProfile ? getProfileChecks(candidateProfile) : [];
  const completeness = checks.length
    ? Math.round((checks.filter((c) => c.ok).length / checks.length) * 100)
    : 0;
  const signalCount = candidateProfile
    ? SKILL_GROUPS.reduce(
        (n, g) => n + candidateProfile.technical_skills[g.key].length,
        0,
      ) +
      candidateProfile.work_experience.length +
      candidateProfile.projects.length +
      candidateProfile.education.length +
      candidateProfile.certifications.length +
      candidateProfile.achievements.length
    : 0;

  return (
    <section className="pr-synthesis-card" aria-labelledby="pr-synthesis-heading">
      <div className="pr-synthesis-copy">
        <span className="pr-synthesis-icon" aria-hidden="true">
          <Sparkles size={17} />
        </span>
        <div>
          <p className="pr-eyebrow">NORTH SYNTHESIS</p>
          <h3 id="pr-synthesis-heading">
            {candidateProfile
              ? "Your profile is built from your resumes"
              : hasResumes
                ? "Your files are ready for synthesis"
                : "Your profile is ready to begin"}
          </h3>
          <p>
            {candidateProfile
              ? "Regenerate after adding or changing a resume to refresh your profile."
              : hasResumes
                ? "Generate your profile to consolidate your resumes into one structured career record."
                : "Add a resume to begin building a clear, consolidated career record."}
          </p>
        </div>
      </div>
      <div className="pr-synthesis-metrics">
        <div>
          <strong>{resumeCount}</strong>
          <span>RESUMES</span>
        </div>
        <div>
          <strong>{candidateProfile ? signalCount : "—"}</strong>
          <span>PROFILE SIGNALS</span>
        </div>
        <div>
          <strong>{candidateProfile ? `${completeness}%` : "—"}</strong>
          <span>COMPLETENESS</span>
        </div>
        <div className="pr-synthesis-processing">
          <strong>
            {isGenerating ? "Processing" : candidateProfile ? "Generated" : "Not generated"}
          </strong>
          <span>PROCESSING STATUS</span>
        </div>
      </div>
      <button
  type="button"
  className="pr-button pr-button-primary pr-review-button"
  onClick={onGenerate}
  disabled={isGenerating || !hasResumes}
>
  <Sparkles size={15} />
  {isGenerating
    ? "Generating your profile..."
    : candidateProfile
      ? "Regenerate profile"
      : "Unlock your profile"}
  <ChevronRight size={15} />
</button>
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


const { markProfileGenerated } = useCandidateProfileStatus();

const [candidateProfile, setCandidateProfile] =
  useState<CandidateProfile | null>(null);

const [isGenerating, setIsGenerating] = useState(false);
const [generationDone, setGenerationDone] = useState(false);
const [profileError, setProfileError] = useState<string | null>(null);
const [isProfileLoading, setIsProfileLoading] = useState(true);

useEffect(() => {
  let isMounted = true;

  async function loadProfile() {
    try {
      const profile = await getCandidateProfile();

      if (isMounted && profile.candidateProfile) {
  const aiProfile = profile.candidateProfile;
  const customizations = profile.customizations;

  setCandidateProfile(aiProfile);

  setProfileDetails(buildProfileDetails(aiProfile, customizations));
}
    } catch (error) {
      console.error("Failed to load candidate profile:", error);
      if (isMounted) {
        setProfileError("Could not load your saved profile.");
      }
    } finally {
      if (isMounted) setIsProfileLoading(false);
    }
  }

  loadProfile();

  return () => {
    isMounted = false;
  };
}, []);

  const handleGenerateProfile = async () => {
    if (resumes.length === 0) {
      setProfileError("Please upload a resume first.");
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationDone(false);
      setProfileError(null);

      const profile = await generateCandidateProfile();

setCandidateProfile(profile);
markProfileGenerated();

setProfileDetails(buildProfileDetails(profile, null));

      setGenerationDone(true);
      await new Promise((resolve) => setTimeout(resolve, 700));
    } catch (error: any) {
      console.error("Profile generation failed:", error);

      if (error.response?.status === 422) {
        setProfileError(
          error.response.data.details || "Resume verification failed."
        );
      } else {
        setProfileError(
          error.response?.data?.message ||
          "Unable to generate your profile."
        );
      }
    } finally {
      setIsGenerating(false);
      setGenerationDone(false);
    }
};


  const [profileDetails, setProfileDetails] = useState(initialProfile);

  async function handleSaveProfile(details: ProfileDetails) {
  try {
    setProfileError(null);

    await updateCandidateProfile(details);

    setProfileDetails(details);
  } catch (error: any) {
    console.error("Failed to save profile:", error);

    setProfileError(
      error.response?.data?.message || "Could not save profile changes."
    );
  }
}
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
              {isProfileLoading
                ? "Loading your profile…"
                : candidateProfile
                  ? "Generated from your resumes"
                  : hasResumes
                    ? "Ready to generate"
                    : "Ready when you are"}
            </span>
          </div>

          <ProfileOverview
            name={user.name}
            email={user.email}
            details={profileDetails}
            profile={candidateProfile}
            onSave={handleSaveProfile}
          />

          {profileError && (
            <p className="pr-upload-error" role="alert">
              <CircleAlert size={14} />
              {profileError}
            </p>
          )}

          <div className="pr-intelligence-grid">
            <CareerTrajectory profile={candidateProfile} hasResumes={hasResumes} />
            <TechnicalSkills profile={candidateProfile} hasResumes={hasResumes} />
            <ProjectArtifacts profile={candidateProfile} hasResumes={hasResumes} />
            <EducationSection profile={candidateProfile} hasResumes={hasResumes} />
            <CredentialsSection profile={candidateProfile} hasResumes={hasResumes} />
            <ProfileIntegrity profile={candidateProfile} hasResumes={hasResumes} />
          </div>

          <GenerationProgressModal isOpen={isGenerating} isDone={generationDone} />

          <SynthesisStatus
  resumeCount={totalResumeCount}
  hasResumes={hasResumes}
  candidateProfile={candidateProfile}
  isGenerating={isGenerating}
  onGenerate={handleGenerateProfile}
/>
        </section>
      </div>
    </main>
  );
}
