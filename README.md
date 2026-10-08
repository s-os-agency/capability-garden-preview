# Capability Garden (preview)

Static preview of the S/ Capability Garden, rebuilt to match the Figma design.

- Pages: `index.html`, `capabilities.html`, `growth-paths.html`, `talent-bank.html`, `readiness.html`, `levels.html`, `skills/*.html`
- Styles and scripts: `assets/css/site.css`, `assets/js/site.js`
- Fonts: Fraunces and Inter via Google Fonts
- Skill downloads: `assets/skills/**/SKILL.md` (markdown only, with licences in `assets/skills/licenses/`)
- Tree image: stored as base64 text in `_build/tree-b64/` and decoded to `assets/img/tree.jpg` at build time by `_build/build.sh` (checksum-verified)

Vercel runs `sh _build/build.sh` and serves `dist/` (see `vercel.json`).
