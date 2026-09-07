"""PDF export with selectable text.

Primary engine: Playwright print-to-PDF (same HTML as the live preview).
Fallback: a simple multi-page PDF writer so local development works without Chromium.
"""

from __future__ import annotations

import html
import logging
from typing import Any

from app.core.config import settings
from app.services.docx_service import _safe_filename
from app.services.resume_text import format_date_range, to_plain_text


def _section_lines(section: dict[str, Any], date_style: str) -> list[str]:
    kind = section.get("kind")
    lines: list[str] = []
    if kind == "text" and section.get("content"):
        lines.append(str(section["content"]))
    elif kind == "skills":
        for group in section.get("groups") or []:
            skills = ", ".join(group.get("skills") or [])
            if skills:
                lines.append(f"{group.get('name') or 'Skills'}: {skills}")
    elif kind == "tags":
        tags = ", ".join(section.get("tags") or [])
        if tags:
            lines.append(tags)
    else:
        for item in section.get("items") or []:
            title = item.get("title") or item.get("name") or item.get("degree") or ""
            company = item.get("company") or item.get("institution") or item.get("issuer") or ""
            head = " · ".join(part for part in (title, company) if part)
            dates = format_date_range(
                str(item.get("startDate") or item.get("date") or ""),
                str(item.get("endDate") or ""),
                bool(item.get("current")),
                date_style,
            )
            if head:
                lines.append(f"{head}  {dates}".strip())
            if item.get("description"):
                lines.append(str(item["description"]))
            for bullet in item.get("bullets") or []:
                lines.append(f"• {bullet}")
    return lines

logger = logging.getLogger("resumeforge.pdf")


def build_pdf(
    data: dict[str, Any],
    settings_doc: dict[str, Any] | None = None,
    *,
    html_document: str | None = None,
    page_size: str = "a4",
) -> tuple[bytes, str]:
    personal = (data or {}).get("personal") or {}
    filename = _safe_filename(personal, "pdf")
    engine = (settings.PDF_ENGINE or "playwright").lower()
    if html_document and engine == "playwright":
        try:
            return _playwright_pdf(html_document, page_size), filename
        except Exception:  # noqa: BLE001
            logger.warning("Playwright PDF failed; using text fallback", exc_info=True)
    return _simple_pdf(data, settings_doc or {}, page_size), filename


def _playwright_pdf(html_document: str, page_size: str) -> bytes:
    from playwright.sync_api import sync_playwright

    format_name = "Letter" if page_size == "letter" else "A4"
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()
        page.set_content(html_document, wait_until="networkidle")
        pdf = page.pdf(format=format_name, print_background=True, prefer_css_page_size=True)
        browser.close()
    return pdf


def _simple_pdf(data: dict[str, Any], settings_doc: dict[str, Any], page_size: str) -> bytes:
    """Minimal PDF 1.4 writer: Helvetica, selectable text, A4/Letter."""
    width, height = (612, 792) if page_size == "letter" else (595, 842)
    margin = 48
    personal = data.get("personal") or {}
    lines: list[tuple[str, int, bool]] = []

    name = str(personal.get("fullName") or "Resume")
    lines.append((name, 18, True))
    if personal.get("title"):
        lines.append((str(personal["title"]), 11, False))
    contact = "  ·  ".join(
        str(personal.get(key))
        for key in ("email", "phone", "location", "linkedin", "github", "website")
        if personal.get(key)
    )
    if contact:
        lines.append((contact, 9, False))
    lines.append(("", 8, False))

    date_style = settings_doc.get("dateFormat") or settings_doc.get("date_format") or "short-month"
    for section in data.get("sections") or []:
        if not section.get("visible", True):
            continue
        title = str(section.get("title") or "").upper()
        body = _section_lines(section, date_style)
        if not body:
            continue
        lines.append((title, 12, True))
        for row in body:
            lines.append((row, 10, False))
        lines.append(("", 8, False))

    if not any(text for text, _, _ in lines):
        lines.append((to_plain_text(data) or "Empty resume", 10, False))

    pages: list[list[tuple[str, int, bool]]] = []
    current: list[tuple[str, int, bool]] = []
    y = height - margin
    for entry in lines:
        text, size, _bold = entry
        needed = size + 6
        if y - needed < margin:
            pages.append(current)
            current = []
            y = height - margin
        current.append(entry)
        y -= needed
    if current:
        pages.append(current)

    objects: list[bytes] = [b""]  # 1-indexed
    # We'll assemble: catalog, pages tree, each page + content stream, font.

    def pdf_escape(text: str) -> str:
        cleaned = "".join(ch if ord(ch) < 128 else "?" for ch in text)
        return cleaned.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")

    content_ids: list[int] = []
    page_ids: list[int] = []

    font_id = 0  # assigned later

    content_objs: list[bytes] = []
    for page in pages:
        commands = [f"BT /F1 10 Tf"]
        y = height - margin
        first = True
        for text, size, bold in page:
            if not first:
                commands.append(f"0 {-size - 6} Td")
            else:
                commands.append(f"{margin} {y} Td")
                first = False
            font = "F2" if bold else "F1"
            commands.append(f"/{font} {size} Tf ({pdf_escape(text[:220])}) Tj")
            y -= size + 6
        commands.append("ET")
        stream = "\n".join(commands).encode("latin-1", errors="replace")
        obj = (
            f"<< /Length {len(stream)} >>\nstream\n".encode()
            + stream
            + b"\nendstream"
        )
        content_objs.append(obj)

    # Object graph
    objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")  # 1
    # 2 = pages tree, filled later
    objects.append(b"")  # placeholder

    for content in content_objs:
        objects.append(content)
        content_ids.append(len(objects) - 1)

    font1 = len(objects) + 1 + len(pages)
    # We'll add pages first then fonts
    page_start = len(objects)
    for index, content_id in enumerate(content_ids):
        objects.append(
            (
                f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {width} {height}] "
                f"/Contents {content_id} 0 R /Resources << /Font << "
                f"/F1 {page_start + len(pages)} 0 R /F2 {page_start + len(pages) + 1} 0 R >> >> >>"
            ).encode()
        )
        page_ids.append(len(objects) - 1)

    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

    kids = " ".join(f"{pid} 0 R" for pid in page_ids)
    objects[2] = f"<< /Type /Pages /Count {len(page_ids)} /Kids [{kids}] >>".encode()

    # Build xref
    buffer = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, obj in enumerate(objects[1:], start=1):
        offsets.append(len(buffer))
        buffer.extend(f"{index} 0 obj\n".encode())
        buffer.extend(obj)
        buffer.extend(b"\nendobj\n")
    xref_pos = len(buffer)
    buffer.extend(f"xref\n0 {len(objects)}\n".encode())
    buffer.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        buffer.extend(f"{offset:010d} 00000 n \n".encode())
    buffer.extend(
        f"trailer\n<< /Size {len(objects)} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode()
    )
    return bytes(buffer)


def render_preview_html(data: dict[str, Any], settings_doc: dict[str, Any] | None = None) -> str:
    """Standalone HTML used when the client does not send a rendered document."""
    body = html.escape(to_plain_text(data)).replace("\n", "<br/>")
    return f"""<!doctype html><html><head><meta charset="utf-8">
<style>
@page {{ size: A4; margin: 16mm; }}
body {{ font-family: Helvetica, Arial, sans-serif; font-size: 11pt; color: #111827; }}
</style></head><body>{body}</body></html>"""
