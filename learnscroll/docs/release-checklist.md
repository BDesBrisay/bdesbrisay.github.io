# LearnScroll Plan 3 Release Checklist

## Pre-Release Gates

- Regenerate packs: `node scripts/generate-packs.mjs`
- Typecheck: `cd app && npm run typecheck`
- Tests: `cd app && npm run test`
- Build: `cd app && npm run build`
- Verify manifest and generated packs are both updated:
  - `content/manifest.json`
  - `app/public/content/manifest.json`
  - `content/packs/*.json`
  - `app/public/content/packs/*.json`
- Verify default install subset remains limited to:
  - `math-arithmetic-v1`
  - `science-physics-v1`
  - `cs-foundations-v1`

## Manual QA Pass

- Install app and confirm offline launch after initial load.
- Run at least one session in each domain:
  - math
  - science
  - computer science
- Confirm Packs page:
  - grouped by domain and track
  - prerequisite lock hints render
  - domain starter bundle installs correctly
  - daily-focus toggles update session selection
- Confirm Settings page:
  - guided/mixed mode toggles persist
  - active domain toggles persist
  - active track toggles persist
- Confirm Recap page:
  - weak-topic list segmented by domain
- Confirm legacy migration behavior:
  - existing `starter-math-v1` install pulls `math-arithmetic-v1`
  - existing `starter-science-v1` install pulls `science-physics-v1`

## Rollback Plan

1. Revert manifest and generated packs to previous tagged release artifacts.
2. Redeploy with previous `app/public/content/*` payload.
3. Keep client app version unchanged if rollback is content-only.
4. If app rollback is required, redeploy previous app build and keep prior service worker assets.
5. Validate startup and feed session creation with production IndexedDB snapshots.
6. Announce rollback scope:
   - content only or full app rollback
   - affected pack IDs and versions
