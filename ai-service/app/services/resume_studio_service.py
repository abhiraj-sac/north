import json
import logging
import time

from ai.llm_factory import get_structured_llm
from app.schemas.candidate import CandidateProfile
from app.schemas.resume_studio import ResumeStudioGenerateRequest

logger = logging.getLogger(__name__)

structured_llm = get_structured_llm(CandidateProfile)


def build_resume_studio_prompt(
    request: ResumeStudioGenerateRequest
) -> str:

    job = request.job.model_dump()
    candidate = request.candidate_profile.model_dump()

    return f"""
You are NORTH Resume Studio, an expert resume optimization engine.

Your task is to generate one complete, ATS-friendly resume
tailored to the supplied job description.

TARGET JOB:
{json.dumps(job, indent=2)}

ORIGINAL CANDIDATE PROFILE:
{json.dumps(candidate, indent=2)}

STRICT RULES:

1. Never invent experience, skills, qualifications,
   employment dates, achievements or certifications.

2. Preserve all factual information from the candidate profile.

3. Rewrite the professional summary to emphasize genuine
   experience relevant to the target job.

4. Prioritize existing technical skills according to
   relevance to the job description.

5. Improve work experience descriptions without changing
   their factual meaning.

6. Preserve actual metrics and achievements.

7. Highlight relevant projects and contributions.

8. Do not associate technologies with a project or employer
   unless the original profile supports that association.

9. Do not add keywords merely because they appear in
   the job description.

10. Do not change the candidate's identity or contact details.

11. Preserve education and certification information.

12. Keep all source_resume_id values unchanged.

13. Include the candidate's actual achievements.
    Do not convert unrelated achievements into employment
    accomplishments.

14. The job description is a targeting reference,
    not evidence of candidate qualifications.

15. Return a complete resume, not just modified sections.

OUTPUT REQUIREMENTS:

Return data strictly matching the CandidateProfile schema.

Return only structured output.
Do not include explanations or commentary.
"""


def generate_resume_studio(
    request: ResumeStudioGenerateRequest
) -> CandidateProfile:

    start_time = time.time()

    if not request.job.descriptionText.strip():
        raise ValueError("Job description cannot be empty.")

    logger.info(
        "[AI] Starting Resume Studio generation for job %s",
        request.job.id
    )

    try:
        prompt = build_resume_studio_prompt(request)

        result = structured_llm.invoke(prompt)

        if not isinstance(result, CandidateProfile):
            result = CandidateProfile.model_validate(result)

        logger.info(
            "[AI] Resume generated in %.2f seconds",
            time.time() - start_time
        )

        return result

    except Exception:
        logger.exception(
            "[AI] Resume Studio generation failed"
        )
        raise