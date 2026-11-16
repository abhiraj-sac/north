
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Download,
  FileText,
  RefreshCw,
  Save,
  Sparkles,
} from "lucide-react";

import {
  downloadResumePdf,
  generateResume,
  getGeneratedResume,
  getResumeStudioContext,
  saveGeneratedResume,
  type GeneratedResume,
  type ResumeStudioContext,
} from "../lib/resumeStudioApi";

import "./ResumeStudioPage.css";

export default function ResumeStudioPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [context, setContext] = useState<ResumeStudioContext | null>(null);
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadStudio = useCallback(async (signal?: AbortSignal) => {
    if (!jobId) {
      setError("Job ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [contextData, resumeData] = await Promise.all([
        getResumeStudioContext(jobId, signal),
        getGeneratedResume(jobId, signal),
      ]);

      if (signal?.aborted) return;

      setContext(contextData);
      setResume(resumeData);
      setResumeText(
        resumeData
          ? JSON.stringify(resumeData.content, null, 2)
          : ""
      );
    } catch (err) {
      if (signal?.aborted) return;

      console.error("Resume Studio loading error:", err);
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Could not load Resume Studio."
          : "Could not load Resume Studio."
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    const controller = new AbortController();
    loadStudio(controller.signal);

    return () => controller.abort();
  }, [loadStudio]);

  const handleGenerate = async () => {
    if (!jobId) return;

    const confirmed = resume
      ? window.confirm(
          "Regenerating will replace your current saved resume, including manual edits. Continue?"
        )
      : true;

    if (!confirmed) return;

    try {
      setGenerating(true);
      setError("");
      setNotice("");

      const generated = await generateResume(jobId);

      setResume(generated);
      setResumeText(JSON.stringify(generated.content, null, 2));
      setNotice("Your tailored resume has been generated.");
    } catch (err) {
      console.error("Resume generation error:", err);
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Resume generation failed."
          : "Resume generation failed."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!jobId) return;

    let parsedContent: Record<string, unknown>;

    try {
      const parsed = JSON.parse(resumeText);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        setError("Resume content must be a valid JSON object.");
        return;
      }

      parsedContent = parsed as Record<string, unknown>;
    } catch {
      setError("Invalid JSON. Please fix the formatting before saving.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setNotice("");

      const saved = await saveGeneratedResume(jobId, parsedContent);

      setResume(saved);
      setResumeText(JSON.stringify(saved.content, null, 2));
      setNotice("Resume draft saved successfully.");
    } catch (err) {
      console.error("Resume save error:", err);
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Could not save your resume."
          : "Could not save your resume."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!jobId || !resume) return;

    try {
      setDownloading(true);
      setError("");

      const pdfBlob = await downloadResumePdf(jobId);
      const url = URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "north-resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "PDF download failed."
          : "PDF download failed."
      );
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <main className="rs-page">
        <div className="rs-state">
          <div className="rs-spinner" />
          <p>Loading Resume Studio...</p>
        </div>
      </main>
    );
  }

  if (!context) {
    return (
      <main className="rs-page">
        <div className="rs-state">
          <h2>Resume Studio unavailable</h2>
          <p>{error || "Could not load the job details."}</p>
          <button onClick={() => navigate(-1)} className="rs-secondary-btn">
            <ArrowLeft size={16} /> Go back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="rs-page">
      <div className="rs-container">
        <header className="rs-header">
          <button
            className="rs-back-btn"
            onClick={() => navigate(-1)}
            type="button"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="rs-heading">
            <div className="rs-heading-icon">
              <FileText size={22} />
            </div>
            <div>
              <h1>Resume Studio</h1>
              <p>Tailor your resume for this opportunity.</p>
            </div>
          </div>
        </header>

        <section className="rs-job-card">
          <div>
            <span className="rs-eyebrow">TARGET ROLE</span>
            <h2>{context.job.title}</h2>
            <p>
              {context.job.companyName}
              {context.job.location ? ` · ${context.job.location}` : ""}
            </p>
          </div>

          <div className="rs-job-tags">
            {context.job.workMode && (
              <span>{context.job.workMode}</span>
            )}
            {context.job.employmentType && (
              <span>{context.job.employmentType}</span>
            )}
          </div>
        </section>

        {error && (
          <div className="rs-alert rs-alert-error" role="alert">
            {error}
          </div>
        )}

        {notice && (
          <div className="rs-alert rs-alert-success" role="status">
            {notice}
          </div>
        )}

        {!resume ? (
          <section className="rs-empty-card">
            <div className="rs-empty-icon">
              <Sparkles size={28} />
            </div>
            <h2>Create your tailored resume</h2>
            <p>
              NORTH will use your candidate profile and this job description
              to generate a tailored resume draft.
            </p>

            <button
              className="rs-primary-btn"
              onClick={handleGenerate}
              disabled={generating}
              type="button"
            >
              {generating ? (
                <>
                  <RefreshCw size={17} className="rs-spin" />
                  Generating resume...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Generate Resume
                </>
              )}
            </button>
          </section>
        ) : (
          <section className="rs-editor-card">
            <div className="rs-editor-heading">
              <div>
                <span className="rs-eyebrow">YOUR RESUME</span>
                <h2>Resume draft</h2>
                <p>
                  Version {resume.version} · Last updated{" "}
                  {new Date(resume.updatedAt).toLocaleString()}
                </p>
              </div>

              <span className="rs-status">{resume.status}</span>
            </div>

            <div className="rs-editor-help">
              Edit the resume data below. Keep the content as a valid JSON
              object, then save your changes.
            </div>

            <label className="rs-editor-label" htmlFor="resume-json">
              Resume content
            </label>

            <textarea
              id="resume-json"
              className="rs-json-editor"
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
              spellCheck={false}
              aria-label="Editable resume JSON"
            />

            <div className="rs-editor-actions">
              <button
                className="rs-primary-btn"
                onClick={handleSave}
                disabled={saving || generating}
                type="button"
              >
                <Save size={17} />
                {saving ? "Saving..." : "Save Draft"}
              </button>

              <button
                className="rs-secondary-btn"
                onClick={handleDownload}
                disabled={downloading || saving}
                type="button"
              >
                <Download size={17} />
                {downloading ? "Preparing PDF..." : "Download PDF"}
              </button>

              <button
                className="rs-regenerate-btn"
                onClick={handleGenerate}
                disabled={generating || saving}
                type="button"
              >
                <RefreshCw size={16} className={generating ? "rs-spin" : ""} />
                {generating ? "Regenerating..." : "Regenerate"}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
