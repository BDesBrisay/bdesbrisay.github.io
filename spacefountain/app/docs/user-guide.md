# Space Fountain Simulator User Guide

## Quick Start

1. Run `npm install`.
2. Start dev server with `npm run dev`.
3. Open the URL shown in terminal.
4. Pick a preset in the left panel.

## Main Controls

- `Height`: target top altitude for turnaround.
- `Injection Speed`: launch speed at base.
- `Mass Flow`: kilograms per second in the stream.
- `Load Mass`: payload + structural equivalent load.
- `Recovery Efficiency`: fraction of recoverable gravity-rate power.

## Turnaround Modes

- `Ideal Reverse`: highest force for given top speed.
- `Lossy Reverse`: reduced outbound speed and added loss.
- `Stop and Drop`: strongest dissipation and lower support force.

## Teaching Features

- `Support Margin` stays visible in the top band and ledger.
- Formula cards show equation, substitutions, and result.
- Hovering formulas or metrics highlights related values.
- `Teach Mode` slows time and colors packets by kinetic energy.

## Camera and View Control

- The center view now defaults to a locked 2.5D framing so the full structure stays visible.
- In advanced controls, enable `Free Camera` only when you want manual 3D orbit input.
- Use `Reset Camera` to immediately return to locked framing and recenter the tower.
- Locked mode ignores camera input to prevent accidental disorientation.

## Drag and Advanced Controls

Enable `Drag` to switch from analytic baseline to integrated trajectory.

Advanced sliders:

- RK4 integrator toggle (feature flag)
- Turnaround loss fraction
- Pellet radius
- Drag coefficient
- Air density
- Packet spawn delta
- Coupler count
- Coupler force share

## Reading the Charts

- `Velocity`: speed profile vs height.
- `Force`: momentum-based force proxy vs height.
- `Power`: input, recovered, losses, net.
- `Density`: distributed force density along the tower.

## Interpreting Warnings

Warnings appear when:

- injection speed cannot reach target height,
- drag makes top unreachable,
- loss modes increase dissipation,
- distributed couplers are active.

## Recommended Exploration Sequence

1. Start with `Balanced` preset and drag off.
2. Increase `H` until reachability fails.
3. Increase `v0` to recover reachability.
4. Compare `Ideal` vs `Lossy` turnaround.
5. Enable `Drag` and inspect `P_drag` and net power changes.
6. Enable distributed couplers and inspect density chart.
