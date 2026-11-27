# Project Agent Skills

These project-local skills use the open `SKILL.md` format and are discoverable by compatible coding agents such as OpenAI Codex, Cursor and other agents that support project skills. They provide task-specific guidance; they do not install website code or add runtime dependencies.

## Installed skills

| Skill | Use |
|---|---|
| `frontend-ui` | Responsive UI, accessibility, component states and browser verification. |
| `web-motion` | CSS/WAAPI/View Transition/scroll motion, performance and reduced-motion handling. |
| `himalayan-growth-agent` | Project-specific SEO, AEO, GEO, lead measurement and safe recurring optimization. |
| `seo-audit` | Technical SEO, crawlability, indexation, on-page SEO and local SEO. |
| `supabase` | Supabase database, Auth, Storage, RLS and client/backend troubleshooting. |

## Upstream sources and attribution

- `frontend-ui` and `web-motion`: [SvaraNova/skills](https://github.com/SvaraNova/skills) — MIT License. Copyright © 2026 SvaraNova.
- `seo-audit`: [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) — MIT License. Copyright © 2025 Corey Haines.
- `supabase`: [supabase/agent-skills](https://github.com/supabase/agent-skills) — license notice is included in that skill folder.

Each skill folder contains its upstream license text. The source skill files and their linked Markdown references are retained with attribution. No upstream installer, hook, shell script, executable or runtime package was copied.

## Project-specific precedence

Root `AGENTS.md`, `.github/skills/himalayan-odyssey-web-agent/SKILL.md`, the user's latest explicit request and the current repository implementation take precedence over generic third-party guidance. Skills must preserve the existing plain HTML/CSS/JavaScript + Supabase architecture, existing logo and approved brand direction; do not introduce React/Next.js, new libraries, paid services, hosting changes, production changes or database migrations unless explicitly authorized. Apply only the requested scope and the repository's mobile/desktop scope rules. Verify changes honestly; never claim browser or live-site verification that was not performed.
