from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import BlogPost

POSTS = [
    {
        "slug": "how-ats-resume-screening-works",
        "title": "How ATS resume screening works",
        "excerpt": "Applicant tracking systems parse text, map sections and score keywords. Here is what that actually means for your file.",
        "category": "ATS",
        "tags": ["ats", "parsing"],
        "content": """Applicant tracking systems are software. They extract text from a PDF or DOCX, try to label sections, and match terms against a job posting.

They do not all behave the same way. Some read columns out of order. Some ignore headers. Some drop text that lives only inside an image.

That is why ResumeForge scores are estimates, not guarantees. A high score means your file follows patterns that many parsers handle well: a single column, standard headings, selectable text and keywords used in context.

What helps most parsers:
- A name and email in plain text at the top
- Headings such as Experience, Education and Skills
- Skills written as words, not bars
- A text-based PDF export

What often hurts:
- Contact details inside a logo
- Tables used as a layout grid
- Skill percentages
- Keyword dumps that do not match real work
""",
    },
    {
        "slug": "how-to-make-an-ats-friendly-resume",
        "title": "How to make an ATS-friendly resume",
        "excerpt": "A practical checklist: layout, headings, fonts and exports that stay readable after parsing.",
        "category": "ATS",
        "tags": ["ats", "formatting"],
        "content": """Start with a single column. Put your name, title and email as real text. Use conventional section titles.

Write skills as categories of words:

Languages: Python, TypeScript
Frameworks: React, FastAPI

Export a PDF with selectable text. Open the file and try to highlight a sentence. If you cannot, a parser probably cannot either.

Do not claim a file is guaranteed to pass an ATS. Different employers run different software.
""",
    },
    {
        "slug": "resume-keywords-how-to-use-them",
        "title": "Resume keywords: how to use them",
        "excerpt": "Match the language of the posting without stuffing terms you cannot discuss.",
        "category": "Writing",
        "tags": ["keywords", "job-match"],
        "content": """Read the posting once for required skills and once for preferred ones. Add a term only if it describes work you did.

Good placement:
- Skills, when it is a tool you use
- Experience bullets, when you used it to ship something
- Projects, when the work lived there

Poor placement:
- A comma-separated dump at the bottom
- Repeating the same word in every bullet
- Adding a cloud provider you have not used

If you lack a metric, write the work plainly. Inventing a percentage is worse than omitting it.
""",
    },
    {
        "slug": "how-to-write-resume-bullet-points",
        "title": "How to write resume bullet points",
        "excerpt": "Action + task + method + result — using only facts you can defend.",
        "category": "Writing",
        "tags": ["bullets", "writing"],
        "content": """A useful formula is: action + task + method + result.

Example: Developed a FastAPI backend for an internal tool, reducing response time by 30%.

Use the 30% only if it is real. If you do not have a number, stop after the method.

Replace "Responsible for website development" with "Developed and maintained a React application used by the operations team."

Lead with a verb. Keep most bullets to one or two lines.
""",
    },
    {
        "slug": "resume-mistakes-that-hurt-ats-compatibility",
        "title": "Resume mistakes that hurt ATS compatibility",
        "excerpt": "Graphics, headers, unusual fonts and image-only PDFs are common reasons a file parses poorly.",
        "category": "ATS",
        "tags": ["ats", "mistakes"],
        "content": """The most common problems we see:

1. Important text inside images
2. Two-column layouts parsed in the wrong order
3. Skill bars instead of words
4. Decorative fonts that do not embed
5. Headers and footers that some parsers skip
6. Tables used only for visual grid layout

Fix the critical issues first: name, email and extractable body text. Then improve keywords against a real posting.
""",
    },
    {
        "slug": "best-resume-format-for-software-engineers",
        "title": "Best resume format for software engineers",
        "excerpt": "A single-column, skills-as-text format that still leaves room for projects and stack.",
        "category": "Engineering",
        "tags": ["software", "templates"],
        "content": """For most engineering applications, start with Classic ATS or Modern ATS. Put the stack in a Technical Skills section as words. Follow with experience bullets that name the systems you actually used.

Projects belong on the page when they are stronger than internships or when the posting cares about a specific stack.

Avoid logo walls. A parser cannot read a Docker whale.
""",
    },
    {
        "slug": "resume-for-freshers",
        "title": "Resume for freshers",
        "excerpt": "When you have little job history, projects, internships and coursework can still parse cleanly.",
        "category": "Early career",
        "tags": ["fresher", "student"],
        "content": """A first resume is usually one page. Lead with education, projects and internships. A short objective is fine if it names the role you want.

Do not invent job titles. A campus project with a real tech stack is more useful than a vague "team member" line.

Keep skills honest. If you completed a tutorial, say so in coursework rather than listing the tool as production experience.
""",
    },
    {
        "slug": "resume-for-software-engineers",
        "title": "Resume for software engineers",
        "excerpt": "What to include, what to cut, and how to tailor a base resume for each posting.",
        "category": "Engineering",
        "tags": ["software"],
        "content": """Keep a base resume, then duplicate it for each application. Change the summary and the skill emphasis so they reflect the posting — without adding tools you have not used.

Two pages are acceptable when the second page is recent, relevant work. Age of a project matters less than whether you can discuss it.

Check the file after export: selectable text, working links, and no clipped headings.
""",
    },
    {
        "slug": "how-many-pages-should-a-resume-be",
        "title": "How many pages should a resume be?",
        "excerpt": "Students usually need one page. Experienced professionals often need one or two. Do not shrink type to cheat.",
        "category": "Writing",
        "tags": ["length"],
        "content": """There is no universal page law. Recruiters skim. Parsers do not care about page count as much as extractable text.

Guidance:
- Students and freshers: usually one page
- Mid-level: one page if it stays specific, two if the second page earns its space
- Senior and academic: two pages is common

Do not drop below a readable font size to force a page count.
""",
    },
    {
        "slug": "should-you-put-a-photo-on-your-resume",
        "title": "Should you put a photo on your resume?",
        "excerpt": "In many markets a photo is unnecessary and can create parsing or bias issues.",
        "category": "ATS",
        "tags": ["photos", "ats"],
        "content": """For many professional applications, especially in the US and similar markets, photos are generally unnecessary and can create compatibility or bias concerns. Follow local industry norms.

If a posting or a country's convention requires a photo, keep it out of the ATS-first template and confirm the file still extracts your name and email as text.
""",
    },
]


def seed_blog(db: Session) -> str:
    created = 0
    updated = 0
    now = datetime.now(timezone.utc)
    for item in POSTS:
        row = db.scalar(select(BlogPost).where(BlogPost.slug == item["slug"]))
        values = {
            "title": item["title"],
            "excerpt": item["excerpt"],
            "content": item["content"],
            "category": item["category"],
            "tags": item["tags"],
            "author": "ResumeForge Team",
            "is_published": True,
            "published_at": now,
            "seo_title": item["title"],
            "seo_description": item["excerpt"],
            "reading_minutes": max(3, len(item["content"].split()) // 180),
        }
        if row is None:
            db.add(BlogPost(slug=item["slug"], **values))
            created += 1
        else:
            for key, value in values.items():
                setattr(row, key, value)
            updated += 1
    db.commit()
    return f"{created} created, {updated} updated"
