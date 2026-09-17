# End-to-end user flows

These specs are the source of truth for "does the UI actually work?".

Pocket Agent runs them with the shared Playwright install in `pi-flow-harness/` (`flows_run`, or the overseer `test:e2e` gate). Do not add `@playwright/test` to this repo.

- Headless Chromium, 1280x800, traces on failure under `e2e/artifacts/`.
- Specs live in `e2e/flows/*.spec.ts` and must keep the header comment (Flow, Story, Preconditions, Steps, Added).
- Do not `test.skip` a failing flow to go green. Fix the product or the spec.
