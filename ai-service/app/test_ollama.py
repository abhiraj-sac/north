
from langchain_ollama import ChatOllama

from app.schemas.candidate import CandidateProfile

llm = ChatOllama(
    model="qwen2.5:7b",
    temperature=0,
    num_predict=2048,
)

structured_llm = llm.with_structured_output(CandidateProfile)

sample_resume = """
John Doe
john@example.com
Delhi, India

Software Developer with 2 years of experience.

Skills:
Python, JavaScript, React, Node.js, PostgreSQL

Experience:
Software Developer at ABC Technologies
2023 - 2025
Built REST APIs and worked on database integration.

Education:
B.Tech in Computer Science
XYZ University
2023
"""


profile = structured_llm.invoke(
    f"""
    You are an accurate resume information extraction system.

    Extract ALL available information from the resume.

    IMPORTANT RULES:
    1. Read the entire resume before extracting information.
    2. Do not skip information explicitly mentioned.
    3. Extract the candidate's name from the resume heading.
    4. Extract every listed skill individually.
    5. For each experience, identify company, job title,
       duration, and responsibilities.
    6. Extract institution, degree, and graduation year.
    7. Never invent or assume information.
    8. Use null only when information is genuinely absent.
    9. Use empty lists only when no relevant information exists.
    10. Extract the candidate's name, email, and job title carefully.
    11. These fields may appear in headings or directly before experience details.
    12. Do not return null if the information is explicitly present.

    Resume:
    {sample_resume}
    """
)

print(profile.model_dump_json(indent=2))
