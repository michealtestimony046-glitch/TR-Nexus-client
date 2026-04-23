# T/R Agency PWA

A boutique cyber-ops style PWA for T/R Agency — premium QA testing, technical audits, and software engineering for global startups.

## Stack
- Vite + React (no backend)
- vite-plugin-pwa (installable, offline cached)
- Single-page experience with anchored sections (Home, About, Mission, Services, CTA)

## Critical Logic
- **Smart Intake popup** opens from any "Order" / "Consult" button (no cart system).
- On submit: fires Discord webhook via `navigator.sendBeacon` (fire-and-forget) and immediately `window.location.replace('https://discord.gg/Ex7XWNqDtd')`.
- No success message, no loading state, no confirmation screen.
- Webhook URL configured via `VITE_DISCORD_WEBHOOK_URL` env var.

## Brand
- Background `#0b0f19`, accent neon `#38bdf8`, gold `#d4af6a`.
- Inter + JetBrains Mono.
- 5% opacity "T/R" watermark behind About section.

## Files
- `src/App.jsx` — sections + layout
- `src/IntakeModal.jsx` — popup form + webhook + redirect
- `src/services.js` — service catalog data
- `src/styles.css` — full stylesheet
- `vite.config.js` — Vite + PWA manifest config
- `scripts/gen-icons.mjs` — generates PWA icons (192/512)

## Workflow
- `Start application` — `npm run dev` on port 5000
