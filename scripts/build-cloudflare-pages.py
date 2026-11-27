#!/usr/bin/env python3
"""Build a static Cloudflare Pages artifact from tracked public files."""
from pathlib import Path
import subprocess
import shutil
import re

root = Path(__file__).resolve().parents[1]
dist = root / "dist"
if dist.exists():
    shutil.rmtree(dist)
dist.mkdir()
extensions = {".html", ".css", ".js", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico", ".gif", ".avif", ".woff", ".woff2", ".ttf", ".json", ".webmanifest", ".xml", ".csv", ".txt", ".pdf"}
excluded = {"supabase", "scripts", "dist", "node_modules"}
tracked = subprocess.check_output(["git", "ls-files", "-z"], cwd=root).decode().split("\0")
count = 0
for name in filter(None, tracked):
    path = Path(name)
    if any(part.startswith(".") for part in path.parts) or path.parts[0] in excluded or name.lower() == "readme.txt" or path.suffix.lower() not in extensions:
        continue
    source = root / path
    if source.is_symlink() or not source.is_file():
        raise SystemExit(f"Unexpected public file: {name}")
    if source.stat().st_size > 25 * 1024 * 1024:
        raise SystemExit(f"Asset exceeds Pages limit: {name}")
    target = dist / path
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
    count += 1
for required in ["index.html", "404.html", "robots.txt", "sitemap.xml", "admin.html", "analytics-config.json", "website-lead-form.js"]:
    if not (dist / required).is_file():
        raise SystemExit(f"Missing required public file: {required}")
if count > 19999:
    raise SystemExit("Pages file count limit exceeded")
(dist / "_headers").write_text("https://:project.pages.dev/*\n  X-Robots-Tag: noindex\n\nhttps://:version.:project.pages.dev/*\n  X-Robots-Tag: noindex\n", encoding="utf-8")
print(f"Cloudflare Pages artifact: {count} public files plus _headers")
