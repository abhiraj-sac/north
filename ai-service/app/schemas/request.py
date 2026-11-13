
from pydantic import BaseModel, Field


class CandidateProfileRequest(BaseModel):
    raw_text: str = Field(min_length=1)