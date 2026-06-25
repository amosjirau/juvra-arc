# Juvra-Arc — Design System (MASTER)

> Single source of truth for the Juvra-Arc UI. Generated with the UI UX Pro Max skill
> (Marketplace/Directory pattern + Accessible/Ethical style) and reconciled against the
> **actually-implemented** tokens in `src/app/globals.css`. This documents the real system —
> it is descriptive, not aspirational. Page-specific deviations live in `design-system/pages/*.md`.

## 1. Product classification
- **Product type:** Web3 freelance escrow marketplace (clients ↔ freelancers, on-chain settlement on Arc).
- **Category:** fintech / crypto / Web3 / marketplace + SaaS dashboard.
- **Users:** clients, freelancers, admin/arbitrator, Web3-native + beginners.
- **Trust level:** HIGH (real funds in escrow). Complexity: medium-high.
- **Goal:** make escrow feel simple, secure, transparent, professional.
- **Pattern (skill):** Marketplace/Directory + Trust & Authority. **Style:** Accessible & Ethical, dark-first premium.

## 2. Brand direction
Emerald **trust-first**. Emerald = escrow / verified / financial safety. Mature, secure, premium,
animated-but-controlled, founder/investor/demo-ready. Never: neon crypto template, AI-purple
gradient slop, childish, cluttered, fake.

## 3. Color tokens (canonical — defined in `globals.css`)
| Role | Token | Hex |
|---|---|---|
| Brand emerald (primary) | `--brand-emerald` | `#10b981` |
| Emerald strong (hover) | `--brand-emerald-strong` | `#059669` |
| Mint (light) | `--brand-mint` | `#34d399` |
| Sky (network/AI/info) | `--brand-sky` | `#38bdf8` / `#0ea5e9` |
| Amber (pending/review) | `--brand-amber` | `#fbbf24` |
| Violet (tiny AI accent only) | `--brand-violet` | `#8b5cf6` |
| Base navy/slate | — | `#060b16`, `#0a1322`, `#0b1120` |
| Foreground | `--foreground` | near-white |
| Danger / destructive | `--destructive` / status-cancelled | `#fb7185` (rose) |

**Semantic status palette** (drives `StatusBadge`, `MetricCard` tones, risk levels):
`open #34d399` · `assigned #38bdf8` · `submitted #60a5fa` · `approved #6ee7b7` · `disputed #fbbf24` · `refunded #a1a1aa` · `cancelled #fb7185`.

**Color rules:** one accent (emerald) locked across the whole app. Sky for network/chain/AI/info.
Amber strictly for pending/escrow/review. Rose strictly for danger/dispute/failed. Violet only as a
*tiny* AI accent. RainbowKit modal accent stays `#22c55e` to match.

## 4. Typography
- **Display/headings:** Geist (`--font-geist-display`) — `.text-display-1/2`, tight tracking.
- **UI/body:** Inter (`--font-inter-ui`) — base 16px, line-height 1.5–1.75, measure ≤ 65ch.
- **Data/mono:** Geist Mono (`--font-geist-mono`) — addresses, amounts, hashes (tabular).
- Weight for hierarchy (600–700 headings, 500 labels, 400 body). Gradient text only on hero/page titles via `.heading-gradient` (white → mint → sky).

## 5. Spacing & layout
- 4/8px rhythm. Section spacing `py-16 → py-28`. Content column `max-w-[1280px] mx-auto`.
- Navbar is floating; product pages offset `pt-28 sm:pt-32` (via `AppShell`).
- Grid over flex-math. `min-h-[100dvh]` never `h-screen`.

## 6. Radius / shadow / glass
- Radius scale from `--radius: 0.625rem` (`radius-sm…4xl`). One radius family per surface.
- Shadows tinted (`shadow-black/20–30`, `shadow-emerald-950/30`), never pure-black on light.
- **Glass:** `GlassCard` = `surface-2` + `backdrop-blur-xl` + `ring-white/5` + mouse-tracked
  **spotlight** (`--mx/--my`). Optional `glow` (gradient border) and `beam` (conic `--beam-angle`).
  Use glass for elevation that means something — not on everything.

## 7. Motion principles
- Lib: `motion/react`. Shared variants in `src/lib/motion.ts`: `fadeUp`, `fadeIn`, `scaleIn`,
  `blurReveal`, `staggerContainer`, `viewportOnce`, `hoverLift`. Easing `easeOutSoft` `cubic-bezier(.22,1,.36,1)`.
  Durations: fast `.16` / med `.32` / slow `.64`.
- Dials: **VARIANCE 6 · MOTION 5 · DENSITY 4** (premium, controlled, trust-first).
- Every animation must be motivated (hierarchy / storytelling / feedback / state). No decorative loops everywhere.
- Premium CSS primitives: `spotlight-surface`, `border-beam`, `shimmer`, `scroll-progress`,
  `pulse-ring`, `radar-sweep`, `aurora-blob`, `scroll-reveal` (view-timeline), `glow-border`.
- **`prefers-reduced-motion`** is a global kill switch in `globals.css` — never regress it. No layout shift; animate transform/opacity only.

## 8. Component rules
- Base library lives in `src/components/ui` + `src/components/shell`. Reuse, don't reinvent.
- Cards: `GlassCard` is the base for `BentoCard / MetricCard / WalletStatusCard / DashboardPanel / AdminGate / JobCard`. No card-in-card-in-card.
- One icon family: **lucide-react** (project standard). No emoji icons, no hand-rolled SVG icons.

## 9. Button rules
- **Primary (`Button` default / `CTAButton`):** emerald fill, **dark text** (`#04130a`) for WCAG. Tactile `-translate-y-0.5` on hover, `:active` press.
- **Secondary (`GlowButton` / `outline`):** glassy white surface + glow border.
- One label per intent across the page. Labels fit one line at desktop. Always show loading/disabled states.

## 10. Form rules
- `FormFieldGroup`: label **above** input, helper text persistent, required `*`, error **below**. Never placeholder-as-label.
- Validate on submit/blur, surface a single clear error. Premium guided layout (sections + live preview), not a bare HTML form.

## 11. Card / dashboard rules
- `MetricCard`: tone accent bar + icon ring + `CountUp`; `countTo` for integer counts, `value` for formatted USDC strings; optional `trend[]` sparkline + `delta` chip.
- `DashboardPanel` frames regions (header + body). Tabs for client/freelancer/disputes.
- Numbers tabular/mono. Empty, loading (skeleton), error states always present.

## 12. Web3 state rules
- **Wallet:** `WalletStatusCard` 3-state (disconnected / wrong-network / connected). Connect via RainbowKit `ConnectButton.Custom` (preserve `openConnectModal/openChainModal/openAccountModal`).
- **Transactions:** `TxStatus` animated stepper (idle → pending → success → error) with Arcscan link. Translate raw errors to plain copy ("Nothing was charged - please try again.").
- **Admin:** `AdminGate` never renders children to non-arbitrator wallets (security boundary).
- **AI:** always advisory. Show provider mode (Live AI vs Heuristic) and surface fallback warnings — never hide them. Visible "guidance only" disclaimer.

## 13. Accessibility rules
- Contrast AA (4.5:1 body, 3:1 large). Visible focus rings (`focus-ring`, emerald). Touch targets ≥ 44px.
- Labels on inputs, aria-labels on icon-only buttons, `aria-live` on tx/status. Keyboard nav + logical order. Respect reduced-motion and dynamic type. Color never the only signal (icon + text).

## 14. Responsive rules
- Mobile-first. Test 375 / 768 / 1024 / 1440. No horizontal scroll. High-variance layouts collapse to single column < 768px. Mobile menu in navbar. Tabular numbers prevent layout shift.

## 15. Anti-patterns (banned)
- ❌ Old orange/purple/pink brand, ❌ AI-purple/pink gradients, ❌ Bitcoin-orange default.
- ❌ Em-dash `—` anywhere visible (use `-`). ❌ Scroll cues ("Scroll to explore"). ❌ Eyebrow on every section (≤ 1 per 3). ❌ Decorative status dots.
- ❌ **Fake/vanity data over real on-chain data** (no invented trust scores / "verified payer"). ❌ Hiding AI fallback errors.
- ❌ Card-in-card-in-card. ❌ Emoji icons. ❌ Excess glassmorphism / neon glow. ❌ `h-screen`. ❌ Placeholder-as-label.
