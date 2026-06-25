# Page override — Home / Landing (`/`)

Inherits MASTER. Page-specific rules only.

- **Component:** `src/components/figma/JuvraFigmaLanding.tsx` (composes ~12 sections). Self-contained shell (own background + Footer), not `AppShell` — keep it that way unless unifying deliberately.
- **Live data:** `useJobs()` feeds hero/opportunities/dashboard/AICopilot, with `DEMO_STATS` fallback. Demo data is **clearly a fallback for empty state**, never overriding real jobs.
- **Section order (Marketplace + Trust):** Hero → Why/Trust strip → Opportunities → How It Works preview → Arc explainer → Circle/Arc → AI Copilot → Infrastructure → Dashboard preview → Use cases → FAQ → CTA.
- **Hero discipline:** ≤ 4 text elements, subtext ≤ 20 words, no scroll cue, one eyebrow. Primary CTA "Explore Jobs" (`/jobs`), secondary "See How Escrow Works" (`/how-it-works`).
- **Anchors are load-bearing:** `#how-it-works #why-arc #jobs #about #dashboard #faq` — do not rename.
- Eyebrow budget for the whole page: ≤ ceil(sections/3).
