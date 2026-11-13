
from fastapi import FastAPI, HTTPException

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
        profile = generate_candidate_profile(request.raw_text)
        return profile

    except Exception as e:
        logger.exception(
            "Candidate profile generation failed: %s",
            str(e)
        )

    raise HTTPException(
        status_code=500,
        detail=f"Candidate profile generation failed: {str(e)}"
    ) from e
