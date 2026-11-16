
import {api} from "./api";

export interface CandidateProfile {
  personal_information: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    linkedin?: string | null;
    github?: string | null;
    portfolio?: string | null;
  };

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

interface CandidateProfileResponse {
  candidateProfile: CandidateProfile | null;
}

export async function getCandidateProfile() {
  const response = await api.get("/api/candidate-profile");

  return {
    candidateProfile: response.data.candidateProfile,
    customizations: response.data.customizations,
  };
}

export async function generateCandidateProfile() {
  const response = await api.post("/api/candidate-profile");
  return response.data.candidateProfile;
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