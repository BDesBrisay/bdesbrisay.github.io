# LearnScroll

LearnScroll is an offline-first React PWA that replaces doomscrolling with short, TikTok-style learning cards.

## High-Level Vision

- Keep the fast, swipe-forward rhythm of a social feed.
- Replace low-value scrolling with micro-lessons that compound over time.
- Make daily learning possible even with no internet after initial load.
- Reward consistency with streaks, recap insights, and weak-topic review.

## What Is Implemented

- React + TypeScript + Vite app (`learnscroll/app`)
- Installable PWA with service worker caching
- Offline data persistence using Dexie (IndexedDB)
- Curriculum-scale content packs and manifest-based update flow
- Learning feed with card interactions:
  - `quick_math`
  - `concept_check`
  - `flash_fact`
- Post-reveal grading flow with optional auto-advance controls
- Option rationale coverage for all `concept_check` cards
- Adaptive scheduler with curriculum-aware filtering and blend diagnostics
- Session recap, streak tracking, weak-topic detection segmented by domain
- Packs screen with domain/track grouping, prerequisites, starter bundles, and daily-focus toggles
- Settings screen with curriculum mode plus domain/track controls
- Unit and integration tests for core logic and data flows

## Project Layout

```text
learnscroll/
  app/
    public/content/
    src/
  content/
    src/
    manifest.json
    packs/
  docs/
  scripts/
  PLAN.md
  README.md
```

## Run Locally

```bash
cd learnscroll/app
npm install
npm run dev
```

Open on your computer at `http://localhost:5173`.

Node requirement:
- `20.19+` or `22.12+` (Vite 7 requirement)

## Run On Phone Over LAN

1. Start dev server:

```bash
cd learnscroll/app
npm run dev
```

2. On phone (same Wi-Fi), open `http://<your-computer-lan-ip>:5173`.
3. Install to home screen as PWA.

## Offline Usage

1. Launch once while online so app shell + starter packs are cached.
2. Open the app from home screen or browser while offline.
3. Complete sessions with full local persistence.

## Build and Test

```bash
cd learnscroll/app
npm run typecheck
npm run test
npm run build
```

## Content Packs

Packs are generated in both:
- `learnscroll/content/packs/`
- `learnscroll/app/public/content/packs/`

Manifest:
- `learnscroll/content/manifest.json`
- `learnscroll/app/public/content/manifest.json`

Regenerate packs:

```bash
node learnscroll/scripts/generate-packs.mjs
```

Pack source of truth:
- `learnscroll/content/src/registry.mjs`
- `learnscroll/content/src/packs/*.mjs`

Current v1 curriculum catalog:
- Math: `math-arithmetic-v1`, `math-algebra-charting-v1`, `math-geometry-v1`, `math-calculus-v1`
- Science: `science-physics-v1`, `science-chemistry-v1`, `science-biology-v1`, `science-earth-space-v1`
- Computer science: `cs-foundations-v1`, `cs-data-structures-v1`, `cs-algorithms-v1`
- Legacy migration packs: `starter-math-v1`, `starter-science-v1`

Default install subset (first run):
- `math-arithmetic-v1`
- `science-physics-v1`
- `cs-foundations-v1`

## Documentation

- [PLAN.md](./PLAN.md)
- [Content Schema](./docs/content-schema.md)
- [Sync Protocol](./docs/sync-protocol.md)
- [Architecture Decisions](./docs/architecture-decisions.md)
- [Manual QA](./docs/manual-qa.md)
- [Release Checklist](./docs/release-checklist.md)
- [Wireframes](./docs/wireframes.md)
