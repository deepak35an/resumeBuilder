"""Modular ATS scoring engine.

Weights are configurable. Scores are heuristics, never a guarantee of how any
specific applicant tracking system will parse or rank a resume.
"""

from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.models import ATSReport, Resume
from app.services.keyword_service import (
    extract_keywords,
    match_keywords,
    related_suggestions,
)
from app.services.resume_text import extract_facts

DISCLAIMER = (
    "ATS scores are estimates. Different applicant tracking systems use different "
    "parsing and ranking methods."
)

DEFAULT_WEIGHTS = {
    "formatting": 0.20,
    "keywords": 0.30,
    "content": 0.20,
    "experience": 0.15,
    "skills": 0.10,
    "completeness": 0.05,
}

WEAK_OPENERS = (
    "responsible for",
    "duties included",
    "helped with",
    "worked on",
    "involved in",
    "tasked with",
    "assisted with",
)
PASSIVE = re.compile(r"\b(was|were|been|being)\s+\w+ed\b", re.I)
METRIC = re.compile(r"\d")
TWO_COLUMN_TEMPLATES = {
    "tech-skills-forward",
    "sidebar-slate",
    "professional-split",
    "clean-sidebar",
    "bold-header",
}

ACTION_VERBS = {
    "developed", "built", "designed", "implemented", "led", "managed",
    "optimized", "automated", "delivered", "launched", "improved", "created",
    "analyzed", "architected", "migrated", "reduced", "increased",
}


def _band(score: int) -> tuple[str, str]:
    if score >= 90:
        return "excellent", "Excellent"
    if score >= 75:
        return "good", "Good"
    if score >= 60:
        return "needs-improvement", "Needs Improvement"
    return "needs-major-improvement", "Needs Major Improvement"


def _issue(
    id_: str,
    *,
    severity: str,
    status: str,
    category: str,
    title: str,
    detail: str,
    action: dict | None = None,
    before: str | None = None,
    after: str | None = None,
    why: str | None = None,
) -> dict:
    payload = {
        "id": id_,
        "severity": severity,
        "status": status,
        "category": category,
        "title": title,
        "detail": detail,
    }
    if action:
        payload["action"] = action
    if before:
        payload["before"] = before
    if after:
        payload["after"] = after
    if why:
        payload["why"] = why
    return payload


def _score_formatting(data: dict, settings: dict, template_id: str) -> tuple[int, list[dict], list[dict]]:
    issues: list[dict] = []
    strengths: list[dict] = []
    score = 94

    layout_two_col = template_id in TWO_COLUMN_TEMPLATES or "sidebar" in template_id
    if layout_two_col:
        score -= 12
        issues.append(
            _issue(
                "two-column",
                severity="medium",
                status="warning",
                category="formatting",
                title="Two-column or sidebar layout",
                detail=(
                    "Some older parsers read columns out of order. A single-column "
                    "ATS template is the safer default for large employers."
                ),
                action={
                    "kind": "switch-template",
                    "label": "Switch to Classic ATS",
                    "payload": {"templateId": "classic-ats"},
                },
            )
        )
    else:
        strengths.append(
            _issue(
                "single-column",
                severity="low",
                status="good",
                category="formatting",
                title="Single-column layout",
                detail="A single reading order is the most reliable structure for most parsers.",
            )
        )

    font = str(settings.get("fontFamily") or settings.get("font_family") or "")
    if font and font.lower() not in {
        "arial", "helvetica", "georgia", "times new roman", "calibri", "inter", "garamond",
    }:
        score -= 6
        issues.append(
            _issue(
                "font",
                severity="low",
                status="warning",
                category="formatting",
                title="Uncommon font family",
                detail="ATS-oriented templates stay with Arial, Calibri, Georgia, Times or Inter.",
            )
        )

    size = float(settings.get("fontSize") or settings.get("font_size") or 10.5)
    if size < 9:
        score -= 10
        issues.append(
            _issue(
                "tiny-font",
                severity="high",
                status="warning",
                category="formatting",
                title="Font size is below 9pt",
                detail="Very small type can be dropped or misread. Keep body text at 10–11pt.",
            )
        )

    if settings.get("showIcons") or settings.get("show_icons"):
        score -= 8
        issues.append(
            _issue(
                "icons",
                severity="medium",
                status="warning",
                category="formatting",
                title="Icons enabled",
                detail="Decorative icons next to contact details can confuse parsers. Prefer plain text links.",
            )
        )

    strengths.append(
        _issue(
            "text-only",
            severity="low",
            status="good",
            category="formatting",
            title="Standard section headings",
            detail="Sections use conventional labels such as Experience, Education and Skills.",
        )
    )
    return max(0, min(100, score)), issues, strengths


def _score_content(facts) -> tuple[int, list[dict], list[dict]]:
    issues: list[dict] = []
    strengths: list[dict] = []
    score = 70

    words = len(facts.summary_text.split())
    if words == 0:
        issues.append(
            _issue(
                "no-summary",
                severity="medium",
                status="warning",
                category="content",
                title="No professional summary",
                detail="A 3–5 line summary helps both humans and keyword scans understand your focus.",
                action={"kind": "edit-section", "label": "Write a summary", "payload": {"section": "summary"}},
            )
        )
        score -= 12
    elif words < 20:
        issues.append(
            _issue(
                "short-summary",
                severity="low",
                status="warning",
                category="content",
                title="Summary is quite short",
                detail="Aim for 40–80 words that name your role, strengths and the environments you work in.",
            )
        )
        score -= 4
    elif words > 140:
        issues.append(
            _issue(
                "long-summary",
                severity="low",
                status="warning",
                category="content",
                title="Summary is longer than recommended",
                detail="A concise summary is easier to scan. Cut generic adjectives first.",
            )
        )
        score -= 4
    else:
        score += 8
        strengths.append(
            _issue(
                "summary-ok",
                severity="low",
                status="good",
                category="content",
                title="Summary length looks right",
                detail="The summary is long enough to be specific without filling the page.",
            )
        )

    weak = [b for b in facts.bullets if any(b.lower().startswith(w) for w in WEAK_OPENERS)]
    if weak:
        sample = weak[0]
        improved = re.sub(
            r"^(Responsible for|Duties included|Helped with|Worked on|Involved in|Tasked with|Assisted with)\s+",
            "Delivered ",
            sample,
            flags=re.I,
        )
        issues.append(
            _issue(
                "weak-verbs",
                severity="medium",
                status="warning",
                category="content",
                title="Some bullets start with a weak phrase",
                detail=f'{len(weak)} bullet(s) open with phrasing such as "responsible for". Lead with a verb instead.',
                action={"kind": "improve-bullet", "label": "Improve bullet", "payload": {"text": sample}},
                before=sample,
                after=improved,
                why="A stronger action verb makes the same work easier to scan and score.",
            )
        )
        score -= min(16, 4 * len(weak))
    else:
        if facts.bullets:
            score += 8
            strengths.append(
                _issue(
                    "action-verbs",
                    severity="low",
                    status="good",
                    category="content",
                    title="Bullets lead with action",
                    detail="Most bullets start with a verb rather than a duty statement.",
                )
            )

    if facts.bullets:
        with_metrics = sum(1 for b in facts.bullets if METRIC.search(b))
        if with_metrics == 0:
            issues.append(
                _issue(
                    "no-metrics",
                    severity="medium",
                    status="warning",
                    category="content",
                    title="No measurable results yet",
                    detail=(
                        "Consider adding a measurable result if you have one. "
                        "Do not invent numbers."
                    ),
                )
            )
            score -= 8
        else:
            score += 8

    long_bullets = [b for b in facts.bullets if len(b.split()) > 40]
    if long_bullets:
        issues.append(
            _issue(
                "long-bullets",
                severity="low",
                status="warning",
                category="content",
                title="A few bullets are very long",
                detail="Keep most bullets to one or two lines so they survive both parsers and skimming.",
            )
        )
        score -= 4

    passive = [b for b in facts.bullets if PASSIVE.search(b)]
    if len(passive) >= 2:
        issues.append(
            _issue(
                "passive",
                severity="low",
                status="warning",
                category="content",
                title="Passive voice appears in several bullets",
                detail="Active voice is easier to parse and usually shorter.",
            )
        )
        score -= 4

    return max(0, min(100, score)), issues, strengths


def _score_experience(facts) -> tuple[int, list[dict]]:
    issues: list[dict] = []
    if facts.experience_count == 0 and facts.project_count == 0:
        issues.append(
            _issue(
                "no-experience",
                severity="high",
                status="warning",
                category="experience",
                title="No experience or projects listed",
                detail="Add internships, projects or coursework so the resume is not just a skills list.",
                action={"kind": "add-section", "label": "Add a project", "payload": {"section": "projects"}},
            )
        )
        return 35, issues
    score = 60
    if facts.experience_count:
        score += min(25, facts.experience_count * 8)
    if facts.project_count:
        score += min(15, facts.project_count * 5)
    if facts.experience_months >= 12:
        score += 8
    if facts.bullets:
        score += 5
    else:
        issues.append(
            _issue(
                "no-bullets",
                severity="high",
                status="warning",
                category="experience",
                title="Roles have no achievement bullets",
                detail="List what you shipped, not just the job title.",
            )
        )
        score -= 15
    return max(0, min(100, score)), issues


def _score_skills(facts) -> tuple[int, list[dict]]:
    issues: list[dict] = []
    count = len({s.lower() for s in facts.skills + facts.technologies})
    if count == 0:
        issues.append(
            _issue(
                "no-skills",
                severity="high",
                status="warning",
                category="keywords",
                title="No skills listed",
                detail="Add a plain-text skills section grouped by category. Avoid skill bars.",
                action={"kind": "edit-section", "label": "Add skills", "payload": {"section": "technical-skills"}},
            )
        )
        return 20, issues
    score = min(100, 50 + count * 4)
    if count > 40:
        issues.append(
            _issue(
                "skill-stuffing",
                severity="low",
                status="warning",
                category="keywords",
                title="Skills list is very long",
                detail="Keep skills you can discuss. Keyword stuffing is easy to spot and does not help.",
            )
        )
        score -= 10
    return score, issues


def _completeness(facts) -> tuple[int, list[dict], list[dict]]:
    rows: list[dict] = []
    score = 0

    checks = [
        ("contact", "Contact information", facts.has_name and facts.has_email, True, 25),
        ("summary", "Summary", bool(facts.summary_text.strip()), True, 15),
        ("experience", "Experience", facts.experience_count > 0, False, 20),
        ("skills", "Skills", bool(facts.skills or facts.technologies), True, 15),
        ("education", "Education", facts.education_count > 0, True, 15),
        ("projects", "Projects", facts.project_count > 0, False, 5),
        ("certifications", "Certifications", facts.certification_count > 0, False, 5),
    ]
    for key, label, present, required, points in checks:
        if present:
            score += points
            status = "good"
            detail = "Present."
        elif required:
            status = "warning"
            detail = "Missing — most applications expect this."
        else:
            status = "optional"
            detail = "Optional, useful when relevant."
        rows.append(
            {
                "key": key,
                "label": label,
                "present": present,
                "status": status,
                "detail": detail,
            }
        )
        if required and not present:
            rows[-1]["status"] = "critical" if key == "contact" else "warning"

    if facts.has_name and facts.has_email:
        pass
    else:
        # Contact is critical for ATS extraction.
        pass

    return min(100, score), rows, []


def _education_score(facts) -> int:
    if facts.education_count == 0:
        return 55
    return min(100, 70 + facts.education_count * 10)


def _headline(overall: int, keyword_score: int, formatting_score: int, has_job: bool) -> str:
    if has_job and keyword_score < 70:
        return "Your resume is structured clearly but is missing several keywords from the job description."
    if formatting_score >= 90 and overall >= 85:
        return "Strong structure and content. A few targeted edits would tighten the match further."
    if overall >= 75:
        return "A solid resume. Improve weaker bullets and confirm keywords match the roles you want."
    if overall >= 60:
        return "The foundation is there, but formatting or missing sections are likely holding the score down."
    return "Several important sections or contact details are missing. Start with those before fine-tuning wording."


def analyze(
    data: dict[str, Any],
    *,
    settings: dict[str, Any] | None = None,
    template_id: str = "classic-ats",
    job_text: str = "",
    job_title: str = "",
    company: str = "",
    weights: dict[str, float] | None = None,
    advanced: bool = True,
) -> dict[str, Any]:
    settings = settings or {}
    facts = extract_facts(data)
    w = {**DEFAULT_WEIGHTS, **(weights or {})}

    formatting, fmt_issues, fmt_strengths = _score_formatting(data, settings, template_id)
    content, content_issues, content_strengths = _score_content(facts)
    experience, exp_issues = _score_experience(facts)
    skills, skill_issues = _score_skills(facts)
    completeness, completeness_rows, _ = _completeness(facts)
    education = _education_score(facts)

    job_keywords = extract_keywords(job_text, source="job") if job_text else []
    resume_keywords = extract_keywords(facts.full_text, source="resume")
    if job_keywords:
        matched, missing, keyword_score = match_keywords(
            facts.full_text, job_keywords, facts.text_by_section
        )
        keyword_score = int(round(keyword_score))
    else:
        matched = [
            {
                "term": k.term,
                "category": k.category,
                "weight": k.weight,
                "resumeCount": k.count,
                "jobCount": 0,
                "locations": locate_safe(k.term, facts.text_by_section),
                "related": [],
            }
            for k in resume_keywords[:16]
        ]
        missing = []
        keyword_score = min(100, 55 + len(facts.skills) * 3 + len(facts.technologies) * 2)

    issues = fmt_issues + content_issues + exp_issues + skill_issues
    if not facts.has_email:
        issues.insert(
            0,
            _issue(
                "no-email",
                severity="critical",
                status="critical",
                category="contact",
                title="Email address is missing",
                detail="Most parsers look for a plain-text email in the header. Do not put it only inside an image.",
                action={"kind": "edit-contact", "label": "Add email", "payload": {}},
            ),
        )
    if not facts.has_name:
        issues.insert(
            0,
            _issue(
                "no-name",
                severity="critical",
                status="critical",
                category="contact",
                title="Name is missing",
                detail="The first extractable line should be your name in plain text.",
                action={"kind": "edit-contact", "label": "Add name", "payload": {}},
            ),
        )
    for item in missing[:8]:
        if item["weight"] >= 0.7:
            issues.append(
                _issue(
                    f"missing-{item['term']}",
                    severity="high",
                    status="warning",
                    category="keywords",
                    title=f"Missing keyword: {item['term']}",
                    detail=(
                        f"The posting emphasises {item['term']}. Add it only if it accurately "
                        "describes your experience — do not stuff keywords."
                    ),
                    action={
                        "kind": "add-keyword",
                        "label": f"Add {item['term']} to Skills",
                        "payload": {"term": item["term"], "section": "technical-skills"},
                    },
                )
            )

    strengths = fmt_strengths + content_strengths
    overall = int(
        round(
            formatting * w["formatting"]
            + keyword_score * w["keywords"]
            + content * w["content"]
            + experience * w["experience"]
            + skills * w["skills"]
            + completeness * w["completeness"]
        )
    )
    overall = max(0, min(100, overall))
    band, band_label = _band(overall)

    breakdown = [
        {
            "key": "formatting",
            "label": "Formatting",
            "score": formatting,
            "weight": w["formatting"],
            "explanation": (
                "Looks at layout, fonts, icons and whether text is likely extractable."
            ),
        },
        {
            "key": "keywords",
            "label": "Keywords",
            "score": keyword_score,
            "weight": w["keywords"],
            "explanation": (
                "Weighted coverage of terms from the job description, or of a healthy skill set if none was supplied."
            ),
        },
        {
            "key": "content",
            "label": "Content",
            "score": content,
            "weight": w["content"],
            "explanation": "Summary length, action verbs, metrics and bullet quality.",
        },
        {
            "key": "experience",
            "label": "Experience",
            "score": experience,
            "weight": w["experience"],
            "explanation": "Presence of roles or projects and whether they include achievements.",
        },
        {
            "key": "skills",
            "label": "Skills",
            "score": skills,
            "weight": w["skills"],
            "explanation": "A readable, non-graphical skills section.",
        },
        {
            "key": "completeness",
            "label": "Completeness",
            "score": completeness,
            "weight": w["completeness"],
            "explanation": "Whether expected sections and contact details are present.",
        },
    ]

    recommendations = []
    for issue in issues:
        if issue["severity"] in {"critical", "high", "medium"}:
            recommendations.append(
                {
                    "id": f"rec-{issue['id']}",
                    "priority": issue["severity"],
                    "title": issue["title"],
                    "detail": issue["detail"],
                    "section": (issue.get("action") or {}).get("payload", {}).get("section"),
                    "action": issue.get("action"),
                }
            )

    if not advanced:
        issues = [i for i in issues if i["severity"] in {"critical", "high"}]
        recommendations = recommendations[:3]

    related = related_suggestions(missing, {m["term"] for m in matched})
    sections = [
        {
            "key": t,
            "label": t.replace("-", " ").title(),
            "present": True,
            "status": "good",
            "detail": "Included in the document.",
        }
        for t in facts.visible_section_types
    ]

    kind = "job_match" if job_text else "ats_check"
    match_score = keyword_score if job_text else None
    required = [m for m in matched + missing if m.get("weight", 0) >= 0.75]
    preferred = [m for m in matched + missing if 0.4 <= m.get("weight", 0) < 0.75]

    report: dict[str, Any] = {
        "id": None,
        "kind": kind,
        "overallScore": overall,
        "matchScore": match_score,
        "band": band,
        "bandLabel": band_label,
        "headline": _headline(overall, keyword_score, formatting, bool(job_text)),
        "breakdown": breakdown,
        "issues": issues,
        "strengths": strengths,
        "recommendations": recommendations,
        "matchedKeywords": matched,
        "missingKeywords": missing,
        "relatedKeywords": related,
        "sections": sections,
        "completeness": completeness_rows,
        "wordCount": facts.word_count,
        "estimatedPages": 1 if facts.word_count < 550 else 2 if facts.word_count < 1100 else 3,
        "disclaimer": DISCLAIMER,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "scores": {
            "formatting": formatting,
            "keywords": keyword_score,
            "content": content,
            "experience": experience,
            "skills": skills,
            "education": education,
            "completeness": completeness,
        },
    }

    if job_text:
        report.update(
            {
                "jobTitle": job_title,
                "company": company or None,
                "jobDescriptionId": None,
                "requiredSkills": [k for k in required if k in matched or k in missing][:16],
                "preferredSkills": preferred[:16],
                "matchedRequirements": len(matched),
                "totalRequirements": len(matched) + len(missing),
                "experienceMatch": [
                    {
                        "key": "titles",
                        "label": "Role titles",
                        "present": bool(facts.job_titles),
                        "status": "good" if facts.job_titles else "warning",
                        "detail": ", ".join(facts.job_titles[:4]) or "No titles listed.",
                    }
                ],
                "educationMatch": [
                    {
                        "key": "education",
                        "label": "Education",
                        "present": facts.education_count > 0,
                        "status": "good" if facts.education_count else "optional",
                        "detail": ", ".join(facts.degrees[:3]) or "No education listed.",
                    }
                ],
                "sectionsToImprove": recommendations[:5],
                "placementGuidance": (
                    "Use keywords naturally where they accurately describe your experience. "
                    "Prefer the Skills, Experience or Projects section over a keyword dump."
                ),
            }
        )
    return report


def locate_safe(term: str, text_by_section: dict[str, str]) -> list[str]:
    needle = term.lower()
    return [key for key, body in text_by_section.items() if needle in body.lower()]


def persist_report(
    db: Session,
    report: dict[str, Any],
    *,
    user_id: uuid.UUID | None,
    resume_id: uuid.UUID | None = None,
    job_description_id: uuid.UUID | None = None,
    source: str = "builder",
) -> ATSReport:
    scores = report.get("scores") or {}
    row = ATSReport(
        user_id=user_id,
        resume_id=resume_id,
        job_description_id=job_description_id,
        kind=report.get("kind") or "ats_check",
        source=source,
        overall_score=int(report["overallScore"]),
        formatting_score=int(scores.get("formatting") or 0),
        keyword_score=int(scores.get("keywords") or 0),
        content_score=int(scores.get("content") or 0),
        experience_score=int(scores.get("experience") or 0),
        skills_score=int(scores.get("skills") or 0),
        education_score=int(scores.get("education") or 0),
        completeness_score=int(scores.get("completeness") or 0),
        match_score=report.get("matchScore"),
        issues=report.get("issues") or [],
        recommendations=report.get("recommendations") or [],
        strengths=report.get("strengths") or [],
        matched_keywords=report.get("matchedKeywords") or [],
        missing_keywords=report.get("missingKeywords") or [],
        sections=report.get("sections") or [],
        summary={
            "headline": report.get("headline"),
            "band": report.get("band"),
            "wordCount": report.get("wordCount"),
            "jobTitle": report.get("jobTitle"),
            "company": report.get("company"),
        },
    )
    db.add(row)
    if resume_id:
        resume = db.get(Resume, resume_id)
        if resume is not None:
            resume.ats_score = int(report["overallScore"])
    db.commit()
    db.refresh(row)
    report["id"] = str(row.id)
    if job_description_id:
        report["jobDescriptionId"] = str(job_description_id)
    return row
