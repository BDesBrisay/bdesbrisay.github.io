# LearnScroll Implementation Plan

## 1. Objective

Build an offline-first React PWA that delivers a TikTok-style learning feed on mobile, replacing doomscrolling with short educational interactions. The app must run without internet once installed and seeded with content.

## 2. Product Requirements

### Functional Requirements

- Vertical swipe feed of single-card learning interactions.
- Card interaction modes:
  - multiple choice
  - free-think + reveal
  - true/false
- Immediate feedback + short explanation.
- Session metrics:
  - cards completed
  - accuracy
  - streak count
- Topic tagging and weak-topic detection.
- Lightweight review loop of missed/low-confidence cards.
- Optional manual content-pack download/sync when online.

### Non-Functional Requirements

- Offline-first and resilient with flaky/no network.
- Fast startup and card transitions on mobile.
- Installable PWA behavior (home screen + standalone mode).
- Content and progress persistence across app restarts.
- Accessible touch targets and readable typography.

## 3. User Personas & Jobs-to-be-Done

- Distracted learner: "When I feel like mindless scrolling, I want a feed that still feels fun but teaches me something useful."
- Busy professional: "I want 5-minute learning sessions during breaks without internet dependency."
- Student: "I need fast retrieval practice for math and concepts between classes."

## 4. Experience Design

### Feed Interaction Pattern

- Full-screen card stack.
- Vertical swipe (`up` next, `down` previous/review optional).
- Bottom action row: `Reveal`, `I got it`, `Missed it`, `Next`.
- Tiny progress indicator (e.g., `7/20`).

### Engagement Loops (Non-addictive)

- Session goal (default 10 cards).
- Streak reinforcement tied to completion quality.
- End-of-session recap with one actionable insight.
- No endless novelty bias: prioritize spaced review and topic balance.

## 5. Technical Architecture

### Frontend Stack (Recommended)

- React + TypeScript
- Vite
- `vite-plugin-pwa` (service worker + manifest)
- `react-router` (minimal routes)
- `zustand` or Redux Toolkit for state (Zustand preferred for MVP simplicity)
- Dexie.js over IndexedDB for offline data storage
- Optional animation library: Framer Motion (keep motion restrained)

### App Layers

- UI Layer: feed, card renderer, results screens, settings
- Domain Layer: scheduler, scoring, streak logic, review prioritization
- Data Layer: local content packs + progress persistence
- Sync Layer: optional online check + download/verify packs

## 6. Offline-First Data Strategy

### Storage Model

Use IndexedDB tables (via Dexie):
- `content_packs` (id, version, manifest, installedAt)
- `cards` (id, packId, type, prompt, options, answer, explanation, tags, difficulty)
- `attempts` (id, cardId, result, latencyMs, timestamp)
- `profile` (single record: streak, preferences, lastSessionDate)
- `review_queue` (cardId, priority, nextDueAt)

### Caching Strategy

Service worker caches:
- App shell (HTML/CSS/JS)
- icons + manifest
- starter content pack JSON

Runtime behavior:
- `cache-first` for app shell assets
- `network-first with fallback` for optional new pack manifests
- background update prompt when newer app version is detected

### Content Pack Format

JSON pack structure:
- metadata: `packId`, `version`, `title`, `topics`
- cards array with strict schema and validation

Validation checks before install:
- required fields
- unique IDs
- allowed card types
- semantic version comparison

## 7. Learning Logic (MVP)

### Card Selection Algorithm

Weight selection by:
- unseen cards (high)
- missed cards due for review (high)
- recently correct cards (low)
- topic balancing to avoid monotony

### Review Heuristic

Simple spaced repetition approximation:
- missed card: due soon (same session or +1 day)
- correct quickly: longer interval
- correct slowly: medium interval

### Score Signals

Per-topic confidence score from:
- correctness
- response latency band
- recency decay

## 8. PWA & Mobile Local Setup Plan

### Development on Phone (Local Network)

1. Start app with host binding, e.g. `npm run dev -- --host`.
2. From phone on same Wi-Fi, open `http://<computer-lan-ip>:5173`.
3. Validate touch behavior and viewport-safe layout.

### Installable PWA Flow

- Configure manifest (`name`, `short_name`, icons, `display: standalone`).
- Register service worker with update handling.
- Use HTTPS in production; for local development, install behavior may vary by platform.

### Offline Validation Checklist

- Load app once online.
- Confirm starter pack stored in IndexedDB.
- Disable network.
- Relaunch app and complete full session offline.
- Confirm progress persists after force-close.

## 9. Project Structure (Proposed)

```text
learnscroll/
  app/                      # React project root
    src/
      components/
      features/feed/
      features/review/
      features/session/
      data/
      lib/
      styles/
    public/
    vite.config.ts
    manifest.webmanifest
  content/
    packs/
      starter-math-v1.json
      starter-science-v1.json
  docs/
    content-schema.md
    sync-protocol.md
  README.md
  PLAN.md
```

## 10. Delivery Roadmap

### Phase 0: Planning & Schemas (0.5-1 day)

- Finalize card schema and pack format.
- Define MVP card types and first 100 cards.
- Create wireframes for feed + recap + settings.

### Phase 1: App Shell + Feed MVP (2-3 days)

- Scaffold React/Vite TypeScript app.
- Build swipeable feed and card renderer.
- Implement local state for session progression.

### Phase 2: Offline Persistence + PWA (2-3 days)

- Add Dexie models and persistence flows.
- Configure service worker caching and manifest.
- Seed/install starter content pack.

### Phase 3: Learning Engine + Review (2-4 days)

- Attempt logging and confidence scoring.
- Add review queue generation and replay flow.
- Add session summary metrics.

### Phase 4: Content Updates + Polish (2-3 days)

- Add online pack fetch/install screen.
- Add version checks and safe update prompts.
- Improve animation smoothness + accessibility + QA.

## 11. Testing Plan

### Unit Tests

- selector/scheduler logic
- scoring and review interval calculations
- schema validation and pack install logic

### Integration Tests

- first-run seeding
- full session flow with attempts recorded
- review queue generation after misses

### Manual Mobile QA

- iOS Safari + Android Chrome
- portrait/landscape layout behavior
- offline startup and relaunch persistence
- PWA install/open in standalone mode

## 12. Risks and Mitigations

- Risk: iOS PWA caching quirks.
  - Mitigation: conservative cache strategy + explicit offline checks.
- Risk: content quality bottleneck.
  - Mitigation: strict card template + small high-quality starter set.
- Risk: engagement drops without novelty.
  - Mitigation: adaptive topic mix and short feedback loops.
- Risk: local-storage corruption edge cases.
  - Mitigation: schema versioning + backup/export option (post-MVP).

## 13. Definition of Done (MVP)

- User can install app on phone and run it without internet.
- At least 100 starter cards across 2-3 topics are usable offline.
- Session metrics, streak, and review queue persist locally.
- Manual "Check for new packs" works when online.
- Core interactions remain smooth on mid-range mobile devices.

## 14. Immediate Next Build Steps

1. Scaffold React + Vite + TypeScript app under `learnscroll/app`.
2. Add PWA plugin, manifest, and service worker strategy.
3. Implement Dexie schema + seed loader for one starter pack.
4. Build first feed UI with one card type end-to-end.
5. Verify full offline session on phone before adding complexity.

## 15. Detailed TODO Checklist

Use this as the execution checklist. Do not start a phase until the prior phase gate is met.

### Phase 0 TODO: Planning & Schemas

- [x] Confirm target platforms for MVP testing (`iOS Safari`, `Android Chrome`).
- [x] Confirm MVP card type set (`quick_math`, `concept_check`, `flash_fact`).
- [x] Define final card JSON schema in `docs/content-schema.md`.
- [x] Define `content_pack` metadata schema (`packId`, `version`, `title`, `topics`, `createdAt`).
- [x] Define schema validation rules (required fields, ID uniqueness, enum checks, length limits).
- [x] Define versioning policy (`semver`) for app and packs.
- [x] Create card authoring template (one reusable markdown or JSON template).
- [x] Draft first 100 cards across 2-3 topics.
- [x] Run manual quality pass on starter cards (clarity, answer correctness, explanation quality).
- [x] Create low-fidelity wireframes for feed, recap, settings, and pack management.
- [x] Define event naming conventions for analytics-like local metrics.
- [x] Write a short architecture decision log in `docs/` (state library, storage model, cache strategy).
- [x] Phase 0 gate: schema files + wireframes + starter content draft are complete and reviewed.

### Phase 1 TODO: App Shell + Feed MVP

- [x] Scaffold React + TypeScript + Vite app in `learnscroll/app`.
- [x] Set up base folder structure (`components`, `features`, `data`, `lib`, `styles`).
- [x] Install and configure state management (`zustand` preferred for MVP).
- [x] Set up routing for minimal screens (`/feed`, `/recap`, `/settings`).
- [x] Create app layout shell with mobile-safe viewport handling.
- [x] Build full-screen feed container optimized for one-thumb interaction.
- [x] Implement card renderer for at least one card type end-to-end.
- [x] Add swipe gesture handling with fallback button controls.
- [x] Add action row (`Reveal`, `I got it`, `Missed it`, `Next`).
- [x] Add basic progress indicator (`current/goal`).
- [x] Add in-memory session state (card index, correct/incorrect counts, elapsed time).
- [x] Build recap screen showing session summary.
- [x] Add baseline styling tokens (color, spacing, typography) for consistency.
- [x] Add basic accessibility pass (tap targets, contrast, readable font sizes).
- [x] Phase 1 gate: user can complete a simple local session flow with no persistence yet.

### Phase 2 TODO: Offline Persistence + PWA

- [x] Install and configure Dexie.js.
- [x] Create IndexedDB schema and migrations for `content_packs`, `cards`, `attempts`, `profile`, `review_queue`.
- [x] Implement first-run database bootstrap flow.
- [x] Add starter content pack JSON files under `content/packs/`.
- [x] Implement seed loader to ingest starter pack into IndexedDB.
- [x] Add robust schema validation before content-pack install.
- [x] Configure `vite-plugin-pwa` with manifest metadata and icons.
- [x] Implement service worker registration and lifecycle handling.
- [x] Configure cache policy for app shell (`cache-first`).
- [x] Configure manifest/content fetch policy (`network-first` with offline fallback).
- [x] Add offline fallback UX states (no network + no new content available).
- [x] Add app update availability prompt when service worker detects new version.
- [x] Test cold start with network disabled after initial cache.
- [x] Verify progress persists across app restart and force-close.
- [x] Phase 2 gate: app is installable and a complete starter session works offline.

### Phase 3 TODO: Learning Engine + Review

- [x] Implement attempt logging (result, latency, timestamp, cardId).
- [x] Implement per-topic confidence score computation.
- [x] Implement card selection weighting (unseen high, due-review high, recent-correct lower).
- [x] Implement missed-card scheduling rules (same session or short interval).
- [x] Implement correct-card interval rules (fast correct longer, slow correct medium).
- [x] Implement `review_queue` generation and due filtering.
- [x] Add review mode entry point in feed/session loop.
- [x] Add UI indicator for review cards vs new cards.
- [x] Add end-of-session summary including weak topics and suggested next focus.
- [x] Add profile streak update logic (`lastSessionDate`, consecutive days).
- [x] Add edge-case handling for empty queue / exhausted content.
- [x] Add tests for scheduler and scoring logic.
- [x] Phase 3 gate: adaptive feed + review loop behave correctly with persisted data.

### Phase 4 TODO: Content Updates + Polish

- [x] Build pack management UI (`installed packs`, `check for updates`, `install new pack`).
- [x] Define and document pack manifest endpoint contract in `docs/sync-protocol.md`.
- [x] Implement online update check flow with clear error handling.
- [x] Implement safe pack install transaction (validate -> write -> mark installed).
- [x] Implement pack version comparison and upgrade handling.
- [x] Add rollback or skip behavior for invalid/corrupt packs.
- [x] Add UX messaging for update status (`checking`, `downloading`, `installed`, `failed`).
- [x] Optimize feed rendering performance (memoization, render boundaries, animation tuning).
- [x] Perform full accessibility audit (labels, focus behavior, motion preferences).
- [x] Perform cross-device responsive polish (small/large phones, portrait/landscape).
- [x] Perform offline reliability regression pass after updates.
- [x] Phase 4 gate: stable update flow and polished mobile UX are validated.

### Cross-Phase QA and Release Checklist

- [x] Add unit tests for: schema validation, scoring, review scheduling, version comparison.
- [x] Add integration tests for: first-run seed, offline relaunch, session logging, review replay.
- [x] Create manual QA script for phone-local testing steps.
- [x] Verify local network dev workflow (`npm run dev -- --host`) on real devices.
- [x] Verify iOS and Android install prompts / add-to-home-screen behavior.
- [x] Verify standalone mode UI safe areas and status bar behavior.
- [x] Run performance checks for startup time and card transition smoothness.
- [x] Confirm data durability after force-close and device reboot.
- [x] Confirm no core path depends on internet after first install + content seed.
- [x] Update `README.md` with final setup and usage instructions.
- [x] Tag MVP release criteria against Section 13 Definition of Done.

### Suggested Execution Order

1. Complete all Phase 0 tasks and pass Phase 0 gate.
2. Complete all Phase 1 tasks and pass Phase 1 gate.
3. Complete all Phase 2 tasks and pass Phase 2 gate.
4. Complete all Phase 3 tasks and pass Phase 3 gate.
5. Complete all Phase 4 tasks and final cross-phase QA checklist.
