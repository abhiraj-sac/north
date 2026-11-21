import {
  ArrowRight,
  BriefcaseBusiness,
  CloudUpload,
  FileStack,
  Mountain,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useCandidateProfileStatus } from "../auth/CandidateProfileContext";
import SystemFooter from "../components/SystemFooter";

const pipelineStages = [
  { number: "01", label: "MULTI-PDF INGESTION", title: "Your Resumes", Icon: FileStack },
  { number: "02", label: "CANONICAL LEDGER", title: "Verified Profile", Icon: ShieldCheck },
  { number: "03", label: "EDITORIAL MATCHING", title: "Relevant Roles", Icon: BriefcaseBusiness },
  { number: "04", label: "SYNTHESIS ENGINE", title: "Tailored Studio", Icon: Sparkles },
];

export default function Landing() {
  const { user } = useAuth();
  const { hasProfile } = useCandidateProfileStatus();

  return (
    <section className="landing-content">
      <div className="landing-inner">
        <section className="hero-section" aria-labelledby="hero-heading">
          <div className="hero-copy">
            {user && <p className="hero-welcome">Welcome, {user.name}.</p>}
            <p className="hero-kicker">
              <span className="status-dot" />
              YOUR NEXT CHAPTER, BUILT ON YOUR EXPERIENCE
            </p>
            <h1 className="hero-heading" id="hero-heading">
              Your next opportunity deserves a{" "}
              <em>better version</em> of you.
            </h1>
            <p className="hero-description">
              A private environment for your career intelligence. Your next move starts here.
            </p>
            <div className="hero-actions">
              <Link className="hero-cta hero-cta-primary" to="/profile">
                Explore your profile <ArrowRight size={14} strokeWidth={1.8} />
              </Link>
              {hasProfile ? (
                <Link className="hero-cta hero-cta-secondary" to="/roles">
                  Discover roles
                </Link>
              ) : (
                <span
                  className="hero-cta hero-cta-secondary hero-cta-disabled"
                  role="link"
                  aria-disabled="true"
                  title="Generate your profile first to unlock discovered roles"
                >
                  Discover roles
                </span>
              )}
            </div>
          </div>

          <div className="hero-illustration" aria-hidden="true">
            <div className="hero-art-orbit hero-art-orbit-outer" />
            <div className="hero-art-orbit hero-art-orbit-inner" />
            <div className="hero-art-sheet hero-art-sheet-back">
              <span />
              <span />
              <span />
            </div>
            <div className="hero-art-sheet hero-art-sheet-front">
              <span className="hero-art-mark">
                <Mountain size={31} strokeWidth={1.35} />
              </span>
              <span className="hero-art-line hero-art-line-long" />
              <span className="hero-art-line" />
              <span className="hero-art-line hero-art-line-short" />
              <span className="hero-art-rule" />
              <span className="hero-art-line hero-art-line-long" />
              <span className="hero-art-line" />
            </div>
            <span className="hero-art-node hero-art-node-one" />
            <span className="hero-art-node hero-art-node-two" />
            <span className="hero-art-node hero-art-node-three" />
          </div>
        </section>

        <section className="pipeline-section" aria-labelledby="pipeline-heading">
          <div className="pipeline-heading-row">
            <div>
              <p className="pipeline-kicker">
                <span className="status-dot" />
                A CLEARER CAREER WORKSPACE
              </p>
              <h2 className="pipeline-heading" id="pipeline-heading">
                The NORTH Transformation Pipeline
              </h2>
            </div>
            <span className="pipeline-index">01 — 04</span>
          </div>
          <div className="pipeline-grid" aria-label="Transformation pipeline">
            {pipelineStages.map(({ number, label, title, Icon }) => (
              <article className="pipeline-card" key={number}>
                <div className="pipeline-card-topline">
                  <span className="pipeline-number">{number}</span>
                  <span className="pipeline-icon" aria-hidden="true">
                    <Icon size={15} strokeWidth={1.7} />
                  </span>
                </div>
                <p className="pipeline-label">{label}</p>
                <h3 className="pipeline-card-title">{title}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="ingestion-cta" aria-labelledby="ingestion-heading">
          <div className="ingestion-copy">
            <p className="ingestion-kicker">
              <span className="ingestion-status-dot" aria-hidden="true" />
              READY FOR INGESTION
            </p>
            <h2 className="ingestion-heading" id="ingestion-heading">
              Start with your experience.
            </h2>
          </div>
          <div className="ingestion-actions">
            <Link className="ingestion-button ingestion-button-primary" to="/profile">
              <CloudUpload size={15} strokeWidth={1.8} />
              Upload PDF Resumes (Max 3)
            </Link>
            <Link className="ingestion-button ingestion-button-secondary" to="/profile">
              Get Started Free
              <ArrowRight size={14} strokeWidth={1.8} />
            </Link>
          </div>
        </section>
      </div>
      <SystemFooter variant="landing" />
    </section>
  );
}
