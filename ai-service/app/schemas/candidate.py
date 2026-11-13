
from pydantic import BaseModel, Field


# ---------- RESUME SOURCE ----------

class ResumeSource(BaseModel):
    resume_id: str
    filename: str
    uploaded_at: str


# ---------- PERSONAL INFORMATION ----------

class PersonalInformation(BaseModel):
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    portfolio_url: str | None = None
    source_resume_id: str | None = None


# ---------- TECHNICAL SKILLS ----------

class TechnicalSkills(BaseModel):
    programming_languages: list[str] = Field(default_factory=list)
    frameworks: list[str] = Field(default_factory=list)
    databases: list[str] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)
    cloud_platforms: list[str] = Field(default_factory=list)
    other_skills: list[str] = Field(default_factory=list)


# ---------- WORK EXPERIENCE ----------

class WorkExperience(BaseModel):
    company: str | None = None
    role: str | None = None
    employment_type: str | None = None
    location: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    is_current: bool | None = None

    responsibilities: list[str] = Field(default_factory=list)
    achievements: list[str] = Field(default_factory=list)
    technologies: list[str] = Field(default_factory=list)

    source_resume_id: str | None = None


# ---------- PROJECTS ----------

class Project(BaseModel):
    name: str | None = None
    description: str | None = None
    technologies: list[str] = Field(default_factory=list)
    contributions: list[str] = Field(default_factory=list)
    project_url: str | None = None

    source_resume_id: str | None = None


# ---------- EDUCATION ----------

class Education(BaseModel):
    institution: str | None = None
    degree: str | None = None
    field_of_study: str | None = None
    graduation_year: str | None = None

    source_resume_id: str | None = None


# ---------- CERTIFICATIONS ----------

class Certification(BaseModel):
    name: str
    issuer: str | None = None
    issue_date: str | None = None
    credential_url: str | None = None

    source_resume_id: str | None = None


# ---------- ACHIEVEMENTS ----------

class Achievement(BaseModel):
    title: str
    description: str | None = None
    date: str | None = None

    source_resume_id: str | None = None


# ---------- UNIFIED CANDIDATE PROFILE ----------

class CandidateProfile(BaseModel):

    resume_sources: list[ResumeSource] = Field(
        default_factory=list
    )

    personal_information: PersonalInformation = Field(
        default_factory=PersonalInformation
    )

    professional_summary: str | None = None

    technical_skills: TechnicalSkills = Field(
        default_factory=TechnicalSkills
    )

    work_experience: list[WorkExperience] = Field(
        default_factory=list
    )

    projects: list[Project] = Field(
        default_factory=list
    )

    education: list[Education] = Field(
        default_factory=list
    )

    certifications: list[Certification] = Field(
        default_factory=list
    )

    achievements: list[Achievement] = Field(
        default_factory=list
    )
