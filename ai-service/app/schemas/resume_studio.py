from pydantic import BaseModel, Field
from app.schemas.candidate import CandidateProfile


class ResumeStudioJob(BaseModel):
    id: str
    title: str
    companyName: str
    location: str | None = None
    employmentType: str | None = None
    workMode: str | None = None
    descriptionText: str


class ResumeStudioGenerateRequest(BaseModel):
    job: ResumeStudioJob
    candidate_profile: CandidateProfile