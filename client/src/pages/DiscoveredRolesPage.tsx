import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import {
  ArrowDownUp,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Clock3,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";
import "./DiscoveredRolesPage.css";
import axios from "axios";

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

interface JobsResponse {
  jobs: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function getTimeAgo(date: string | null) {
  if (!date) return "Update date unavailable";

  const hours = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 3600000),
  );

  if (hours < 1) return "Updated less than an hour ago";
  if (hours === 1) return "Updated 1 hour ago";
  return `Updated ${hours} hours ago`;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function DiscoveredRolesPage() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchJobs() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get<JobsResponse>("/api/jobs", {
          params: {
            page,
            limit: 20,
          },
          signal: controller.signal,
        });

        const data = response.data;

        setJobs(data.jobs ?? []);
        setTotal(data.pagination?.total ?? 0);
        setTotalPages(data.pagination?.totalPages ?? 0);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          axios.isAxiosError(err)
            ? (err.response?.data?.message ?? err.message)
            : err instanceof Error
              ? err.message
              : "Something went wrong.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchJobs();

    return () => controller.abort();
  }, [page]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return jobs;

    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.companyName.toLowerCase().includes(query) ||
        (job.location ?? "").toLowerCase().includes(query),
    );
  }, [jobs, search]);

  return (
    <main className="dr-page">
      <section className="dr-heading">
        <div>
          <span className="dr-eyebrow">
            <span className="dr-live-dot" />
            NORTH CAREER INTELLIGENCE
          </span>

          <h1>Discover Opportunities</h1>

          <p>Explore recently updated technology roles across India.</p>
        </div>

        <div className="dr-count-card">
          <span>AVAILABLE OPPORTUNITIES</span>
          <strong>{total}</strong>
          <small>Last 7 days</small>
        </div>
      </section>

      <section className="dr-toolbar">
        <div className="dr-search">
          <Search size={17} />
          <input
            type="search"
            placeholder="Search job title, company or location..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="dr-filter-label">
          <Clock3 size={15} />
          Updated within 7 days
        </div>

        <button
          className="dr-refresh"
          type="button"
          onClick={() => setPage((current) => current)}
          disabled={loading}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </section>

      <section className="dr-results-heading">
        <div>
          <h2>Recently updated roles</h2>
          <p>
            Showing {filteredJobs.length} of {total} opportunities
          </p>
        </div>

        <span className="dr-sort-label">
          <ArrowDownUp size={14} />
          Latest first
        </span>
      </section>

      {loading ? (
        <div className="dr-state">
          <span className="dr-spinner" />
          <p>Finding opportunities...</p>
        </div>
      ) : error ? (
        <div className="dr-state">
          <h3>We couldn't load the jobs</h3>
          <p>{error}</p>
          <button type="button" onClick={() => setPage((current) => current)}>
            Try again
          </button>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="dr-state">
          <BriefcaseBusiness size={30} />
          <h3>No matching opportunities</h3>
          <p>
            {search
              ? "Try another job title, company or location."
              : "New opportunities will appear here when available."}
          </p>
        </div>
      ) : (
        <div className="dr-job-list">
          {filteredJobs.map((job) => (
            <article
              className="dr-job-card"
              key={job.id}
              onClick={() => navigate(`/applications/new/${job.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
  navigate(`/applications/new/${job.id}`);
}
              }}
              role="link"
              tabIndex={0}
            >
              <div className="dr-job-main">
                <div className="dr-company-mark">
                  {getInitials(job.companyName) || <Building2 size={19} />}
                </div>

                <div className="dr-job-content">
                  <div className="dr-company-name">
                    {job.companyName}
                    <span className="dr-source-tag">{job.source.provider}</span>
                  </div>

                  <h3>{job.title}</h3>

                  <div className="dr-job-meta">
                    <span>
                      <MapPin size={14} />
                      {job.location || "Location not specified"}
                    </span>

                    <span>
                      <Clock3 size={14} />
                      {getTimeAgo(job.sourceUpdatedAt)}
                    </span>
                  </div>

                  <p className="dr-job-description">
                    {job.descriptionText?.slice(0, 220) ||
                      "View the original listing for job details."}
                    {job.descriptionText && job.descriptionText.length > 220
                      ? "..."
                      : ""}
                  </p>
                </div>
              </div>

              <div className="dr-job-action">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(`/applications/new/${job.id}`);
                  }}
                >
                  Start Application
                  <ArrowRight size={15} />
                </button>
                <span>Create a job-specific resume</span>
                <span>Explore this opportunity</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <nav className="dr-pagination" aria-label="Job pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </main>
  );
}
