
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  MapPin,
  Building2,
  FileText,
  Wallet,
  Clock3,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { api } from "../lib/api";
import axios from "axios";
import "./ApplicationWorkspacePage.css";

interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string | null;
  descriptionText: string | null;
  applyUrl: string;
  sourceUpdatedAt: string | null;
  source: {
    provider: string;
    companyName: string;
  };
}

const skillKeywords = [
  "REST APIs",
  "OpenAPI",
  "SQL",
  "Distributed Systems",
  "Event-driven Architecture",
  "Workflow Orchestration",
  "Idempotency",
  "Retries",
  "Eventual Consistency",
  "LLMs",
  "AI Agents",
  "Tool Calling",
  "Agent Orchestration",
  "OAuth",
  "SSO",
  "KYC",
  "CKYC",
  "Video KYC",
  "DigiLocker",
  "DPDP Act",
  "PII Handling",
  "Encryption",
  "SLOs",
];

function extractDescriptionBlocks(html: string | null) {
  if (!html) {
    return [{ type: "paragraph", text: "No job description available." }];
  }

  const parsed = new DOMParser().parseFromString(html, "text/html");

  const elements = parsed.body.querySelectorAll(
    "h1, h2, h3, h4, h5, h6, p, li"
  );

  const blocks = Array.from(elements)
    .map((element) => ({
      type: element.tagName.toLowerCase(),
      text: element.textContent?.trim() || "",
    }))
    .filter((block) => block.text.length > 0);

  if (blocks.length > 0) return blocks;

  const fallback = parsed.body.textContent?.trim();

  return [{
    type: "paragraph",
    text: fallback || "No job description available.",
  }];
}

function extractExperience(description: string) {
  const match = description.match(
    /\b\d+\s*(?:to|-)\s*\d+\s+years?\b|\b\d+\+\s+years?\b/i
  );

  return match?.[0] || "Not specified";
}

export default function ApplicationWorkspacePage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchJob() {
      if (!jobId) {
        setError("Job ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<{ job: Job }>(
          `/api/jobs/${jobId}`,
          { signal: controller.signal }
        );

        setJob(response.data.job);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.message ?? err.message
            : "Unable to load job details."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchJob();

    return () => controller.abort();
  }, [jobId]);

  const descriptionBlocks = useMemo(
    () => extractDescriptionBlocks(job?.descriptionText ?? null),
    [job?.descriptionText]
  );

  const descriptionText = useMemo(
    () => descriptionBlocks.map((block) => block.text).join(" "),
    [descriptionBlocks]
  );

  const experience = extractExperience(descriptionText);

  const extractedSkills = skillKeywords.filter((skill) =>
    new RegExp(
      skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    ).test(descriptionText)
  );

  if (loading) {
    return <div className="aw-state">Loading application workspace...</div>;
  }

  if (error || !job) {
    return (
      <div className="aw-state">
        <h2>Unable to open this application</h2>
        <p>{error || "Job not found."}</p>
        <button onClick={() => navigate("/roles")}>
          Back to discovered roles
        </button>
      </div>
    );
  }

  return (
    <main className="aw-page">
      <header className="aw-header">
        <button
          className="aw-back"
          onClick={() => navigate("/roles")}
          type="button"
        >
          <ArrowLeft size={16} />
          Back to roles
        </button>

        <div>
          <span className="aw-eyebrow">NORTH / APPLICATION WORKSPACE</span>
          <h1>Build your tailored resume</h1>
          <p>Understand the opportunity. Build your strongest application.</p>
        </div>
      </header>

      <section className="aw-job-summary">
        <div className="aw-company-icon">
          <Building2 size={24} />
        </div>

        <div className="aw-summary-content">
          <span className="aw-company-name">{job.companyName}</span>
          <h2>{job.title}</h2>

          <div className="aw-meta">
            <span>
              <MapPin size={15} />
              {job.location || "Location not specified"}
            </span>
            <span>
              <BriefcaseBusiness size={15} />
              {job.source?.provider || "Job listing"}
            </span>
          </div>
        </div>

        {job.applyUrl && (
          <a
            className="aw-external-link"
            href={job.applyUrl}
            target="_blank"
            rel="noreferrer"
          >
            Original listing <ExternalLink size={14} />
          </a>
        )}
      </section>

      <section className="aw-facts">
        <div className="aw-fact-card">
          <Wallet size={19} />
          <div>
            <span>Salary</span>
            <strong>Not disclosed</strong>
          </div>
        </div>

        <div className="aw-fact-card">
          <Clock3 size={19} />
          <div>
            <span>Experience required</span>
            <strong>{experience}</strong>
          </div>
        </div>

        <div className="aw-fact-card">
          <MapPin size={19} />
          <div>
            <span>Location</span>
            <strong>{job.location || "Not specified"}</strong>
          </div>
        </div>
      </section>

      <section className="aw-skills-section">
        <div className="aw-section-title">
          <h2>Skills & technical requirements</h2>
          <span>Extracted from job description</span>
        </div>

        {extractedSkills.length > 0 ? (
          <div className="aw-skills">
            {extractedSkills.map((skill) => (
              <span className="aw-skill" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="aw-muted">No specific technical skills identified.</p>
        )}

        <p className="aw-note">
          These are skills and concepts mentioned in the listing, not a
          verified employer technology stack.
        </p>
      </section>

      <section className="aw-workspace">
        <div className="aw-panel aw-job-panel">
          <div className="aw-panel-heading">
            <div>
              <FileText size={18} />
              <h2>Job description</h2>
            </div>
            <span className="aw-panel-caption">Full role details</span>
          </div>

          <div
            className={`aw-job-description ${
              showFullDescription ? "aw-description-expanded" : ""
            }`}
          >
            {descriptionBlocks.map((block, index) => {
              if (/^h[1-6]$/.test(block.type)) {
                return <h3 key={index}>{block.text}</h3>;
              }

              if (block.type === "li") {
                return (
                  <div className="aw-description-list-item" key={index}>
                    <span>•</span>
                    <p>{block.text}</p>
                  </div>
                );
              }

              return <p key={index}>{block.text}</p>;
            })}
          </div>

          <button
            className="aw-read-more"
            onClick={() => setShowFullDescription((value) => !value)}
            type="button"
          >
            {showFullDescription ? (
              <>Read less <ChevronUp size={16} /></>
            ) : (
              <>Read full description <ChevronDown size={16} /></>
            )}
          </button>
        </div>

        <div className="aw-panel aw-resume-panel">
  <div className="aw-panel-heading">
    <div>
      <FileText size={18} />
      <h2>Resume Studio</h2>
    </div>
    <span className="aw-panel-caption">Your application</span>
  </div>

  <div className="aw-resume-preview">

    {/* Full Resume Background */}
    <img
      src="/resume-preview.png"
      alt="Tailored resume preview"
      className="aw-resume-preview-image"
    />

    {/* Center Overlay */}
    
<div className="aw-resume-overlay">
  <div className="aw-resume-overlay-card">

    <div className="aw-resume-card-top">
      <div className="aw-resume-card-icon">
        <FileText size={17} />
      </div>
      <span>BUILT FOR THIS ROLE</span>
    </div>

    <h3>
      A resume that
      <br />
      <span>fits this opportunity.</span>
    </h3>

    <p>
      Your experience, refined for the role.
      Review every detail before you apply.
    </p>

    <div className="aw-resume-card-footer">
      <span className="aw-resume-ready">
        <span className="aw-ready-dot" />
        Ready for review
      </span>

      <button
        type="button"
        className="aw-resume-cta"
        onClick={() => navigate(`/studio/${job.id}`)}
      >
        Open Studio
        <ArrowUpRight size={17} />
      </button>
    </div>

  </div>
</div>


  </div>
</div>
      </section>
    </main>
  );
}
