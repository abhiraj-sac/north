
import {api} from "./api";

export interface CandidateProfile {
  personal_information: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    linkedin_url?: string | null;
    github_url?: string | null;
    portfolio_url?: string | null;
  };

  headline?: string | null;
  professional_summary?: string | null;

  technical_skills: {
    programming_languages: string[];
    frameworks: string[];
    databases: string[];
    tools: string[];
    cloud_platforms: string[];
    other_skills: string[];
  };

  work_experience: Array<{
    company?: string | null;
    role?: string | null;
    employment_type?: string | null;
    location?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    is_current?: boolean;
    responsibilities: string[];
    achievements: string[];
    technologies: string[];
  }>;

  projects: Array<{
    name?: string | null;
    description?: string | null;
    technologies: string[];
    contributions: string[];
    project_url?: string | null;
  }>;

  education: Array<{
    institution?: string | null;
    degree?: string | null;
    field_of_study?: string | null;
    graduation_year?: string | null;
  }>;

  certifications: Array<{
    name?: string | null;
    issuer?: string | null;
    issue_date?: string | null;
    credential_url?: string | null;
  }>;

  achievements: Array<{
    title?: string | null;
    description?: string | null;
    date?: string | null;
  }>;
}

// Makes a stored profile safe to render: fills missing arrays/objects and
// maps legacy keys (linkedin/github/portfolio) to the *_url names.
export function normalizeCandidateProfile(raw: any): CandidateProfile {
  const p = raw ?? {};
  const pi = p.personal_information ?? {};
  const ts = p.technical_skills ?? {};
  const list = (v: unknown) => (Array.isArray(v) ? v : []);

  return {
    ...p,
    personal_information: {
      ...pi,
      linkedin_url: pi.linkedin_url ?? pi.linkedin ?? null,
      github_url: pi.github_url ?? pi.github ?? null,
      portfolio_url: pi.portfolio_url ?? pi.portfolio ?? null,
    },
    headline: p.headline ?? null,
    professional_summary: p.professional_summary ?? null,
    technical_skills: {
      programming_languages: list(ts.programming_languages),
      frameworks: list(ts.frameworks),
      databases: list(ts.databases),
      tools: list(ts.tools),
      cloud_platforms: list(ts.cloud_platforms),
      other_skills: list(ts.other_skills),
    },
    work_experience: list(p.work_experience).map((e: any) => ({
      ...e,
      responsibilities: list(e?.responsibilities),
      achievements: list(e?.achievements),
      technologies: list(e?.technologies),
    })),
    projects: list(p.projects).map((e: any) => ({
      ...e,
      technologies: list(e?.technologies),
      contributions: list(e?.contributions),
    })),
    education: list(p.education),
    certifications: list(p.certifications),
    achievements: list(p.achievements),
  };
}

export async function getCandidateProfile() {
  const response = await api.get("/api/candidate-profile");

  return {
    candidateProfile: response.data.candidateProfile
      ? normalizeCandidateProfile(response.data.candidateProfile)
      : null,
    customizations: response.data.customizations,
  };
}

export async function generateCandidateProfile(): Promise<CandidateProfile> {
  const response = await api.post("/api/candidate-profile");
  return normalizeCandidateProfile(response.data.candidateProfile);
}


export async function updateCandidateProfile(
  customizations: {
    headline: string;
    location: string;
    summary: string;
  }
) {
  const response = await api.put("/api/candidate-profile", {
    customizations,
  });

  return response.data.customizations;
}