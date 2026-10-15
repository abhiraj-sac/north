import {
  ArrowUpRight,
  BadgeCheck,
  FileText,
  Layers3,
  ScanLine,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { useState } from "react";

interface ResumeDocument {
  id: string;
  filename: string;
  metadata: string;
  milestones: number;
  accent: "blue" | "slate" | "sand";
}

const resumeDocuments: ResumeDocument[] = [
  {
    id: "DOC_A",
    filename: "systems_arch.pdf",
    metadata: "SYSTEMS · ARCHITECTURE",
    milestones: 12,
    accent: "blue",
  },
  {
    id: "DOC_B",
    filename: "engineering_cv.pdf",
    metadata: "ENGINEERING · PLATFORM",
    milestones: 9,
    accent: "slate",
  },
  {
    id: "DOC_C",
    filename: "verified_work.pdf",
    metadata: "VERIFICATION · IMPACT",
    milestones: 7,
    accent: "sand",
  },
];

const capabilities = [
  {
    number: "01",
    title: "Resume Synthesis",
    description: "One coherent career ledger",
    Icon: Layers3,
  },
  {
    number: "02",
    title: "Grounded Resonance",
    description: "Evidence-led role matching",
    Icon: ScanLine,
  },
  {
    number: "03",
    title: "Tailored Diff Studio",
    description: "Transparent, precise edits",
    Icon: Workflow,
  },
  {
    number: "04",
    title: "Founder Desks",
    description: "Direct routes to builders",
    Icon: ArrowUpRight,
  },
];

const teamImage =
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=80";

export default function EngineeringPreview() {
  const [imageUnavailable, setImageUnavailable] = useState(false);

  return (
    <section className="engineering-preview" aria-labelledby="engineering-heading">
      <div className="engineering-heading-row">
        <div className="engineering-kicker">
          <span>ENGINEERING INTELLIGENCE</span>
          <span className="engineering-version">/ NORTH OS 2.4</span>
        </div>
        <span className="interactive-badge">
          <span className="interactive-dot" />
          INTERACTIVE PREVIEW
        </span>
      </div>

      <h2 className="engineering-heading" id="engineering-heading">
        4 Sovereign Superpowers Built for Senior Engineers
      </h2>

      <div className="engineering-capabilities" aria-label="Preview capabilities">
        {capabilities.map(({ number, title, description, Icon }) => (
          <div className="engineering-capability" key={number}>
            <div className="capability-topline">
              <span className="capability-number">{number}</span>
              <Icon size={12} strokeWidth={1.7} />
            </div>
            <span className="capability-title">{title}</span>
            <span className="capability-description">{description}</span>
          </div>
        ))}
      </div>

      <div className="synthesis-panel">
        <div className="synthesis-heading-row">
          <h3 className="synthesis-title">01 / MULTI-RESUME SYNTHESIS PIPELINE</h3>
          <span className="synthesis-count">3 PDFs → 1 Sovereign Ledger</span>
        </div>
        <p className="synthesis-description">
          Consolidate multiple career histories into one structured, provenance-aware ledger.
        </p>

        <div className="resume-document-grid">
          {resumeDocuments.map((document) => (
            <article className="resume-document" key={document.id}>
              <div className="resume-document-top">
                <span className={`document-icon document-icon-${document.accent}`}>
                  <FileText size={14} strokeWidth={1.7} />
                </span>
                <span className="document-id">{document.id}</span>
              </div>
              <span className="document-filename">{document.filename}</span>
              <span className="document-metadata">{document.metadata}</span>
              <span className="document-milestones">
                <span className="milestone-dot" />
                {document.milestones} milestones extracted
              </span>
            </article>
          ))}
        </div>

        <article className="dossier-card">
          <span className="dossier-avatar" aria-hidden="true">
            EV
          </span>
          <div className="dossier-copy">
            <div className="dossier-name-row">
              <h4>Elena Vance</h4>
              <span className="dossier-kind">CONSOLIDATED DOSSIER</span>
            </div>
            <p>Staff SDE · Provenance Ledger · Deduplication 100%</p>
          </div>
          <span className="claims-preview">
            <BadgeCheck size={13} strokeWidth={1.7} />
            CLAIMS / VERIFICATION PREVIEW
          </span>
        </article>
        <p className="preview-disclaimer">
          Illustrative profile and document data — not verified credentials.
        </p>
      </div>

      <figure className="preview-testimonial">
        <blockquote>
          “NORTH treats senior engineering careers with the dignity of an architectural RFC: no
          recruiter spam, zero algorithmic degradation, pure signal.”
        </blockquote>
        <figcaption>
          <span>Elena Rostova</span>
          <span>· VP Systems Infrastructure</span>
        </figcaption>
        <span className="testimonial-note">ILLUSTRATIVE MARKETING COPY</span>
      </figure>

      <div className="preview-metrics" aria-label="Illustrative design values">
        <article className="preview-metric">
          <span className="metric-value">99.98%</span>
          <span className="metric-label">VERIFICATION SLA</span>
        </article>
        <article className="preview-metric">
          <span className="metric-value">0</span>
          <span className="metric-label">ATS INTERMEDIARIES</span>
        </article>
        <article className="preview-metric">
          <span className="metric-value">E2EE</span>
          <span className="metric-label">CRYPTOGRAPHIC SEAL</span>
        </article>
      </div>
      <p className="metric-disclaimer">ILLUSTRATIVE DESIGN VALUES · NOT OPERATIONAL GUARANTEES</p>

      <div
        className={imageUnavailable ? "cinematic-panel image-fallback" : "cinematic-panel"}
        aria-label="Illustrative engineering team photograph"
      >
        {!imageUnavailable && (
          <img
            className="cinematic-image"
            src={teamImage}
            alt=""
            loading="lazy"
            onError={() => setImageUnavailable(true)}
          />
        )}
        <div className="cinematic-overlay" />
        <div className="cinematic-location">
          <ShieldCheck size={13} strokeWidth={1.7} />
          <span>San Francisco · Zurich · Remote First</span>
        </div>
        <span className="cinematic-studio">NORTH / SYSTEMS STUDIO</span>
        {imageUnavailable && (
          <span className="cinematic-fallback-note">PHOTO PREVIEW UNAVAILABLE</span>
        )}
      </div>
    </section>
  );
}
