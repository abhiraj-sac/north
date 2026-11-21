"""Rule-based extraction of the PROJECTS section from raw resume text.

Small local LLMs often skip or mangle projects (e.g. returning only the
GitHub URLs with no names). This parser reads the section directly so
projects written in the resume are never lost.
"""

import re

from app.schemas.candidate import CandidateProfile, Project

_SECTION_START = re.compile(
    r"^\s*(?:academic\s+|personal\s+|key\s+|selected\s+)?projects?\s*:?\s*$",
    re.IGNORECASE,
)
_BULLET = re.compile(r"^\s*[●•▪◦‣∙*\-–]\s+")
_TECH = re.compile(
    r"^\s*(?:tech(?:nologies)?|tech\s*stack|stack|built\s+with)\s*[:\-–]\s*(.+)$",
    re.IGNORECASE,
)
_URL = re.compile(r"https?://\S+|(?:github|gitlab)\.com/\S+", re.IGNORECASE)
_RESUME_MARKER = re.compile(r"^\s*=+\s*RESUME\s+\d+\s*=+\s*$", re.IGNORECASE)
_PAGE_MARKER = re.compile(r"^\s*--\s*\d+\s+of\s+\d+\s*--\s*$")


def _is_heading(line: str) -> bool:
    """A different section heading, e.g. CERTIFICATIONS or AWARDS & ACHIEVEMENTS."""
    text = line.strip()
    if not text or len(text) > 45 or _BULLET.match(text):
        return False
    letters = [c for c in text if c.isalpha()]
    return len(letters) >= 4 and all(c.isupper() for c in letters)


def _norm(text: str) -> str:
    text = text.lower().replace("&", "")
    return re.sub(r"[^a-z0-9]", "", text)


def _split_tech(value: str) -> list[str]:
    parts = re.split(r"\s*[·•|,;/]\s*|\s+•\s+", value)
    seen: list[str] = []
    for part in parts:
        part = part.strip(" .")
        if part and part.lower() not in (s.lower() for s in seen):
            seen.append(part)
    return seen


def _clean_title(line: str) -> tuple[str, str | None]:
    url_match = _URL.search(line)
    url = url_match.group(0).rstrip(").,") if url_match else None
    title = _URL.sub("", line)
    # Drop trailing date ranges / separators: "Name | 2024", "Name — Jan 2024"
    title = re.split(r"\s+[|—–]\s+", title)[0]
    return title.strip(" -–—|:"), url


def parse_projects(raw_text: str) -> list[Project]:
    projects: list[Project] = []
    in_section = False
    current: Project | None = None
    bullets: list[str] = []
    expecting_title = False

    def finish() -> None:
        nonlocal current, bullets
        if current is not None and current.name:
            current.contributions = bullets
            projects.append(current)
        current, bullets = None, []

    for line in raw_text.splitlines():
        if _RESUME_MARKER.match(line):
            finish()
            in_section = False
            continue
        if _PAGE_MARKER.match(line) or not line.strip():
            continue

        if _SECTION_START.match(line):
            finish()
            in_section = True
            expecting_title = True
            continue

        if not in_section:
            continue

        if _is_heading(line):
            finish()
            in_section = False
            continue

        tech = _TECH.match(line)
        if tech and current is not None:
            current.technologies = _split_tech(tech.group(1))
            finish()
            expecting_title = True
            continue

        if _BULLET.match(line):
            bullets.append(_BULLET.sub("", line).strip())
            expecting_title = False
            continue

        if expecting_title or current is None:
            finish()
            title, url = _clean_title(line)
            current = Project(name=title or None, project_url=url)
            expecting_title = False
            continue

        # Non-bullet line inside a project: wrapped bullet text.
        if bullets:
            bullets[-1] = f"{bullets[-1]} {line.strip()}"
        elif current is not None and not current.description:
            current.description = line.strip()

    finish()
    return projects


def _url_for(name: str, candidates: list[Project]) -> str | None:
    key = _norm(name)
    for candidate in candidates:
        url = candidate.project_url
        if url and key and key in _norm(url):
            return url
    return None


def merge_projects(profile: CandidateProfile, raw_text: str) -> CandidateProfile:
    """Use parsed projects when the LLM missed or left them nameless."""
    parsed = parse_projects(raw_text)
    if not parsed:
        return profile

    llm_projects = list(profile.projects)
    named = [p for p in llm_projects if p.name]
    if len(named) >= len(parsed):
        return profile

    merged: list[Project] = []
    seen: set[str] = set()
    for project in parsed:
        key = _norm(project.name or "")
        if not key or key in seen:
            continue
        seen.add(key)
        if not project.project_url:
            project.project_url = _url_for(project.name or "", llm_projects)
        merged.append(project)

    # Keep any LLM project with a real name that the parser did not find.
    for project in named:
        key = _norm(project.name or "")
        if key and key not in seen:
            seen.add(key)
            merged.append(project)

    profile.projects = merged
    return profile
