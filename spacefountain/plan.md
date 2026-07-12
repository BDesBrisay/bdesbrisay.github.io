# Space Fountain Simulator Plan

## Purpose

Build a static, browser-based Three.js/WebGL simulator that teaches how a space fountain works through:

1. Real-time physics calculations (momentum, force, velocity, power, losses)
2. Visualized pellet flow and force transfer in 3D
3. Live math surfacing with substituted values and plain-English explanations
4. A neon cyberpunk UI that stays readable and instructional

This is a planning document only. No implementation is performed by this document.

## Product Goals

1. Make the core intuition obvious: `mass flow -> momentum change -> support force`.
2. Show whether a chosen configuration can support a target load (`support margin`).
3. Show where power is consumed, recovered, and lost in an always-visible energy ledger.
4. Keep the experience interactive, fast, and understandable for non-specialists.
5. Keep architecture modular so later upgrades (drag, losses, distributed couplers) do not require rewrites.

## Non-Goals (Initial Scope)

1. Full atmospheric or orbital mechanics model.
2. Structural finite-element analysis of the tower.
3. Hardware-accurate electromagnetic accelerator modeling.
4. Multiplayer/cloud features.

## Audience and Learning Flow

Primary audience: technically curious users, students, engineers, and sci-fi enthusiasts.

Learning flow on first load:

1. User picks a preset (`Barely Stable`, `Balanced`, `Aggressive`).
2. User sees top-level status: `Support Margin`, `Net Power`, `v_top`.
3. User drags a slider (`H`, `mdot`, `v0`, `loadMass`) and immediately sees force and power changes.
4. User opens formula cards to inspect exactly how each number was computed.
5. User toggles realism (`drag`, `lossy turnaround`) and compares results against baseline.

## Simulation Architecture

Use two synchronized layers:

1. **Authoritative math layer (1D model)**
   - Computes derived values and chart data.
   - Drives HUD, formula cards, and energy ledger.
2. **Visual layer (3D packet stream)**
   - Uses packetized pellets and instanced rendering for performance.
   - Mirrors the math layer state for intuitive visuals.

This split keeps physics explainable and rendering smooth.

## Physics Model (Phase 1 Baseline)

Assume vertical axis `z`, gravity `g = 9.81 m/s^2`, no drag for baseline.

### Required Injection Speed

To reach height `H`:

`v0 >= sqrt(2 g H)`

### Pellet Speed vs Height

`v(z) = sqrt(max(0, v0^2 - 2 g z))`

`z_max = v0^2 / (2 g)`

`v_top = v(H)` when `H <= z_max`, otherwise configuration is invalid/unstable.

### Momentum Flux and Turnaround Force

`F_turn = mdot * DeltaV`

For ideal reversal from `+v_top` to `-v_top`:

`F_turn = 2 mdot v_top`

### Support Condition

`loadWeight = loadMass * g`

`supportMargin = (F_turn - loadWeight) / loadWeight`

Interpretation:

1. `supportMargin > 0`: can support load
2. `supportMargin = 0`: exactly balanced
3. `supportMargin < 0`: insufficient lift

### Power and Energy Ledger

`P_in = 0.5 * mdot * v0^2`

`P_grav = mdot * g * H`

`P_rec = etaRec * mdot * g * H` (baseline recovery model)

`P_net = P_in - P_rec - P_drag - P_turnLoss`

Phase 1 uses `P_drag = 0`, `P_turnLoss = 0` in ideal mode.

## Extended Physics (Phase 3+)

### Drag

`F_d = 0.5 * rho * Cd * A * v^2`, where `A = pi * r^2`

1D acceleration:

`dv/dt = -g - (F_d / m_packet) * sign(v)`

Integrate numerically (semi-implicit Euler first, RK4 optional upgrade).

### Turnaround Modes

1. `idealReverse`: `v_out = -v_in`
2. `lossyReverse`: `v_out = -v_in * (1 - turnaroundLossFraction)`
3. `stopAndDrop`: decelerate near zero then free-fall/re-accelerate downward

Each mode contributes different impulse profile and loss term.

## State and Data Contracts

```ts
export type Inputs = {
  H: number;                 // m
  v0: number;                // m/s
  mdot: number;              // kg/s
  loadMass: number;          // kg
  etaRec: number;            // 0..1
  turnaroundMode: "idealReverse" | "lossyReverse" | "stopAndDrop";
  turnaroundLossFraction: number; // 0..1
  dragEnabled: boolean;
  pelletRadius: number;      // m
  Cd: number;
  rho: number;               // kg/m^3
  packetDt: number;          // s
};
```

```ts
export type Derived = {
  g: number;
  zMax: number;
  vTop: number;
  forceTurn: number;
  loadWeight: number;
  supportMargin: number;

  P_in: number;
  P_grav: number;
  P_rec: number;
  P_drag: number;
  P_turnLoss: number;
  P_net: number;

  isReachable: boolean;
  warnings: string[];

  zSamples: Float32Array;
  vSamples: Float32Array;
  fSamples: Float32Array;
};
```

## Suggested Project Structure

```text
spacefountain/
  plan.md
  app/
    index.html
    package.json
    vite.config.ts
    src/
      main.ts
      styles/
        theme.css
      core/
        constants.ts
        physics/
          analytic.ts
          dragIntegrator.ts
          turnaround.ts
          energy.ts
        model/
          derive.ts
          presets.ts
      sim/
        packetStream.ts
      render/
        scene.ts
        pellets.ts
        tower.ts
        overlays.ts
      ui/
        controls.ts
        formulaCards.ts
        ledger.ts
        charts.ts
      state/
        store.ts
      tests/
        physics.test.ts
        energy.test.ts
        invariants.test.ts
```

## Core Module Plan

### 1) `core/physics/analytic.ts`

```ts
import { G } from "../constants";

export function zMax(v0: number): number {
  return (v0 * v0) / (2 * G);
}

export function vAtZ(v0: number, z: number): number {
  const term = v0 * v0 - 2 * G * z;
  return term > 0 ? Math.sqrt(term) : 0;
}

export function requiredV0(H: number): number {
  return Math.sqrt(2 * G * H);
}

export function turnaroundForceIdeal(mdot: number, vTop: number): number {
  return 2 * mdot * vTop;
}
```

### 2) `core/model/derive.ts`

```ts
import { G } from "../constants";
import { vAtZ, zMax, turnaroundForceIdeal } from "../physics/analytic";

export function deriveBaseline(inputs: Inputs): Derived {
  const topReach = zMax(inputs.v0);
  const isReachable = topReach >= inputs.H;
  const vTop = isReachable ? vAtZ(inputs.v0, inputs.H) : 0;
  const forceTurn = turnaroundForceIdeal(inputs.mdot, vTop);
  const loadWeight = inputs.loadMass * G;
  const supportMargin =
    loadWeight > 0 ? (forceTurn - loadWeight) / loadWeight : 0;

  const P_in = 0.5 * inputs.mdot * inputs.v0 * inputs.v0;
  const P_grav = inputs.mdot * G * inputs.H;
  const P_rec = inputs.etaRec * P_grav;

  return {
    g: G,
    zMax: topReach,
    vTop,
    forceTurn,
    loadWeight,
    supportMargin,
    P_in,
    P_grav,
    P_rec,
    P_drag: 0,
    P_turnLoss: 0,
    P_net: P_in - P_rec,
    isReachable,
    warnings: isReachable ? [] : ["v0 is too low to reach H"],
    zSamples: new Float32Array(),
    vSamples: new Float32Array(),
    fSamples: new Float32Array(),
  };
}
```

### 3) `sim/packetStream.ts`

```ts
export type Packet = {
  id: number;
  mass: number;
  z: number;
  v: number;
  direction: 1 | -1;
};

export function spawnPacket(now: number, inputs: Inputs): Packet {
  return {
    id: now,
    mass: inputs.mdot * inputs.packetDt,
    z: 0,
    v: inputs.v0,
    direction: 1,
  };
}
```

### 4) Math Card Contract

```ts
export type FormulaCard = {
  id: string;
  title: string;
  latex: string;
  substitutions: Array<{ label: string; value: string }>;
  result: string;
  plainEnglish: string;
  source: "analytic" | "integrated" | "input" | "constant";
};
```

## Rendering Plan (Three.js)

### Scene Elements

1. Tower guide tube (transparent neon material)
2. Turnaround head assembly (stylized torus + coil meshes)
3. Pellet stream (InstancedMesh spheres or additive point sprites)
4. Force vectors (glowing arrows, thickness mapped to force)
5. Load platform with weight indicator
6. Starfield and volumetric haze

### Frame Loop Strategy

1. Fixed-step simulation update at `60 Hz` (or `120 Hz` when drag enabled)
2. Render at monitor FPS
3. Interpolate packet positions between simulation ticks for smoothness

```ts
const FIXED_DT = 1 / 60;
let acc = 0;
let last = performance.now();

function frame(now: number) {
  const dt = (now - last) / 1000;
  last = now;
  acc += dt;

  while (acc >= FIXED_DT) {
    sim.step(FIXED_DT);
    acc -= FIXED_DT;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
```

## UI/UX Plan (Easy to Understand)

## Screen Layout

1. Center: 3D sim viewport (primary attention)
2. Left rail: controls + presets
3. Right rail: formula cards + charts
4. Bottom bar: energy ledger tiles
5. Top strip: status badges (`Stable`, `Near Limit`, `Unstable`)

## Always-Visible Teaching Signals

1. `Support Margin` meter (largest numeric display)
2. `Force vs Weight` side-by-side comparison
3. `Net Power` and `Efficiency` in bottom ledger
4. Reachability warning if `v0 < sqrt(2gH)`

## Explainability Mechanics

1. Hover a metric to highlight upstream formula cards.
2. Hover a formula to pulse related 3D element (e.g., top turnaround arrow).
3. Show short "why this changed" hints after slider movement.

Example hint:

`Increasing mdot raises momentum flux, so turnaround force scales linearly.`

## Cyberpunk Theme System

Use design tokens for consistent styling:

```css
:root {
  --bg-0: #05070d;
  --bg-1: #0a1020;
  --panel: rgba(10, 18, 36, 0.62);
  --line: rgba(80, 245, 255, 0.35);
  --text: #c7f7ff;
  --muted: #6ba9b5;
  --cyan: #4ff5ff;
  --magenta: #ff3dc8;
  --amber: #ffb347;
  --danger: #ff4d6d;
  --ok: #30f2a0;
  --glow-cyan: 0 0 24px rgba(79, 245, 255, 0.45);
  --glow-magenta: 0 0 24px rgba(255, 61, 200, 0.35);
}
```

Theme principles:

1. High contrast text, restrained bloom on UI text
2. Bright neon only for semantic emphasis
3. Motion tied to meaning (force pulses, energy flow), not decorative noise

## Charts and Math Surfacing

Required charts:

1. `v(z)` velocity vs height
2. `F(z)` or force-relevant profile
3. Power stack (`P_in`, `P_rec`, losses, `P_net`)

Formula card example:

```ts
const turnForceCard: FormulaCard = {
  id: "turn-force",
  title: "Turnaround Force",
  latex: "F_{turn} = 2 \\dot{m} v_{top}",
  substitutions: [
    { label: "\\dot{m}", value: "1200\\,kg/s" },
    { label: "v_{top}", value: "3100\\,m/s" }
  ],
  result: "7.44\\,MN",
  plainEnglish: "The turnaround assembly provides 7.44 mega-newtons upward.",
  source: "analytic",
};
```

## Presets (Onboarding)

Provide at least five presets:

1. `Barely Stable`: margin just above `0%`
2. `Balanced`: comfortable positive margin, moderate power
3. `High Throughput`: high `mdot`, high support, high energy cost
4. `Efficient Regen`: moderate support, high `etaRec`
5. `Failure Case`: intentionally unstable for teaching

Each preset includes a short explanation and highlighted metric.

## Implementation Phases

### Phase 0: Scaffold

1. Create Vite + TypeScript app in `spacefountain/app`.
2. Add Three.js, KaTeX, charting package, state store.
3. Build layout shell and theme tokens.

### Phase 1: Explainable Core (No Drag)

1. Implement baseline analytic model and derived metrics.
2. Render tower + packet stream + turnaround force arrow.
3. Build controls for `H`, `v0`, `mdot`, `loadMass`.
4. Add support margin meter and reachability warnings.
5. Add formula cards with substituted values.

Phase 1 acceptance:

1. Adjusting sliders updates 3D + math + charts in real time.
2. Formula values match model outputs exactly.
3. Stable/unstable state changes are obvious.

### Phase 2: Energy Ledger + Teach Mode

1. Add `P_in`, `P_grav`, `P_rec`, `P_net` tiles.
2. Add "Where does the energy go?" slow-motion mode.
3. Add preset panel and explanatory onboarding tips.

Phase 2 acceptance:

1. Every power term has a formula card and source tag.
2. Net power updates correctly with input changes.
3. Teach mode visibly transfers energy between subsystems.

### Phase 3: Drag and Numerical Integration

1. Add drag controls (`Cd`, `rho`, `pelletRadius`) and toggle.
2. Integrate packet kinematics numerically.
3. Accumulate drag work into `P_drag`.
4. Add analytic vs integrated comparison display.

Phase 3 acceptance:

1. Drag-on behavior differs predictably from drag-off baseline.
2. Power ledger shows non-zero `P_drag`.
3. Numeric integration remains stable over long runtime.

### Phase 4: Turnaround Realism

1. Implement all turnaround modes and losses.
2. Compute `P_turnLoss` and impulse profile.
3. Visualize turnaround stress/force spikes.

Phase 4 acceptance:

1. Mode switching changes force and power in expected direction.
2. Lossy modes increase net power demand.
3. Visualization clearly shows where losses occur.

### Phase 5: Optional Advanced Couplers

1. Add distributed momentum-exchange segments.
2. Display force density heatmap along tower.
3. Add simplified stress warning indicator.

## Testing and Validation Plan

### Unit Tests

1. Analytic identities (`zMax`, `requiredV0`, `vAtZ`)
2. Support margin calculations
3. Power ledger consistency
4. Turnaround mode calculations

### Property / Invariant Tests

1. Increasing `mdot` should not decrease `F_turn` (other inputs fixed)
2. Increasing `H` at fixed `v0` should not increase `v_top`
3. `P_net` equals ledger balance equation within tolerance

### Visual/UX Checks

1. Mobile and desktop layout sanity
2. Color-contrast checks for text and status states
3. FPS target (`>= 55` on common laptop at default settings)

### Scientific Sanity Checks

1. Cross-check selected outputs against spreadsheet and independent script.
2. Include a `validation.md` later with hand-worked examples.

## Performance Budgets

1. Initial load JS target: `< 500 KB` gzipped (excluding optional high-res assets)
2. Default rendered packets: `<= 8000`
3. Draw calls target: `< 50`
4. Simulation step budget: `< 4 ms` on baseline machine

## Accessibility and Clarity Requirements

1. Keyboard-operable controls and toggles
2. Reduced-motion mode to disable non-essential effects
3. Tooltips and labels for every slider with units
4. Avoid unexplained acronyms in primary UI

## Static Site Deployment Plan

If hosted directly in this repo on GitHub Pages:

1. Build app to `spacefountain/dist`.
2. Deploy built assets under `spacefountain/` (or `spacefountain/app/dist` copied to a served folder).
3. Ensure relative asset paths (`base: "./"` in Vite if needed).

Example Vite base config:

```ts
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
});
```

## Risks and Mitigations

1. **Risk:** Physics feels abstract.
   - **Mitigation:** Keep force margin meter and formula cards always visible.
2. **Risk:** Neon style hurts readability.
   - **Mitigation:** strict contrast tokens and limited bloom on text layers.
3. **Risk:** Over-complex controls overwhelm users.
   - **Mitigation:** basic and advanced control groups, plus presets.
4. **Risk:** Numerical instability with drag.
   - **Mitigation:** fixed timestep and clamp safeguards.

## Definition of Done (Initial Release)

1. User can configure a fountain and see if it supports target load.
2. User can inspect exactly how force and power were computed.
3. User can switch between ideal and lossy behavior.
4. UI communicates status instantly and remains responsive.
5. Site runs as static assets without backend dependencies.

## Detailed TODO Checklist (Execution Tracker)

Use this as the implementation tracker. Check items only when verified complete.

### Phase 0: Scaffold and Foundations

- [x] `P0-01` Create `spacefountain/app` with Vite + TypeScript template.
- [x] `P0-02` Add dependencies: `three`, `katex`, chart library, state library, and test tools.
- [x] `P0-03` Configure Vite for static hosting (`base: "./"`).
- [x] `P0-04` Create base folder structure from the plan (`core`, `sim`, `render`, `ui`, `state`, `tests`, `styles`).
- [x] `P0-05` Add app entrypoint and empty shell layout regions (center viewport, left controls, right math/charts, bottom ledger).
- [x] `P0-06` Implement CSS design tokens for cyberpunk neon palette.
- [x] `P0-07` Add typography and spacing scale with readable defaults.
- [x] `P0-08` Add reduced-motion media query foundation.
- [x] `P0-09` Add lint/typecheck/test scripts in `package.json`.
- [x] `P0-10` Add initial README for local run/build instructions.
- [x] `P0-11` Smoke test: app starts, layout renders, no runtime errors.

Phase 0 exit criteria:

1. App boots cleanly with build and dev scripts working.
2. Layout scaffold and theme tokens are in place.
3. Repository structure supports modular implementation.

### Phase 1: Explainable Core (No Drag)

- [x] `P1-01` Create constants module (`G`, unit helpers).
- [x] `P1-02` Implement analytic physics functions (`zMax`, `vAtZ`, `requiredV0`, ideal turnaround force).
- [x] `P1-03` Implement derived model builder that computes baseline outputs from inputs.
- [x] `P1-04` Add sampled profile generator for chart arrays (`zSamples`, `vSamples`, `fSamples`).
- [x] `P1-05` Define input defaults and bounds (safe slider ranges with units).
- [x] `P1-06` Implement global state store for inputs and derived outputs.
- [x] `P1-07` Wire re-computation pipeline (`inputs change -> derive -> UI/scene refresh`).
- [x] `P1-08` Build left-panel controls for `H`, `v0`, `mdot`, `loadMass`, `etaRec`.
- [x] `P1-09` Add top status strip (`Stable`, `Near Limit`, `Unstable`) from support margin thresholds.
- [x] `P1-10` Add always-visible support margin meter with color-coded states.
- [x] `P1-11` Add reachability warning for `v0 < sqrt(2gH)`.
- [x] `P1-12` Build initial formula-card component with LaTeX and substitution rows.
- [x] `P1-13` Populate formula cards for reachability, turnaround force, load weight, and support margin.
- [x] `P1-14` Add right-panel charts for `v(z)` and force-related profile.
- [x] `P1-15` Implement basic Three.js scene (camera, light, renderer, resize handling).
- [x] `P1-16` Render tower and turnaround assembly placeholders.
- [x] `P1-17` Implement packet stream visuals (spawn, move, recycle) using instancing.
- [x] `P1-18` Add turnaround force arrow scaled to `F_turn`.
- [x] `P1-19` Verify formulas displayed match computed values exactly.
- [x] `P1-20` Add manual validation scenario with known numbers and expected outputs.

Phase 1 exit criteria:

1. Slider changes update 3D view, charts, and math cards in real time.
2. Support status changes clearly at correct thresholds.
3. Core no-drag model is stable and explainable.

### Phase 2: Energy Ledger and Teachability Enhancements

- [x] `P2-01` Implement energy terms (`P_in`, `P_grav`, `P_rec`, `P_net`) in derive layer.
- [x] `P2-02` Add bottom ledger UI tiles with units and sign conventions.
- [x] `P2-03` Add formula cards for every displayed power metric.
- [x] `P2-04` Add source/provenance badge on each metric (`input`, `constant`, `analytic`, `integrated`).
- [x] `P2-05` Build preset data model and define at least five presets.
- [x] `P2-06` Implement preset selector with short explanation text.
- [x] `P2-07` Add "Why this changed" inline hints after slider interactions.
- [x] `P2-08` Implement "Where does the energy go?" teach mode toggle.
- [x] `P2-09` Teach mode: slow-time playback and energy-state visual cue on packets.
- [x] `P2-10` Teach mode: highlight transfer between kinetic, gravity, recovery, and losses.
- [x] `P2-11` Add chart tab for power stack view.
- [x] `P2-12` Add metric hover linking (`hover metric -> highlight related formula + scene element`).
- [x] `P2-13` Validate sign and units consistency across ledger and cards.

Phase 2 exit criteria:

1. Energy ledger is complete, legible, and numerically consistent.
2. Presets help users quickly understand stable vs unstable regimes.
3. Teach mode communicates energy flow without ambiguity.

### Phase 3: Drag and Numerical Integration

- [x] `P3-01` Add drag controls (`dragEnabled`, `Cd`, `rho`, `pelletRadius`) to input schema and UI.
- [x] `P3-02` Implement cross-sectional area and drag force helper functions.
- [x] `P3-03` Implement semi-implicit Euler integrator for 1D packet motion with drag.
- [x] `P3-04` Add integrator guards (velocity clamps, non-NaN checks, step sanity checks).
- [x] `P3-05` Integrate packet update loop with drag on/off branch.
- [x] `P3-06` Track per-step drag work and aggregate into `P_drag`.
- [x] `P3-07` Add optional RK4 integrator behind feature flag for comparison.
- [x] `P3-08` Add analytic vs integrated delta display for key metrics.
- [x] `P3-09` Add chart overlays for no-drag baseline vs drag-enabled outputs.
- [x] `P3-10` Add warnings when drag makes target height unreachable.
- [x] `P3-11` Run long-duration stability pass (10+ minutes) for numeric drift checks.
- [x] `P3-12` Tune timestep and packet count for stability/performance balance.

Phase 3 exit criteria:

1. Drag mode behaves predictably and remains numerically stable.
2. `P_drag` is non-zero and reflected in `P_net`.
3. Users can clearly compare idealized and drag-affected behavior.

### Phase 4: Turnaround Realism and Losses

- [x] `P4-01` Implement turnaround mode switch in model and UI.
- [x] `P4-02` Implement `idealReverse` turnaround boundary behavior.
- [x] `P4-03` Implement `lossyReverse` with configurable loss fraction.
- [x] `P4-04` Implement `stopAndDrop` model behavior and impulse logic.
- [x] `P4-05` Compute `DeltaV` and force for each turnaround mode.
- [x] `P4-06` Implement turnaround loss accounting (`P_turnLoss`) in ledger.
- [x] `P4-07` Add mode-specific formula cards and explanations.
- [x] `P4-08` Visualize turnaround impulse intensity in the 3D head assembly.
- [x] `P4-09` Add comparative mode view (current mode vs ideal reference).
- [x] `P4-10` Add thermal/loss indicator widget for non-ideal modes.
- [x] `P4-11` Validate monotonic expectation: higher losses should not reduce required input power.

Phase 4 exit criteria:

1. All turnaround modes are functional and clearly differentiated.
2. Loss terms appear in both formulas and ledger.
3. Visual effects align with force and loss magnitude changes.

### Phase 5: Optional Distributed Couplers (Advanced)

- [x] `P5-01` Define segmented tower model with configurable coupler count.
- [x] `P5-02` Model momentum exchange per segment.
- [x] `P5-03` Compute force density along height.
- [x] `P5-04` Add force density heatmap overlay on tower.
- [x] `P5-05` Add simplified structural stress index from force density.
- [x] `P5-06` Add chart for force density vs height.
- [x] `P5-07` Add UI toggle to compare top-only vs distributed support assumptions.
- [x] `P5-08` Validate force integration consistency (segment sum vs total force).

Phase 5 exit criteria:

1. Distributed-support model works and is inspectable.
2. Heatmap and stress indicators are tied to real computed values.
3. Advanced mode remains optional and does not degrade baseline usability.

### Cross-Phase Quality, Tooling, and Release Tasks

- [x] `Q-01` Add unit tests for analytic formulas and derived metrics.
- [x] `Q-02` Add tests for support margin and power ledger invariants.
- [x] `Q-03` Add tests for turnaround modes and loss calculations.
- [x] `Q-04` Add tests for drag integrator stability and expected trends.
- [x] `Q-05` Add regression tests for presets (expected status and key outputs).
- [x] `Q-06` Add performance instrumentation (frame time, sim step time, packet count).
- [x] `Q-07` Tune to performance budgets (`>= 55 FPS`, draw call target, bundle size target).
- [x] `Q-08` Run accessibility pass (keyboard, focus order, contrast, reduced motion).
- [x] `Q-09` Validate mobile layout and interaction ergonomics.
- [x] `Q-10` Add `validation.md` with hand-worked numerical examples.
- [x] `Q-11` Write end-user docs for controls, formulas, and mode meanings.
- [x] `Q-12` Write developer docs for architecture and extension points.
- [x] `Q-13` Build production assets and verify static hosting path behavior.
- [x] `Q-14` Run final checklist against Definition of Done.
- [x] `Q-15` Tag release and capture known limitations/future work notes.

## Suggested Task Order (Critical Path)

1. Complete Phase 0 fully.
2. Complete Phase 1 before any realism additions.
3. Complete Phase 2 to lock explainability.
4. Complete Phase 3 and Phase 4 in sequence (drag first, then turnaround losses).
5. Run cross-phase quality tasks continuously, then finish release tasks.
6. Implement Phase 5 only if schedule and performance budget permit.
