"""Fictional resume-example pages. Never presented as real people."""

from __future__ import annotations

EXAMPLES: list[dict] = []

_ROLES = [
    ("software-engineer", "Software Engineer", "classic-ats", "Build a parse-safe engineering resume that leads with shipped work."),
    ("frontend-developer", "Frontend Developer", "full-stack", "Show interface work with real technologies, not skill bars."),
    ("backend-developer", "Backend Developer", "systems-engineer", "Emphasise APIs, data stores and reliability."),
    ("full-stack-developer", "Full Stack Developer", "engineer-compact", "Balance product-facing work with backend depth."),
    ("data-scientist", "Data Scientist", "data-focused", "Methods, tools and outcomes — without inventing metrics."),
    ("data-analyst", "Data Analyst", "consulting-clean", "SQL, dashboards and stakeholder communication as text."),
    ("product-manager", "Product Manager", "corporate-formal", "Discovery, delivery and outcomes in a single column."),
    ("project-manager", "Project Manager", "leadership-banner", "Scope, stakeholders and delivery, not a Gantt screenshot."),
    ("ui-ux-designer", "UI/UX Designer", "sidebar-slate", "Case studies as text. Photos are usually unnecessary."),
    ("marketing-manager", "Marketing Manager", "board-ready", "Channels and results you can actually stand behind."),
    ("accountant", "Accountant", "finance-conservative", "Systems, close cycles and compliance in conservative type."),
    ("business-analyst", "Business Analyst", "consulting-clean", "Requirements, process and measurable process change."),
    ("cyber-security", "Cybersecurity Analyst", "security-analyst", "Certifications and incident work as plain text."),
    ("devops-engineer", "DevOps Engineer", "devops-split", "Platforms and pipelines without logo walls."),
    ("cloud-engineer", "Cloud Engineer", "cloud-architect", "Providers and IaC named only when you used them."),
    ("student", "Student", "education-first", "Coursework and projects can carry a first resume."),
    ("fresher", "Fresher", "fresher-compact", "Internships and projects beat an empty experience section."),
    ("internship", "Internship", "internship-ready", "One page. Lead with what you built."),
    ("teacher", "Teacher", "classic-professional", "Classroom impact as bullets, not graphics."),
    ("nurse", "Nurse", "classic-professional", "Licences and units as text. Follow local norms on photos."),
    ("mechanical-engineer", "Mechanical Engineer", "classic-ats", "CAD tools and projects listed as words."),
    ("electrical-engineer", "Electrical Engineer", "classic-ats", "Systems and tools without schematic images."),
    ("civil-engineer", "Civil Engineer", "classic-ats", "Projects and codes as text."),
    ("doctor", "Doctor", "classic-professional", "Credentials first. Follow local application norms."),
]


def _example(slug: str, title: str, template: str, headline: str) -> dict:
    return {
        "slug": slug,
        "title": f"{title} resume example",
        "headline": headline,
        "excerpt": f"A fictional sample structure for a {title.lower()} resume, plus ATS-conscious tips.",
        "body": (
            f"This page uses clearly fictional sample data to show a sensible {title.lower()} "
            "resume structure. It is not a real person's employment history.\n\n"
            "Recommended sections: contact, summary, experience or projects, skills as plain text, "
            "education, and certifications when relevant.\n\n"
            "Keep skills as words (Languages: Python, TypeScript) rather than bars or percentages. "
            "Use keywords from a real posting only when they describe work you actually did."
        ),
        "recommendedTemplates": [template, "classic-ats", "modern-ats"],
        "faqs": [
            {
                "question": f"What resume format is best for a {title.lower()}?",
                "answer": "A single-column layout with standard headings is the most reliable starting point.",
            },
            {
                "question": "Should I use a two-column resume?",
                "answer": "Some parsers read columns out of order. Prefer a single column for large employers.",
            },
            {
                "question": "Should I include a photo?",
                "answer": "In many markets, especially the US, photos are unnecessary and can create bias or parsing issues.",
            },
            {
                "question": "How many pages?",
                "answer": "Students and freshers usually stay on one page. Experienced professionals often need one or two.",
            },
        ],
        "atsTips": [
            "Use standard headings: Experience, Education, Skills.",
            "Export as a text-based PDF, not a screenshot.",
            "Do not put contact details only inside an image.",
            "Tailor keywords to each posting without stuffing.",
            "Quantify only results you can defend.",
        ],
    }


EXAMPLES.extend(_example(*row) for row in _ROLES)
EXAMPLE_BY_SLUG = {item["slug"]: item for item in EXAMPLES}
