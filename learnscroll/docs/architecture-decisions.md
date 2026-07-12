# Architecture Decisions

## ADR-001 State Management

Decision: `zustand` for app/session state.

Reason:
- lightweight API
- simple async actions
- minimal boilerplate for MVP

## ADR-002 Offline Storage

Decision: Dexie over raw IndexedDB.

Reason:
- typed schema and migrations
- concise transaction APIs
- clear table/query ergonomics

## ADR-003 PWA Strategy

Decision: `vite-plugin-pwa` generateSW mode.

Reason:
- manifest + service worker integrated into Vite build
- straightforward runtime caching rules
- update prompts via `virtual:pwa-register`

## ADR-004 Content Distribution

Decision: manifest + pack JSON model.

Reason:
- supports optional update checks
- allows modular topic packs
- enables strict schema validation before install

## ADR-005 Adaptive Difficulty Buckets

Decision: scheduler enforces foundational/intermediate/advanced bucket targets with adaptive shifts.

Reason:
- baseline target mix is 40/35/25 for balanced challenge
- last-30 math attempt accuracy shifts targets (>80% raises harder share, <55% increases foundational share)
- guardrail limits advanced streaks to avoid abrupt difficulty spikes
- diagnostics expose selected vs target mix for inspection and QA

## ADR-006 Post-Reveal Grading Flow

Decision: freeform grading controls live inside reveal panel; concept checks auto-advance after reveal delay.

Reason:
- removes pre-reveal control clutter from the global action row
- keeps grading action contextual to revealed answer
- supports accessibility via auto-advance toggle and configurable delay
