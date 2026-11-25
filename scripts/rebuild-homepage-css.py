#!/usr/bin/env python3
"""Regenerate homepage CSS bundles after editing their source files."""
from pathlib import Path
root = Path(__file__).resolve().parent.parent
bundles = {
  "homepage-cinematic-bundle.css": [
    "homepage-cinematic.css",
    "cinematic-storytelling.css",
    "hero-word-shuffle.css",
    "glass-navigation-effects.css"
  ],
  "homepage-layout-bundle.css": [
    "mobile-first-homepage-redesign.css",
    "mobile-app-experience-v5.css",
    "mobile-layout.css",
    "navigation-capsule.css",
    "homepage-redesign.css",
    "arctic-prestige.css",
    "arctic-prestige-sitewide.css",
    "homepage-hero-final.css",
    "monochrome-app-final.css",
    "hamburger-header-final.css",
    "homepage-trip-planner.css"
  ]
}
for target, sources in bundles.items():
    content = "".join(f"/* Source: {source} */\n" + (root / source).read_text(encoding="utf-8") + "\n" for source in sources)
    (root / target).write_text(content, encoding="utf-8")
