# Space Fountain Simulator Developer Guide

## Architecture Summary

The app uses a split model:

1. Authoritative physics and energy model in `src/core`.
2. Visual packet simulation and rendering in `src/sim` + `src/render`.

State and actions are managed with Zustand vanilla store in `src/state/store.ts`.

## Module Map

- `core/constants.ts`: constants, limits, defaults.
- `core/types.ts`: strict data contracts.
- `core/physics/*.ts`: analytic, drag, turnaround, energy models.
- `core/model/derive.ts`: central derived-output builder.
- `core/model/formulas.ts`: formula card content generation.
- `core/model/presets.ts`: scenario presets.
- `sim/packetStream.ts`: packet-level stepping loop.
- `render/scene.ts`: Three.js setup and frame rendering.
- `render/tower.ts`: tower and coupler visual geometry.
- `render/pellets.ts`: instanced packet rendering.
- `render/overlays.ts`: force arrows and density line.
- `ui/*`: controls, formula cards, charts, ledger.
- `tests/*`: model and invariant tests.

## Data Flow

1. UI updates `inputs` through store actions.
2. Store recomputes `derived` and `formulas` via `derive()` and `buildFormulaCards()`.
3. Panels and renderer subscribe to store changes.
4. Animation loop steps packets and pushes performance telemetry to store.

## Type Safety Rules

- `strict` TypeScript is enabled.
- `noUncheckedIndexedAccess` is enabled.
- No `any` or `unknown` usage in app code.

## Running Checks

- `npm run typecheck`
- `npm run test:run`
- `npm run build`

## Extending the Physics

To add a new loss model:

1. Extend `Inputs` and `Derived` in `core/types.ts`.
2. Add calculations in `core/model/derive.ts`.
3. Add formula card in `core/model/formulas.ts`.
4. Surface metric in `ui/ledger.ts` and optionally in charts.
5. Add tests for invariants and regression.

## Performance Notes

- Instanced rendering is used for packet stream.
- Fixed simulation timestep is used.
- Drag integration supports Euler and optional RK4 (`inputs.useRk4`).
- Vertical world scaling keeps tall towers visible.
- Default camera mode is locked 2.5D (`viewMode: "locked2d"`), with opt-in free camera (`"free3d"`).
- Adaptive render tiers (`high`, `medium`, `low`) are selected from FPS hysteresis and control:
  - bloom/post-processing,
  - device pixel ratio cap,
  - starfield visibility/intensity,
  - packet simulation cap.
- FPS/sim-time/packet count and active render tier are reported in the top bar.
- The Profiles chart is bounded by a responsive `chart-frame` to prevent height drift as data updates.

## Static Deployment

`vite.config.ts` uses `base: "./"` for relative assets.

Deploy by building:

1. `npm run build`
2. Publish `dist/` assets under target static path.
