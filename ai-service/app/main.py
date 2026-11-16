
from fastapi import FastAPI, HTTPException
from app.schemas.resume_studio import ResumeStudioGenerateRequest
from app.services.resume_studio_service import generate_resume_studio
from app.schemas.request import CandidateProfileRequest
from app.schemas.candidate import CandidateProfile
from app.services.candidate_service import generate_candidate_profile
import logging

logger = logging.getLogger(__name__)


app = FastAPI(
    title="NORTH AI Service",
    version="1.0.0"
)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "north-ai-service"
    }


@app.post(
    "/api/candidate-profile",
    response_model=CandidateProfile
)
def create_candidate_profile(
    request: CandidateProfileRequest
):
    try:
        return generate_candidate_profile(request.raw_text)

    except Exception as e:
        logger.exception("Candidate profile generation failed")

        raise HTTPException(
            status_code=500,
            detail="Candidate profile generation failed"
        ) from e

@app.post(
    "/api/resume-studio/generate",
    response_model=CandidateProfile
)
def create_resume_studio(
    request: ResumeStudioGenerateRequest
):
    try:
        return generate_resume_studio(request)

    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail=str(e)
        ) from e

    except Exception as e:
        logger.exception(
            "Resume Studio generation failed"
        )

        raise HTTPException(
            status_code=500,
            detail="Resume Studio generation failed"
        ) from e