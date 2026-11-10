#!/usr/bin/env python3
"""Render the customer documentation to static HTML for morgunsolutions.com.

Source of truth is the Markdown in this repository. Output is plain, self-contained
HTML written into the mds-website checkout, which owns the morgunsolutions.com
apex domain on GitHub Pages:

    <mds-website>/sf-ai-email-generator/docs/

No Jekyll, no theme, no change to the marketing site's own styles.css — the docs
ship their own stylesheet, so a mistake here cannot take the marketing site down.

Usage:
    python3 scripts/build-site.py [path-to-mds-website-checkout]

Requires pandoc.
"""

import html
import re
import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SITE_PATH = "sf-ai-email-generator/docs"
CANONICAL = f"https://morgunsolutions.com/{SITE_PATH}"

# source markdown -> (output file, nav label, page title, meta description)
PAGES = [
    ("index.md", "index.html", "Overview", "AI Email Reply Generator",
     "AI-powered email reply drafting inside Salesforce Lightning. Setup, user guide, "
     "FAQ and troubleshooting for the AI Email Reply Generator managed package."),
    ("setup.md", "setup.html", "Setup Guide", "Setup Guide",
     "One-time administrator setup for AI Email Reply Generator: install, API key, "
     "permission sets, and adding the component to your Lightning pages."),
    ("user-guide.md", "user-guide.html", "User Guide", "User Guide",
     "How to generate, edit and send AI-drafted email replies in Salesforce."),
    ("faq.md", "faq.html", "FAQ", "FAQ",
     "Frequently asked questions about AI Email Reply Generator: providers, cost, "
     "data handling, supported Salesforce editions."),
    ("troubleshooting.md", "troubleshooting.html", "Troubleshooting", "Troubleshooting",
     "Error messages in AI Email Reply Generator and how to resolve them."),
    ("PRIVACY_POLICY.md", "privacy-policy.html", "Privacy Policy", "Privacy Policy",
     "How MDS LLC handles data in connection with AI Email Reply Generator."),
    ("SECURITY_POLICY.md", "security-policy.html", "Security Policy", "Security Policy",
     "Security practices, vulnerability response and breach response for "
     "AI Email Reply Generator."),
]

NAV_GROUPS = [
    ("Documentation", ["index.html", "setup.html", "user-guide.html",
                       "faq.html", "troubleshooting.html"]),
    ("Policies", ["privacy-policy.html", "security-policy.html"]),
]

HEADER_NAV = [("setup.html", "Setup"), ("user-guide.html", "User Guide"),
              ("faq.html", "FAQ"), ("troubleshooting.html", "Troubleshooting")]

# markdown link target -> output link target
LINK_MAP = {
    "./": "index.html",
    "index.md": "index.html",
    "setup.md": "setup.html",
    "user-guide.md": "user-guide.html",
    "faq.md": "faq.html",
    "troubleshooting.md": "troubleshooting.html",
    "PRIVACY_POLICY.md": "privacy-policy.html",
    "SECURITY_POLICY.md": "security-policy.html",
}

MARK_SVG = (
    '<svg class="mark" viewBox="0 0 64 64" fill="none" stroke="currentColor" aria-hidden="true">'
    '<path d="M14 47 V17 L32 35 L50 17 V47" stroke-width="3.2" stroke-linejoin="round" '
    'stroke-linecap="round"/><g fill="currentColor" stroke="none">'
    '<circle cx="14" cy="17" r="5"/><circle cx="50" cy="17" r="5"/><circle cx="32" cy="35" r="5"/>'
    '<circle cx="14" cy="47" r="5"/><circle cx="50" cy="47" r="5"/></g></svg>'
)

FRONT_MATTER = re.compile(r"\A---\n.*?\n---\n", re.S)
HOME_CRUMB = re.compile(r"^\[← Documentation home\]\(\./\)\n+", re.M)
MD_LINK = re.compile(r"\]\((?!https?://|mailto:|#)([^)]+)\)")


def rewrite_links(md: str) -> str:
    def sub(m):
        target = m.group(1)
        page, sep, anchor = target.partition("#")
        mapped = LINK_MAP.get(page)
        if mapped is None:
            print(f"    WARNING: unmapped link target {target!r}", file=sys.stderr)
            return m.group(0)
        return f"]({mapped}{sep}{anchor})"
    return MD_LINK.sub(sub, md)


def to_html(md: str) -> str:
    out = subprocess.run(
        ["pandoc", "-f", "gfm", "-t", "html5", "--no-highlight"],
        input=md, capture_output=True, text=True, check=True,
    ).stdout
    # Tables scroll sideways rather than overflow on a phone.
    out = out.replace("<table>", '<div class="table-wrap"><table>')
    out = out.replace("</table>", "</table></div>")
    return out


def nav_html(current: str) -> str:
    titles = {out: label for _, out, label, _, _ in PAGES}
    parts = []
    for group, items in NAV_GROUPS:
        parts.append(f'        <p class="eyebrow">{group}</p>\n        <ul>')
        for item in items:
            cur = ' aria-current="page"' if item == current else ""
            parts.append(f'          <li><a href="{item}"{cur}>{titles[item]}</a></li>')
        parts.append("        </ul>")
    return "\n".join(parts)


def header_nav_html(current: str) -> str:
    lines = []
    for href, label in HEADER_NAV:
        cur = ' aria-current="page"' if href == current else ""
        lines.append(f'          <a class="navlink" href="{href}"{cur}>{label}</a>')
    return "\n".join(lines)


def page_html(out_name: str, title: str, description: str, body: str) -> str:
    full_title = title if out_name == "index.html" else f"{title} — AI Email Reply Generator"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{html.escape(full_title)} | MDS</title>
  <meta name="description" content="{html.escape(description)}" />
  <meta name="theme-color" content="#0a0a0a" />
  <link rel="canonical" href="{CANONICAL}/{out_name}" />

  <meta property="og:title" content="{html.escape(full_title)}" />
  <meta property="og:description" content="{html.escape(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="{CANONICAL}/{out_name}" />

  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="docs.css" />
</head>
<body>

  <header class="site-header">
    <div class="container">
      <a class="brand" href="/" aria-label="MDS — Morgun Database Solutions, home">
        {MARK_SVG}
        <span class="wordmark">MDS</span>
        <span class="sep">/</span>
        <span class="product">AI Email Reply Generator</span>
      </a>
      <nav class="nav">
{header_nav_html(out_name)}
      </nav>
    </div>
  </header>

  <div class="container">
    <div class="layout">
      <aside class="sidebar">
        <nav aria-label="Documentation">
{nav_html(out_name)}
        </nav>
      </aside>
      <main class="content">
{body.rstrip()}
      </main>
    </div>
  </div>

  <footer class="site-footer">
    <div class="container">
      <span>AI Email Reply Generator — a Salesforce AppExchange managed package by
        <a href="/">Morgun Database Solutions</a>.</span>
      <span>Support: <a href="mailto:omorgun@morgunsolutions.com">omorgun@morgunsolutions.com</a></span>
    </div>
  </footer>

</body>
</html>
"""


def main() -> int:
    if shutil.which("pandoc") is None:
        print("error: pandoc is required (brew install pandoc)", file=sys.stderr)
        return 1

    default_target = REPO.parent / "mds-website"
    target_repo = Path(sys.argv[1]) if len(sys.argv) > 1 else default_target
    if not (target_repo / "CNAME").exists():
        print(f"error: {target_repo} does not look like the mds-website checkout "
              f"(no CNAME file).\nPass the checkout path as the first argument.",
              file=sys.stderr)
        return 1

    out_dir = target_repo / SITE_PATH
    out_dir.mkdir(parents=True, exist_ok=True)

    shutil.copyfile(REPO / "templates" / "docs.css", out_dir / "docs.css")
    print(f"  docs.css -> {SITE_PATH}/docs.css")

    for src, out_name, _label, title, description in PAGES:
        md = (REPO / src).read_text()
        md = FRONT_MATTER.sub("", md)
        md = HOME_CRUMB.sub("", md)
        md = rewrite_links(md)
        body = to_html(md)
        (out_dir / out_name).write_text(page_html(out_name, title, description, body))
        print(f"  {src} -> {SITE_PATH}/{out_name}")

    print(f"\nWrote {len(PAGES) + 1} files to {out_dir}")
    print(f"Commit and push {target_repo} to publish at {CANONICAL}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
