"""Keyword extraction and weighted matching.

Scores are never "count every repeated word". Technical skills and required
qualifications weigh more than soft skills; generic words and stopwords are
ignored. Related terms (React/React.js) are collapsed so a resume that says
"React" matches a posting that says "React.js".
"""

from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass, field

STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "if", "then", "else", "when", "at", "by",
    "for", "with", "about", "against", "between", "into", "through", "during",
    "before", "after", "above", "below", "to", "from", "up", "down", "in", "out",
    "on", "off", "over", "under", "again", "further", "once", "here", "there",
    "all", "any", "both", "each", "few", "more", "most", "other", "some", "such",
    "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "can",
    "will", "just", "should", "now", "you", "your", "we", "our", "they", "their",
    "this", "that", "these", "those", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "of", "as", "it", "its",
    "he", "she", "him", "her", "who", "whom", "what", "which", "where", "why",
    "how", "using", "used", "use", "including", "across", "within", "via",
    "etc", "eg", "ie", "per", "able", "also", "well", "good", "strong", "new",
    "work", "working", "team", "role", "job", "position", "candidate", "ability",
    "experience", "years", "year", "plus", "must", "required", "preferred",
    "looking", "join", "company", "opportunity", "responsibilities", "requirement",
    "requirements", "qualification", "qualifications", "benefit", "benefits",
}

# Phrase -> (canonical, category, weight 0-1). Longer phrases are matched first.
LEXICON: list[tuple[str, str, str, float]] = [
    # Languages
    ("typescript", "TypeScript", "technology", 1.0),
    ("javascript", "JavaScript", "technology", 1.0),
    ("python", "Python", "technology", 1.0),
    ("java", "Java", "technology", 0.95),
    ("golang", "Go", "technology", 0.95),
    ("rust", "Rust", "technology", 0.9),
    ("c++", "C++", "technology", 0.95),
    ("c#", "C#", "technology", 0.95),
    ("kotlin", "Kotlin", "technology", 0.9),
    ("swift", "Swift", "technology", 0.9),
    ("ruby", "Ruby", "technology", 0.85),
    ("php", "PHP", "technology", 0.85),
    ("scala", "Scala", "technology", 0.8),
    ("r language", "R", "technology", 0.8),
    ("sql", "SQL", "technology", 0.95),
    ("html", "HTML", "technology", 0.7),
    ("css", "CSS", "technology", 0.7),
    # Frameworks / libraries
    ("react.js", "React", "technology", 1.0),
    ("reactjs", "React", "technology", 1.0),
    ("react", "React", "technology", 1.0),
    ("next.js", "Next.js", "technology", 0.95),
    ("nextjs", "Next.js", "technology", 0.95),
    ("vue.js", "Vue", "technology", 0.9),
    ("vue", "Vue", "technology", 0.85),
    ("angular", "Angular", "technology", 0.9),
    ("svelte", "Svelte", "technology", 0.8),
    ("node.js", "Node.js", "technology", 1.0),
    ("nodejs", "Node.js", "technology", 1.0),
    ("fastapi", "FastAPI", "technology", 1.0),
    ("django", "Django", "technology", 0.95),
    ("flask", "Flask", "technology", 0.85),
    ("spring boot", "Spring Boot", "technology", 0.95),
    ("express.js", "Express", "technology", 0.85),
    ("express", "Express", "technology", 0.75),
    ("nestjs", "NestJS", "technology", 0.85),
    ("graphql", "GraphQL", "technology", 0.9),
    ("rest api", "REST APIs", "technology", 0.9),
    ("restful", "REST APIs", "technology", 0.85),
    ("tailwind", "Tailwind CSS", "technology", 0.75),
    ("redux", "Redux", "technology", 0.75),
    # Data
    ("postgresql", "PostgreSQL", "technology", 0.95),
    ("postgres", "PostgreSQL", "technology", 0.95),
    ("mysql", "MySQL", "technology", 0.85),
    ("mongodb", "MongoDB", "technology", 0.9),
    ("redis", "Redis", "technology", 0.9),
    ("elasticsearch", "Elasticsearch", "technology", 0.85),
    ("snowflake", "Snowflake", "technology", 0.85),
    ("bigquery", "BigQuery", "technology", 0.85),
    ("spark", "Apache Spark", "technology", 0.9),
    ("hadoop", "Hadoop", "technology", 0.75),
    ("pandas", "Pandas", "technology", 0.85),
    ("numpy", "NumPy", "technology", 0.8),
    ("scikit-learn", "scikit-learn", "technology", 0.85),
    ("tensorflow", "TensorFlow", "technology", 0.9),
    ("pytorch", "PyTorch", "technology", 0.9),
    ("keras", "Keras", "technology", 0.75),
    # Cloud / DevOps
    ("amazon web services", "AWS", "technology", 1.0),
    ("aws", "AWS", "technology", 1.0),
    ("azure", "Azure", "technology", 0.95),
    ("gcp", "GCP", "technology", 0.95),
    ("google cloud", "GCP", "technology", 0.95),
    ("kubernetes", "Kubernetes", "technology", 1.0),
    ("k8s", "Kubernetes", "technology", 1.0),
    ("docker", "Docker", "technology", 1.0),
    ("terraform", "Terraform", "technology", 0.95),
    ("ansible", "Ansible", "technology", 0.8),
    ("github actions", "GitHub Actions", "technology", 0.85),
    ("gitlab ci", "GitLab CI", "technology", 0.8),
    ("jenkins", "Jenkins", "technology", 0.8),
    ("ci/cd", "CI/CD", "technology", 0.9),
    ("linux", "Linux", "technology", 0.8),
    ("nginx", "NGINX", "technology", 0.7),
    # Tools
    ("git", "Git", "tool", 0.7),
    ("jira", "Jira", "tool", 0.6),
    ("figma", "Figma", "tool", 0.75),
    ("tableau", "Tableau", "tool", 0.85),
    ("power bi", "Power BI", "tool", 0.85),
    ("excel", "Excel", "tool", 0.55),
    ("salesforce", "Salesforce", "tool", 0.85),
    # Certifications
    ("aws certified", "AWS Certified", "certification", 0.95),
    ("pmp", "PMP", "certification", 0.9),
    ("cissp", "CISSP", "certification", 0.95),
    ("cka", "CKA", "certification", 0.9),
    ("comptia", "CompTIA", "certification", 0.8),
    # Methodologies
    ("agile", "Agile", "methodology", 0.5),
    ("scrum", "Scrum", "methodology", 0.5),
    ("kanban", "Kanban", "methodology", 0.4),
    ("tdd", "TDD", "methodology", 0.55),
    ("microservices", "Microservices", "methodology", 0.75),
    ("system design", "System design", "methodology", 0.7),
    # Soft skills (lower weight)
    ("communication", "Communication", "soft-skill", 0.25),
    ("leadership", "Leadership", "soft-skill", 0.3),
    ("collaboration", "Collaboration", "soft-skill", 0.25),
    ("problem solving", "Problem solving", "soft-skill", 0.3),
    ("stakeholder management", "Stakeholder management", "soft-skill", 0.4),
    ("mentoring", "Mentoring", "soft-skill", 0.35),
    # Titles
    ("software engineer", "Software Engineer", "job-title", 0.7),
    ("frontend developer", "Frontend Developer", "job-title", 0.7),
    ("backend developer", "Backend Developer", "job-title", 0.7),
    ("full stack", "Full Stack Developer", "job-title", 0.7),
    ("data scientist", "Data Scientist", "job-title", 0.7),
    ("data analyst", "Data Analyst", "job-title", 0.7),
    ("product manager", "Product Manager", "job-title", 0.7),
    ("project manager", "Project Manager", "job-title", 0.65),
    ("devops engineer", "DevOps Engineer", "job-title", 0.7),
    ("site reliability", "SRE", "job-title", 0.65),
]

LEXICON.sort(key=lambda row: len(row[0]), reverse=True)

RELATED: dict[str, list[str]] = {
    "React": ["React.js", "Next.js", "Redux"],
    "TypeScript": ["JavaScript"],
    "JavaScript": ["TypeScript"],
    "AWS": ["GCP", "Azure", "Terraform"],
    "Docker": ["Kubernetes", "CI/CD"],
    "Kubernetes": ["Docker", "Terraform"],
    "PostgreSQL": ["SQL", "MySQL"],
    "Python": ["FastAPI", "Django", "Pandas"],
    "FastAPI": ["Python", "REST APIs"],
}

WORD_RE = re.compile(r"[A-Za-z][A-Za-z0-9.+#/-]{1,40}")
REQUIRED_HINTS = re.compile(
    r"\b(required|must have|must-have|you will|you must|minimum|essential)\b",
    re.I,
)
PREFERRED_HINTS = re.compile(r"\b(preferred|nice to have|nice-to-have|bonus|plus)\b", re.I)


@dataclass
class Keyword:
    term: str
    category: str
    weight: float
    count: int = 1
    required: bool = False
    locations: list[str] = field(default_factory=list)
    related: list[str] = field(default_factory=list)

    def as_dict(self, resume_count: int = 0, job_count: int = 0) -> dict:
        return {
            "term": self.term,
            "category": self.category,
            "weight": round(self.weight, 3),
            "resumeCount": resume_count,
            "jobCount": job_count or self.count,
            "locations": self.locations,
            "related": self.related or RELATED.get(self.term, []),
        }


def _normalise(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").lower())


def extract_keywords(text: str, *, source: str = "job") -> list[Keyword]:
    """Extract weighted keywords from a job description or resume blob."""
    blob = _normalise(text)
    if not blob:
        return []

    found: dict[str, Keyword] = {}
    remaining = blob
    for phrase, canonical, category, weight in LEXICON:
        matches = len(re.findall(rf"(?<![a-z0-9]){re.escape(phrase)}(?![a-z0-9])", remaining))
        if not matches:
            continue
        remaining = re.sub(rf"(?<![a-z0-9]){re.escape(phrase)}(?![a-z0-9])", " ", remaining)
        required = bool(REQUIRED_HINTS.search(blob)) and category in {
            "technology",
            "certification",
            "job-title",
        }
        if category == "soft-skill":
            required = False
        found[canonical] = Keyword(
            term=canonical,
            category=category,
            weight=weight + (0.15 if required and source == "job" else 0),
            count=matches,
            required=required,
        )

    # Catch leftover domain terms that look like tools (capitalised in original).
    leftovers = Counter(
        token
        for token in WORD_RE.findall(remaining)
        if token not in STOPWORDS and len(token) > 2 and not token.isdigit()
    )
    for token, count in leftovers.most_common(12):
        if token in found or count < 2:
            continue
        # Repeated uncommon tokens in a JD are often domain terms.
        if source == "job" and count >= 2:
            label = token.upper() if token in {"api", "ui", "ux", "ml", "ai"} else token.title()
            found[label] = Keyword(term=label, category="domain", weight=0.35, count=count)

    return sorted(found.values(), key=lambda item: (-item.weight, -item.count, item.term))


def locate_term(term: str, text_by_section: dict[str, str]) -> list[str]:
    needle = term.lower()
    hits: list[str] = []
    for section, body in text_by_section.items():
        if needle in body.lower():
            hits.append(section)
    return hits


def match_keywords(
    resume_text: str,
    job_keywords: list[Keyword],
    text_by_section: dict[str, str] | None = None,
) -> tuple[list[dict], list[dict], float]:
    """Return (matched, missing, 0-100 weighted coverage)."""
    haystack = _normalise(resume_text)
    matched: list[dict] = []
    missing: list[dict] = []
    earned = 0.0
    possible = 0.0

    for keyword in job_keywords:
        possible += keyword.weight
        present = keyword.term.lower() in haystack or any(
            alias.lower() in haystack for alias in RELATED.get(keyword.term, [])
        )
        locations = locate_term(keyword.term, text_by_section or {})
        payload = keyword.as_dict(
            resume_count=1 if present else 0,
            job_count=keyword.count,
        )
        payload["locations"] = locations
        if present:
            earned += keyword.weight
            matched.append(payload)
        else:
            missing.append(payload)

    score = 100.0 if possible == 0 else 100.0 * earned / possible
    return matched, missing, round(min(100.0, score), 1)


def related_suggestions(missing: list[dict], matched_terms: set[str]) -> list[dict]:
    suggestions: list[dict] = []
    seen: set[str] = set()
    for item in missing:
        for related in RELATED.get(item["term"], []):
            if related in matched_terms or related in seen:
                continue
            seen.add(related)
            suggestions.append(
                {
                    "term": related,
                    "category": "related",
                    "weight": 0.4,
                    "resumeCount": 0,
                    "jobCount": 0,
                    "locations": [],
                    "related": [item["term"]],
                }
            )
    return suggestions[:8]
