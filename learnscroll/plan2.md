# LearnScroll Plan 2: UX + Content Revision

## Purpose

This plan updates the current LearnScroll experience based on direct user feedback. It focuses on three changes:

1. Remove awkward self-report controls from the primary action row.
2. Make science explanations teach all answer choices, not just the correct one.
3. Expand math with a stronger mix of difficulty, including more advanced problems.

This is a planning document only. No implementation is performed by this document.

## Feedback To Address

- The `I got it` and `Missed it` buttons feel awkward when always shown near `Reveal`.
- For freeform cards, grading should happen only after reveal.
- After grading, the app should automatically move to the next card.
- Science multiple-choice cards should explain why each option is right/wrong after reveal.
- Math content needs more challenging material while preserving foundational review.

## Product Changes

### 1. Interaction Model: Post-Reveal Grading + Auto-Advance

#### Current Pain Point

The current action bar puts `Reveal`, `I got it`, `Missed it`, and `Next` together even before reveal, which creates cognitive noise and a clunky flow.

#### New UX Rule

- Before reveal:
  - Show only `Reveal` for freeform card types (`quick_math`, `flash_fact` style).
- After reveal:
  - Show grading choices inside the revealed answer panel, not in the global action row.
  - Tapping a grading choice immediately records attempt and auto-advances.
- Remove explicit `Next` requirement for normal flow.

#### New Interaction Behavior by Card Type

- `concept_check` (multiple choice):
  - User taps an option.
  - Correctness is resolved immediately.
  - Reveal panel appears with explanation details.
  - Auto-advance after short delay (configurable, default 1200-1800ms).
- `quick_math` / free-think cards:
  - User taps `Reveal`.
  - Revealed panel shows answer + grading controls:
    - `I got it`
    - `Needs review`
  - Selecting either immediately advances.

#### Accessibility Rules

- Grading controls must remain at least 44px touch target height.
- Auto-advance must be cancellable or pauseable via setting for accessibility users.
- Announce reveal and grading result with screen-reader live region.

### 2. Science Explanations: Teach Every Option

#### Current Pain Point

The reveal currently emphasizes the correct option but does not teach why distractors are wrong (example: Newton's laws).

#### New Content Requirement

For all `concept_check` cards, post-reveal must include:

- Correct answer summary
- Option-by-option rationale block:
  - each option label
  - whether correct or incorrect
  - short explanation (1-2 sentences)

#### Content Schema Addition

Add per-option explanation support:

```json
{
  "id": "science_cc_1",
  "type": "concept_check",
  "prompt": "Which law describes inertia?",
  "options": ["First law", "Second law", "Third law", "Law of gravitation"],
  "answer": "First law",
  "optionExplanations": {
    "First law": "Correct. It states an object remains at rest or in uniform motion unless acted on by net force.",
    "Second law": "Incorrect here. This law relates net force to acceleration (F = ma).",
    "Third law": "Incorrect here. This law describes action-reaction force pairs.",
    "Law of gravitation": "Incorrect for inertia. It describes attraction between masses."
  }
}
```

#### Content Quality Standard

- Every distractor must be pedagogically meaningful (not obviously wrong filler).
- Explanations should clarify common confusion points.
- Explanations should avoid repeating the same generic sentence template.

### 3. Math Content: Mixed Difficulty With Real Challenge

#### Current Pain Point

The current set is solid for basics but underrepresents multi-step and advanced practice.

#### New Math Scope

Keep fundamentals but add intermediate and advanced cards in each session stream.

#### Target Difficulty Mix

Default session mix target:

- 40% foundational (arithmetic/algebra basics)
- 35% intermediate (multi-step, fractions, proportions, equations)
- 25% advanced (word problems, systems, exponents/logs, geometry reasoning, probability)

#### Adaptive Adjustment Rule

- If user accuracy > 80% in last 30 math attempts:
  - increase intermediate/advanced share by +10% combined.
- If user accuracy < 55%:
  - increase foundational share and inject scaffolded review cards.

#### New Math Content Categories

- Multi-step arithmetic chains
- Ratio/proportion and percent change applications
- Equation solving with distribution and variables on both sides
- Geometry problems requiring formula selection + substitution
- Probability/combinatorics basics
- Algebraic manipulation and exponent rules in context

## Technical Plan Updates

### Data Model Updates

- Add optional `optionExplanations` to concept-check cards.
- Add optional metadata for display pacing:
  - `autoAdvanceMs` per card or per type default.
- Expand difficulty usage to enforce target distribution in scheduler.

### Scheduler Updates

- Incorporate difficulty-bucket balancing in session generation.
- Keep existing review-priority logic, then apply difficulty mix constraints.
- Avoid consecutive advanced cards unless user confidence supports it.

### UI Updates

- Redesign action row:
  - pre-reveal minimal controls
  - post-reveal in-context grading module
- Add reveal explanation panel section for option-by-option analysis.
- Add optional settings toggle:
  - `Auto-advance after grading` (default ON)

## Implementation Phases

### Phase A: UX Interaction Refactor

- Remove always-visible `I got it` / `Missed it` / `Next` row logic.
- Add post-reveal grading module for freeform cards.
- Add automatic progression on grading selection.
- Add auto-advance timer for multiple-choice reveal state.

### Phase B: Schema + Renderer Enhancements

- Extend card schema with `optionExplanations`.
- Add schema validation rules for concept-check cards:
  - all listed options must have explanation entries.
- Update card renderer to show option rationale list after reveal.

### Phase C: Content Expansion Pass

- Rewrite science concept-check cards to include per-option explanations.
- Expand math pack with intermediate/advanced content.
- Rebalance pack difficulties to match target distribution.

### Phase D: Scheduler + Adaptation Update

- Add difficulty-bucket balancing to selection algorithm.
- Add lightweight performance-based difficulty shift.
- Add guardrails to prevent abrupt difficulty spikes.

### Phase E: QA and Acceptance

- Verify freeform grading only appears post-reveal.
- Verify grading tap always advances without extra `Next` press.
- Verify concept-check reveal includes all option explanations.
- Verify at least 25% advanced math appears in default mix.
- Verify adaptive shift behavior at high/low accuracy thresholds.

## Acceptance Criteria

The revision is done when all are true:

1. Freeform cards no longer show grading buttons before reveal.
2. Post-reveal grading controls are in the revealed answer module.
3. Grading selection auto-advances every time.
4. Concept-check science cards include explanation for each option.
5. Math sessions include a visible mix of basic/intermediate/advanced difficulty.
6. Difficulty adapts smoothly from recent user performance.

## Risks and Mitigations

- Risk: Auto-advance feels too fast for some users.
  - Mitigation: expose configurable delay and a disable toggle.
- Risk: Option-by-option explanations make cards too verbose.
  - Mitigation: enforce concise explanation limit and collapsible section.
- Risk: Harder math reduces engagement for new users.
  - Mitigation: adaptive distribution and scaffolded review insertion.

## Proposed Next Step After This Plan

Execute Phase A and Phase B first, then run a content pass in Phase C before enabling full adaptive difficulty logic in Phase D.

## Detailed TODO Checklist

Use this checklist as the implementation tracker for Plan 2. Complete each phase gate before beginning the next phase.

### Phase 0: Design Alignment and Scope Lock

- [x] Confirm final UX decision: no pre-reveal self-report controls for freeform cards.
- [x] Confirm post-reveal grading labels (`I got it`, `Needs review`) and placement inside reveal panel.
- [x] Confirm auto-advance policy by card type (`concept_check` delay vs freeform immediate).
- [x] Confirm default auto-advance delay target range (1200-1800ms) and final default value.
- [x] Confirm accessibility requirement for pause/disable auto-advance.
- [x] Confirm acceptance metrics for “mixed math difficulty” in real sessions.
- [x] Finalize copy guidelines for option-by-option explanations.
- [x] Phase 0 gate: UX behavior, defaults, and success criteria are explicitly approved.

### Phase A: UX Interaction Refactor (Post-Reveal Grading + Auto-Advance)

- [x] Remove pre-reveal `I got it` / `Missed it` controls from global action row.
- [x] Remove dependence on explicit `Next` button in normal card flow.
- [x] Keep `Reveal` as the only pre-reveal action for freeform card types.
- [x] Add in-reveal grading controls for freeform cards.
- [x] Wire grading tap to immediately persist result and trigger next-card transition.
- [x] Add auto-advance timer behavior for `concept_check` after reveal state appears.
- [x] Add safe handling for user tapping rapidly (debounce/lock to avoid duplicate submissions).
- [x] Preserve swipe-up compatibility with the new flow.
- [x] Add setting toggle: `Auto-advance after grading` (default ON).
- [x] Add setting input for auto-advance delay (bounded min/max).
- [x] Add screen-reader live announcement for reveal and result events.
- [x] Validate touch target sizing and spacing for grading controls.
- [x] Phase A gate: freeform cards grade only post-reveal and always auto-advance after selection.

### Phase B: Schema and Renderer Enhancements (Option Explanations)

- [x] Extend card type definition with optional `optionExplanations` map.
- [x] Extend schema validation rules for `concept_check` cards.
- [x] Require `optionExplanations` presence for science concept-check packs (or globally by policy).
- [x] Validate every listed option has a corresponding explanation key.
- [x] Validate no explanation keys exist for options not present in the card.
- [x] Validate minimum explanation quality constraints (non-empty, bounded length).
- [x] Update renderer to display option-by-option rationale after reveal.
- [x] Add clear visual distinction for correct option vs distractors in rationale block.
- [x] Add compact mode / collapsible rationale section for long explanation sets.
- [x] Ensure rationale rendering works offline from cached content.
- [x] Phase B gate: concept-check reveal consistently shows meaningful per-option explanations.

### Phase C: Content Expansion Pass (Science + Harder Math)

- [x] Inventory existing science `concept_check` cards and mark missing rationale coverage.
- [x] Rewrite all science concept-check cards to include complete `optionExplanations`.
- [x] Add confusion-focused explanation content for high-miss topics (Newton laws, forces, energy, etc.).
- [x] Audit distractor quality to remove weak/filler options.
- [x] Add intermediate math cards (multi-step, fractions, proportions, variable equations).
- [x] Add advanced math cards (systems, exponents/logs context, geometry reasoning, probability).
- [x] Assign balanced and realistic difficulty values for new cards.
- [x] Rebalance pack-level difficulty distribution to 40/35/25 target.
- [x] Run schema validation against all updated packs.
- [x] Run editorial QA pass for clarity, correctness, and explanation usefulness.
- [x] Phase C gate: science cards teach all options; math library includes meaningful advanced depth.

### Phase D: Scheduler and Adaptation Update

- [x] Add difficulty-bucket aware selection logic (foundational/intermediate/advanced).
- [x] Implement session-level target mix enforcement (40/35/25 baseline).
- [x] Preserve review-priority behavior while applying difficulty constraints.
- [x] Add “no sudden spike” guardrail (limit consecutive advanced cards).
- [x] Add recent-performance window for math attempts (last 30 attempts).
- [x] Add adaptive shift rule when performance >80% (increase harder share).
- [x] Add adaptive shift rule when performance <55% (increase foundational + scaffolded review).
- [x] Add telemetry/state fields needed to inspect adaptation behavior.
- [x] Add deterministic tests for scheduler distribution behavior.
- [x] Phase D gate: live session selection reflects target mix and adapts smoothly by performance.

### Phase E: QA, Acceptance, and Rollout Readiness

- [x] Verify freeform pre-reveal UI only shows `Reveal`.
- [x] Verify freeform post-reveal grading tap always triggers next card with no extra button press.
- [x] Verify concept-check cards auto-advance after configured delay.
- [x] Verify disabling auto-advance in settings changes behavior immediately.
- [x] Verify every science concept-check card displays option-by-option rationale.
- [x] Verify rationale content remains readable on small phone screens.
- [x] Verify session math difficulty mix in sampled sessions meets target tolerance.
- [x] Verify adaptation shifts difficulty in expected direction for high/low accuracy cohorts.
- [x] Verify no regression in offline boot, cached content use, and persistence.
- [x] Verify no duplicate attempt logs due to auto-advance timing.
- [x] Verify recap metrics still reflect actual graded outcomes.
- [x] Run full regression: typecheck, tests, build, and manual mobile QA script.
- [x] Phase E gate: all acceptance criteria pass and rollout decision is approved.

### Cross-Phase Engineering Tasks

- [x] Add migration plan for schema changes (`optionExplanations`) with backward compatibility rules.
- [x] Add fallback UI behavior when legacy cards lack option explanations.
- [x] Update seed/import scripts to support new schema fields.
- [x] Update content authoring template to include option rationale requirements.
- [x] Update docs for interaction flow and settings behavior.
- [x] Update test fixtures to include new card shape examples.
- [x] Record architecture note for adaptation strategy and guardrails.

### Test Matrix TODO

- [x] Unit tests for schema rules around `optionExplanations`.
- [x] Unit tests for auto-advance timing and lock behavior.
- [x] Unit tests for scheduler difficulty distribution logic.
- [x] Unit tests for adaptation thresholds (>80%, <55%).
- [x] Integration test: freeform reveal -> grade -> auto-advance.
- [x] Integration test: concept-check answer -> reveal rationale -> timed auto-advance.
- [x] Integration test: offline mode still renders rationale content.
- [x] Integration test: settings toggle disables auto-advance.
- [x] Manual QA on iOS Safari standalone mode.
- [x] Manual QA on Android Chrome standalone mode.

### Suggested Execution Order

1. Finish Phase 0 and lock behavior decisions.
2. Execute Phase A interaction changes.
3. Execute Phase B schema/renderer updates.
4. Execute Phase C content rewrite and expansion.
5. Execute Phase D scheduler/adaptation logic.
6. Execute Phase E QA and acceptance sign-off.
