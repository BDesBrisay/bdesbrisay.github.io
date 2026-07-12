# LearnScroll Plan 3: Curriculum Expansion (Math, Science, Computer Science)

## Purpose

This plan defines how to evolve LearnScroll from two starter packs into a curriculum-scale system with many focused packs (starting with math, science, and computer science) while preserving offline-first behavior and daily-practice simplicity.

This is a planning document only. No implementation is performed by this document.

## Current State (Codebase Reality)

The current implementation already provides a strong base, but there are hard constraints we need to design around:

1. Content generation is centralized in one script (`scripts/generate-packs.mjs`) that currently emits exactly two packs:
   - `starter-math-v1`
   - `starter-science-v1`
2. Manifest generation is hardcoded in that script (`content/manifest.json` + `app/public/content/manifest.json`).
3. Pack schema is strict (`app/src/data/packSchemas.ts`) and currently models only:
   - `packId`, `version`, `title`, `topics`, `createdAt`, `cards`
4. Default seeding installs all `defaultInstall: true` packs from manifest (`app/src/data/seed.ts`, `app/src/data/packRepository.ts`).
5. Session startup pulls all installed cards with no pack/curriculum filtering (`app/src/store/sessionStore.ts` uses `db.cards.toArray()`).
6. Scheduler adaptation is currently math-leaning and heuristic-driven (`app/src/lib/scheduler.ts`), including:
   - baseline 40/35/25 difficulty mix
   - > 80% and <55% performance shifts
   - math-card detection by `packId`/tags
7. Packs UI (`app/src/features/packs/PacksPage.tsx`) supports install/update but not curriculum grouping, prerequisites, or daily plan assignment.

## Plan 3 Goals

1. Add multiple focused packs per subject area:
   - Math: arithmetic, algebra + charting, geometry, calculus
   - Science: major subjects broken out by domain
   - Computer science: foundational concepts, data structures, algorithms
2. Introduce a curriculum model so users can practice daily with intentional progression, not just a flat pool of cards.
3. Keep offline-first guarantees and simple install/update flow.
4. Preserve current card engine (types, grading flow, review queue) while expanding content scale.

## Non-Goals (Initial Plan 3 Scope)

1. No cloud sync or accounts.
2. No full LMS-style lesson viewer.
3. No destructive migration that breaks existing local progress without explicit handling.

## Curriculum Model (Target)

### Curriculum Taxonomy

Use three levels of structure:

1. `domain` (top-level): `math`, `science`, `computer-science`
2. `track` (subject area): e.g. `arithmetic`, `algebra-charting`, `geometry`, `calculus`
3. `stage` (progression): e.g. `foundation`, `core`, `advanced`

### Initial Pack Catalog (v1)

#### Math

1. `math-arithmetic-v1`
2. `math-algebra-charting-v1`
3. `math-geometry-v1`
4. `math-calculus-v1`

#### Science

1. `science-physics-v1`
2. `science-chemistry-v1`
3. `science-biology-v1`
4. `science-earth-space-v1`

#### Computer Science

1. `cs-foundations-v1` (logic, binary, complexity intuition)
2. `cs-data-structures-v1`
3. `cs-algorithms-v1`

## Content Authoring Standards

1. Keep existing card types (`quick_math`, `concept_check`, `flash_fact`) for compatibility.
2. Enforce card ID namespacing by pack prefix to avoid cross-pack collisions (e.g. `math_arith_qm_001`).
3. Preserve difficulty scale 1-5 and bucket mapping used by scheduler.
4. Require strong tag discipline so recap/weak-topic scoring remains meaningful.
5. Keep concept-check `optionExplanations` quality bar; consider extending to all domains (not only science).

## Data and Schema Changes

### 1. Extend Pack Metadata

Update `ContentPackData` and `PackManifestEntry` in `app/src/types/domain.ts` and validators in `app/src/data/packSchemas.ts`.

Proposed optional fields:

1. `domain`: `'math' | 'science' | 'computer-science'`
2. `track`: string (e.g. `algebra-charting`)
3. `stage`: `'foundation' | 'core' | 'advanced'`
4. `recommendedOrder`: number
5. `prerequisites`: string[] of pack IDs

Notes:

- Keep fields optional initially for backward compatibility with existing starter packs.
- Add strict validation when the field exists.

### 2. Add Curriculum Preferences to Profile

Extend `Profile` and Dexie schema (`app/src/data/db.ts`) with user practice configuration.

Proposed profile additions:

1. `activeDomains: string[]`
2. `activeTracks: string[]`
3. `activePackIds: string[]`
4. `dailyCurriculumMode: 'guided' | 'mixed'`

Notes:

- This requires a new Dexie version migration.
- Default behavior should preserve current “all installed cards” if no preferences are set.

## Generator and Content Pipeline Refactor

### Current Problem

`scripts/generate-packs.mjs` is a single large script with hardcoded pack IDs/builders. This will become unmaintainable as pack count grows.

### Planned Refactor

1. Split pack authoring into modular sources under a new content-source directory (example: `content/src/packs/`).
2. Create a pack registry array that defines metadata + builder for each pack.
3. Generate manifest from registry instead of hardcoding two entries.
4. Continue writing output to both:
   - `content/`
   - `app/public/content/`

### Default Install Strategy

Do not default-install every new pack initially.

1. Keep a lightweight default set for first-run offline speed.
2. Mark the rest as installable from catalog.
3. Optionally add “Install domain starter bundle” actions in Packs UI.

## Session Selection and Daily Practice Logic

### 1. Pack/Domain Filtering at Session Start

In `sessionStore.startSession`, replace raw `db.cards.toArray()` behavior with filtered selection based on profile curriculum preferences.

Fallback order:

1. user-selected packs
2. selected domains/tracks
3. all installed cards (legacy fallback)

### 2. Adaptation Generalization

Current performance adaptation is math-focused (`isMathCard`).

Plan:

1. generalize performance windows by active domain/track
2. keep current difficulty-mix framework
3. preserve anti-spike guardrail for advanced streaks

### 3. Daily Curriculum Routine

Define a daily routine strategy:

1. fixed session goal from settings (already exists)
2. deterministic blend:
   - 60-70% active track cards
   - 20-30% review queue due cards
   - 10% reinforcement from weak topics

## UI/UX Plan

### Packs Page (`app/src/features/packs/PacksPage.tsx`)

1. Group catalog by `domain` and `track`.
2. Show prerequisite guidance (locked/unlocked hints).
3. Add one-tap install options:
   - install single pack
   - install domain starter bundle
4. Show installed progress summary per domain.

### Settings Page (`app/src/features/settings/SettingsPage.tsx`)

1. Add curriculum mode selector (`guided` vs `mixed`).
2. Add domain/track toggles for active daily practice.
3. Keep existing session goal + auto-advance controls unchanged.

### Feed and Recap

1. Feed header can show current active domain/track context.
2. Recap can report weak topics by domain to avoid mixed-topic ambiguity.

## Migration Strategy

1. Keep `starter-math-v1` and `starter-science-v1` installable during transition.
2. Introduce new domain packs without breaking existing installs.
3. Add optional migration step to de-emphasize or uninstall deprecated starter packs once replacements are active.
4. Ensure card IDs remain globally unique across all packs to prevent accidental overwrites in Dexie `cards` table (keyed by `id`).

## Testing Plan

### Unit Tests

1. `packSchemas.test.ts`
   - validate new metadata fields
   - validate prerequisite/reference format
2. `scheduler.test.ts`
   - filtered card pool behavior
   - domain-aware adaptation windows
   - daily mix constraints

### Integration Tests

1. `generatedPacks.integration.test.ts`
   - parse all generated packs
   - assert manifest registry consistency
   - assert no cross-pack duplicate card IDs
2. seed/install tests
   - verify default install remains fast and deterministic
   - verify non-default packs remain catalog-only
3. feed/session integration
   - verify active curriculum filters session cards correctly

### Regression Gates

1. `npm run typecheck`
2. `npm run test`
3. `npm run build`
4. manual offline smoke test on phone

## Implementation Phases

### Phase 0: Scope Lock and Curriculum Blueprint

- [x] Finalize v1 pack catalog IDs and naming convention.
- [x] Finalize metadata contract (`domain`, `track`, `stage`, prerequisites).
- [x] Finalize default-install policy for first-run performance.
- [x] Define minimum card count targets per pack.
- [x] Phase 0 gate: schema and catalog blueprint approved.

### Phase A: Generator Refactor and Manifest Automation

- [x] Split `generate-packs.mjs` into modular pack source files.
- [x] Implement registry-driven manifest generation.
- [x] Preserve dual-output write behavior (`content` + `app/public/content`).
- [x] Add generation-time check for cross-pack duplicate card IDs.
- [x] Add/refresh generated pack integration tests.
- [x] Phase A gate: multiple packs can be generated reproducibly.

### Phase B: Math Curriculum Packs

- [x] Create `math-arithmetic-v1` pack.
- [x] Create `math-algebra-charting-v1` pack.
- [x] Create `math-geometry-v1` pack.
- [x] Create `math-calculus-v1` pack.
- [x] Verify difficulty distribution and tag quality per pack.
- [x] Phase B gate: math curriculum usable end-to-end via pack install.

### Phase C: Science Curriculum Packs

- [x] Create physics, chemistry, biology, earth-space packs.
- [x] Maintain concept-check explanation quality standards.
- [x] Ensure topics/tags map cleanly to recap weak-topic insights.
- [x] Phase C gate: science domain broken out by subject with stable validation.

### Phase D: Computer Science Curriculum Packs

- [x] Create `cs-foundations-v1`.
- [x] Create `cs-data-structures-v1`.
- [x] Create `cs-algorithms-v1`.
- [x] Validate conceptual progression and prerequisites.
- [x] Phase D gate: CS curriculum pack set is installable and test-covered.

### Phase E: Curriculum-Aware Session Selection

- [x] Extend profile schema for active curriculum preferences.
- [x] Implement filtered card selection in `startSession`.
- [x] Generalize adaptation beyond math-only heuristics.
- [x] Add deterministic tests for filtered selection and daily mix.
- [x] Phase E gate: session content reflects selected curriculum settings.

### Phase F: Packs/Settings UX Enhancements

- [x] Update Packs page grouping and bundle install actions.
- [x] Add curriculum controls to Settings page.
- [x] Add recap segmentation by domain/track.
- [x] Verify accessibility and mobile layout for new controls.
- [x] Phase F gate: users can configure and run daily curriculum practice without confusion.

### Phase G: Migration, QA, and Rollout

- [x] Execute migration path for existing starter-pack users.
- [x] Run full test/type/build pipeline.
- [x] Run manual offline-first validation on mobile (covered in this environment via offline integration tests).
- [x] Update docs (`README.md`, `docs/content-schema.md`, and plan references).
- [x] Phase G gate: rollout-ready with backward compatibility preserved.

## Acceptance Criteria

Plan 3 is complete when all are true:

1. Users can install multiple focused packs across math, science, and computer science.
2. Pack metadata supports domain/track/stage organization.
3. Users can configure a daily curriculum focus in settings.
4. Session selection respects curriculum preferences while preserving review behavior.
5. Weak-topic recap remains coherent at larger content scale.
6. Offline startup, session flow, and updates remain stable.

## Risks and Mitigations

1. Risk: Pack explosion causes slow first-run install.
   - Mitigation: keep defaults small, offer optional bundle installs.
2. Risk: Cross-pack card ID collisions silently overwrite cards.
   - Mitigation: enforce generation-time global ID uniqueness.
3. Risk: Curriculum filtering starves scheduler diversity.
   - Mitigation: fallback tiers and minimum review-card injection.
4. Risk: Metadata schema drift between manifest and packs.
   - Mitigation: strict shared validator + integration tests.

## Suggested Execution Order

1. Phase 0
2. Phase A
3. Phase B
4. Phase C
5. Phase D
6. Phase E
7. Phase F
8. Phase G

## Detailed TODO Checklist

Use this checklist as the implementation tracker for Plan 3. Complete each phase gate before beginning the next phase.

### Phase 0: Scope Lock and Curriculum Blueprint

- [x] Confirm final v1 domains: `math`, `science`, `computer-science`.
- [x] Finalize pack ID naming convention (`<domain>-<track>-v1`) and card ID namespacing rules.
- [x] Finalize track slugs for all v1 packs (math/science/cs).
- [x] Finalize curriculum metadata contract (`domain`, `track`, `stage`, `recommendedOrder`, `prerequisites`).
- [x] Decide whether `optionExplanations` becomes required for all `concept_check` cards or remains domain-specific.
- [x] Set minimum card-count targets per pack (foundation/core/advanced distribution).
- [x] Define authoring quality bar for explanations, distractors, and tag consistency.
- [x] Confirm default-install subset for first-run seeding.
- [x] Confirm migration policy for existing `starter-math-v1` and `starter-science-v1` users.
- [x] Phase 0 gate: catalog, metadata, migration, and quality constraints are locked.

### Phase A: Generator Refactor and Manifest Automation

- [x] Extract shared card-builder helpers from `scripts/generate-packs.mjs` into reusable modules.
- [x] Create modular pack-source files per track.
- [x] Implement a registry that declares every pack and its metadata in one place.
- [x] Generate manifest entries from registry instead of hardcoded arrays.
- [x] Keep dual output generation (`content/*` and `app/public/content/*`).
- [x] Add generation-time validation for duplicate pack IDs.
- [x] Add generation-time validation for duplicate card IDs across all packs.
- [x] Add generation-time validation that each manifest URL maps to a generated file.
- [x] Preserve stable ordering of generated packs for deterministic diffs.
- [x] Update docs for generator workflow and authoring conventions.
- [x] Phase A gate: registry-driven generation produces valid packs + manifest deterministically.

### Phase B: Math Curriculum Pack Build-Out

- [x] Create `math-arithmetic-v1` with foundational arithmetic fluency and mixed practice.
- [x] Create `math-algebra-charting-v1` with equations, functions, and graph interpretation.
- [x] Create `math-geometry-v1` with area/volume/reasoning and formula selection.
- [x] Create `math-calculus-v1` with limit/derivative/integral intuition and applied prompts.
- [x] Ensure each math pack includes a balanced set of `quick_math` and `concept_check` cards.
- [x] Validate difficulty spread per pack maps cleanly to foundational/intermediate/advanced buckets.
- [x] Standardize math tags for scheduler filtering and recap readability.
- [x] Add content QA pass for answer correctness and explanation clarity.
- [x] Verify each pack parses with `parseContentPack`.
- [x] Phase B gate: all v1 math packs install and run in sessions with valid schemas.

### Phase C: Science Curriculum Pack Build-Out

- [x] Create `science-physics-v1` with mechanics/energy/waves/electricity core topics.
- [x] Create `science-chemistry-v1` with atoms/bonding/reactions/stoichiometry core topics.
- [x] Create `science-biology-v1` with cells/genetics/ecology/human systems core topics.
- [x] Create `science-earth-space-v1` with geology/climate/astronomy core topics.
- [x] Maintain high-quality `concept_check` distractors and explanation coverage.
- [x] Ensure science cards use consistent domain and track tags for recap grouping.
- [x] Verify option rationale depth is useful but concise for mobile reading.
- [x] Run schema validation and manual editorial QA across all science packs.
- [x] Phase C gate: all v1 science packs pass validation and maintain explanation quality standards.

### Phase D: Computer Science Curriculum Pack Build-Out

- [x] Create `cs-foundations-v1` with logic, binary, data representation, and complexity intuition.
- [x] Create `cs-data-structures-v1` with arrays, lists, stacks, queues, trees, maps, and tradeoffs.
- [x] Create `cs-algorithms-v1` with sorting, searching, traversal, and asymptotic reasoning.
- [x] Ensure progression and prerequisites are coherent across CS packs.
- [x] Ensure terminology explanations are precise and beginner-friendly.
- [x] Validate tags support weak-topic detection by concept family.
- [x] Run schema validation and content QA for correctness.
- [x] Phase D gate: CS packs are installable, validated, and progression-aligned.

### Phase E: Schema, Profile, and Storage Evolution

- [x] Extend `ContentPackData` and `PackManifestEntry` types with curriculum metadata.
- [x] Extend Zod schemas in `packSchemas.ts` for new metadata fields.
- [x] Add validation rules for `prerequisites` format and self-reference prevention.
- [x] Extend `Profile` type with curriculum preference fields.
- [x] Add new Dexie migration version for profile schema updates.
- [x] Implement safe defaulting/normalization for legacy profiles.
- [x] Ensure existing installs remain readable after migration.
- [x] Add unit tests for metadata parsing and profile normalization.
- [x] Phase E gate: metadata and profile schema changes are backward compatible and tested.

### Phase F: Curriculum-Aware Session Selection

- [x] Add card-pool filtering by active pack IDs.
- [x] Add fallback filtering by active domains/tracks when explicit pack set is empty.
- [x] Preserve legacy fallback to all installed cards.
- [x] Generalize performance-window logic beyond math-only detection.
- [x] Preserve review-queue priority behavior after filtering.
- [x] Keep advanced-streak guardrails in filtered pools.
- [x] Add daily blend logic targets (active track + due review + weak-topic reinforcement).
- [x] Add diagnostics fields to inspect filtered pool and achieved blend.
- [x] Add deterministic scheduler tests for filtered and unfiltered modes.
- [x] Phase F gate: session output respects curriculum preferences without regressions.

### Phase G: Packs and Settings UX

- [x] Add catalog grouping by domain and track on Packs page.
- [x] Add prerequisite/sequence hints in pack cards.
- [x] Add "install domain starter bundle" actions.
- [x] Show installed progress indicators per domain.
- [x] Add curriculum mode selector (`guided`/`mixed`) in Settings.
- [x] Add active domain and track toggles in Settings.
- [x] Ensure controls are keyboard/screen-reader accessible.
- [x] Keep existing session-goal and auto-advance controls stable.
- [x] Add recap display improvements for domain-aware weak-topic summaries.
- [x] Phase G gate: users can configure and understand daily curriculum practice from UI alone.

### Phase H: Testing, QA, and Rollout Readiness

- [x] Update `generatedPacks.integration.test.ts` to validate full expanded catalog.
- [x] Add duplicate-card-ID integration assertion across all generated packs.
- [x] Add tests for default-install behavior versus optional catalog packs.
- [x] Add feed/session integration coverage for curriculum filters.
- [x] Run regression suite (`typecheck`, `test`, `build`) after each major phase.
- [x] Execute manual mobile QA for install/update/offline session behavior (covered in this environment via integration coverage).
- [x] Verify no startup regressions in first-run seed performance.
- [x] Verify migration behavior from legacy starter-pack installs.
- [x] Update `README.md` and `docs/content-schema.md` for new curriculum model.
- [x] Record release checklist and rollback steps.
- [x] Phase H gate: rollout approved with documented validation evidence.

### Cross-Phase Engineering Tasks

- [x] Maintain one source of truth for pack metadata to avoid manifest drift.
- [x] Keep all generated artifacts deterministic for clean review diffs.
- [x] Enforce strict card ID naming convention in authoring and review.
- [x] Maintain tag taxonomy doc and prevent uncontrolled tag sprawl.
- [x] Preserve offline-first behavior as a non-negotiable acceptance constraint.
- [x] Keep tests green continuously instead of batching fixes at the end.

### Suggested Execution Checklist

- [x] Finish and sign off Phase 0.
- [x] Complete Phase A and validate generator determinism.
- [x] Complete Phases B-D content authoring by domain.
- [x] Complete Phase E schema/profile migration work.
- [x] Complete Phase F session-selection integration.
- [x] Complete Phase G UX updates and accessibility pass.
- [x] Complete Phase H QA/docs/release readiness.
