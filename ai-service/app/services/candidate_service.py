
import os
import time
import logging

from dotenv import load_dotenv
from ai.llm_factory import get_structured_llm
from app.schemas.candidate import CandidateProfile
# from app.schemas.candidate_profile import CandidateProfile
from app.schemas.candidate import CandidateProfile


# ---------- CONFIGURATION ----------

load_dotenv()

logger = logging.getLogger(__name__)

# MODEL_NAME = os.getenv("GEMINI_MODEL")

# if not MODEL_NAME:
#     raise ValueError(
#         "GEMINI_MODEL is missing from environment variables."
#     )

# if not os.getenv("GOOGLE_API_KEY"):
#     raise ValueError(
#         "GOOGLE_API_KEY is missing from environment variables."
#     )


# ---------- GEMINI MODEL ----------

# llm = ChatGoogleGenerativeAI(
#     model=MODEL_NAME,
#     max_output_tokens=8192,
#     max_retries=2,
# )

# structured_llm = llm.with_structured_output(
#     CandidateProfile
# )


structured_llm = get_structured_llm(
    CandidateProfile
)

# ---------- CANDIDATE PROFILE PROMPT ----------

def build_candidate_prompt(raw_text: str) -> str:

    return f"""
You are NORTH's Candidate Profile Extraction Engine.

Your responsibility is to analyze one or multiple resumes
and create ONE accurate, unified Candidate Profile.

The input may contain content from 1, 2 or 3 resumes
belonging to the same candidate.

Your output MUST strictly follow the CandidateProfile schema.

==================================================
1. GENERAL EXTRACTION RULES
==================================================

1. Extract all explicitly available candidate information.
2. Never invent, assume or fabricate information.
3. Consolidate information belonging to the same candidate.
4. Remove duplicate skills, projects and experiences.
5. Preserve meaningful responsibilities and achievements.
6. Categorize technical skills correctly.
7. Preserve the original meaning of resume statements.
8. Use null for missing optional information.
9. Use empty lists when no items are available.
10. Do not confuse responsibilities with achievements.
11. Do not merge unrelated information.
12. Do not create information simply to fill empty fields.

==================================================
2. PERSONAL INFORMATION
==================================================

Extract:

- Full name
- Email
- Phone
- Location
- LinkedIn URL
- GitHub URL
- Portfolio URL

Do not infer missing contact information.

==================================================
3. PROFESSIONAL SUMMARY
==================================================

Extract the candidate's professional summary if present.

If no summary exists, return null.

Do not generate an imaginary professional history.

==================================================
4. TECHNICAL SKILLS
==================================================

Extract all explicitly mentioned technical skills.

Categorize them into:

- Programming languages
- Frameworks
- Databases
- Tools
- Cloud platforms
- Other skills

Important:

Global skills and experience-specific technologies
must remain separate.

For example:

If Python appears in the resume's technical skills
section, include it in global technical_skills.

Do NOT automatically associate Python with every
work experience or project.

Remove duplicate skill entries.

==================================================
5. WORK EXPERIENCE
==================================================

For each work experience, extract:

- Company
- Role
- Employment type
- Location
- Start date
- End date
- Current employment status
- Responsibilities
- Achievements
- Technologies

Rules:

1. Only include technologies explicitly connected
   to that particular work experience.

2. Do not copy the complete global skills list
   into every work experience.

3. Responsibilities describe what the candidate did.

4. Achievements describe measurable results,
   recognition or outcomes.

5. Do not convert unrelated competitive programming
   achievements into internship achievements.

6. Preserve dates as written in the resume.

7. Do not assume employment is current unless
   explicitly supported by the resume.

==================================================
6. PROJECTS
==================================================

For every identifiable project, extract:

- Project name
- Description
- Technologies
- Contributions
- Project URL

Rules:

1. Identify project names from headings,
   nearby descriptions and explicit references.

2. Preserve project descriptions and contributions.

3. Only include technologies explicitly associated
   with that project.

4. Do not leave the project name null when it is
   clearly identifiable in the resume.

5. A URL alone does not prove the project's name
   or functionality.

6. Do not invent project details from URL fragments.

7. Remove duplicate projects across resumes.

==================================================
7. EDUCATION
==================================================

Extract:

- Institution
- Degree
- Field of study
- Graduation year

Rules:

1. Do not duplicate degree and field of study
   unnecessarily.

2. Preserve the original degree title.

3. Do not infer graduation dates.

==================================================
8. CERTIFICATIONS
==================================================

Extract only actual certifications.

For each certification:

- Name
- Issuer
- Issue date
- Credential URL

Important:

GitHub, LeetCode, CodeChef and Medium profiles
are NOT certifications.

Do not classify ordinary profile links,
social accounts or coding platform accounts
as certifications.

==================================================
9. ACHIEVEMENTS
==================================================

Extract standalone achievements such as:

- Competitive programming achievements
- Coding problem counts
- Competition rankings
- Awards
- Publications
- Technical contributions
- Recognitions

Keep standalone achievements in the top-level
achievements section.

Do not associate an achievement with a particular
company unless the resume explicitly connects them.

Preserve numbers and metrics accurately.

==================================================
10. MULTIPLE RESUME CONSOLIDATION
==================================================

The input may contain multiple resumes.

Consolidate information belonging to the same candidate.

Remove duplicate:

- Work experiences
- Projects
- Skills
- Education records
- Certifications
- Achievements

Do not merge unrelated records simply because
they contain similar keywords.

==================================================
11. CONFLICT RESOLUTION
==================================================

The latest uploaded resume has priority.

When the same information conflicts across resumes:

1. Use the value from the latest uploaded resume.

2. If the latest resume does not mention a field,
   retain valid information from older resumes.

3. Do not combine conflicting values.

4. Do not assume the latest resume is more accurate
   for information it does not mention.

5. Preserve the source_resume_id wherever
   source metadata is available.

IMPORTANT:

The input must contain resume metadata such as
resume_id, filename and uploaded_at for reliable
latest-resume identification.

If metadata is missing, do not guess which resume
is the latest.

==================================================
12. ACCURACY REQUIREMENTS
==================================================

1. Every extracted fact must be supported by
   the provided resume text.

2. Do not infer technologies from job titles.

3. Do not invent project names.

4. Do not invent employment dates.

5. Do not invent certifications.

6. Do not convert responsibilities into achievements.

7. Do not associate global skills with a particular
   company without supporting evidence.

8. Preserve meaningful technical details.

9. Avoid unnecessary repetition.

10. Missing information must remain missing.

==================================================
FINAL INSTRUCTION
==================================================

Generate one unified Candidate Profile.

Return data strictly according to the CandidateProfile
Pydantic schema.

Do not return explanations or commentary.

Do not invent missing information.

==================================================
RAW RESUME TEXT
==================================================

{raw_text}
"""


# ---------- PROFILE GENERATION ----------

def generate_candidate_profile(
    raw_text: str
) -> CandidateProfile:

    if not raw_text or not raw_text.strip():
        raise ValueError("Resume text cannot be empty.")

    start_time = time.time()

    logger.info(
        "[AI] Starting candidate profile generation."
    )

    logger.info(
        "[AI] Input text length: %s characters",
        len(raw_text)
    )

    try:

        prompt = build_candidate_prompt(raw_text)

        result = structured_llm.invoke(prompt)

        elapsed = time.time() - start_time

        logger.info(
            "[AI] Candidate profile generated successfully "
            "in %.2f seconds.",
            elapsed
        )

        if not isinstance(result, CandidateProfile):
            result = CandidateProfile.model_validate(result)

        return result

    except Exception:

        elapsed = time.time() - start_time

        logger.exception(
            "[AI] Candidate profile generation failed "
            "after %.2f seconds.",
            elapsed
        )

        raise
