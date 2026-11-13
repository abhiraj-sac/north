
import profile

from langchain_ollama import ChatOllama
from app.schemas.candidate import CandidateProfile


llm = ChatOllama(
    model="qwen2.5:7b",
    temperature=0,
    num_predict=2048,
)

structured_llm = llm.with_structured_output(CandidateProfile)


def extract_profile(resume_text: str) -> CandidateProfile:
    return structured_llm.invoke(
        f"""
        Extract a candidate profile from the resume.

        Rules:
        - Extract all explicitly available information.
        - Never invent missing information.
        - Do not duplicate experiences, skills, or education.
        - Keep each experience separate.
        - Use null for missing scalar fields.
        - Use empty lists for missing collections.
        - Preserve dates and names accurately.
        COMPANY EXTRACTION RULES:
        - In phrases like "Backend Developer at Company A",
        the text after "at" is the company name.
        - Extract the company name for every experience separately.
        - Never return null when a company name is explicitly present.
        - Do not merge multiple experiences.

        Resume:
        {resume_text}
        """
    )


def test_complete_resume():
    resume = """
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

    profile = extract_profile(resume)

    assert profile.full_name == "John Doe"
    assert profile.email == "john@example.com"
    assert len(profile.skills) == 5
    assert len(profile.experience) == 1
    assert profile.experience[0].role == "Software Developer"


def test_missing_information():
    resume = """
    Jane Smith

    Skills:
    Python, SQL

    Experience:
    Data Analyst at ABC Ltd.
    2022 - 2024
    Analyzed business data.
    """

    profile = extract_profile(resume)

    assert profile.full_name == "Jane Smith"
    assert profile.phone is None
    assert profile.education == []
    assert profile.certifications == []


def test_multiple_experiences():
    resume = """
    Alex Brown

   Experience:

    Company: Company A
    Role: Backend Developer
    Duration: 2020 - 2022
    Responsibilities:
    - Developed APIs

    Company: Company B
    Role: Senior Backend Developer
    Duration: 2022 - 2025
    Responsibilities:
- Designed backend architecture
    """

    profile = extract_profile(resume)

    print("\n--- ACTUAL MODEL OUTPUT ---")
    print(profile.model_dump_json(indent=2))

    assert len(profile.experience) == 2
