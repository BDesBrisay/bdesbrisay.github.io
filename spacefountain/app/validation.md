# Validation Examples

## Example A: Reachability Threshold

Inputs:

- `H = 60,000 m`
- `g = 9.81 m/s^2`

Formula:

- `v0_min = sqrt(2 g H)`

Computation:

- `2 g H = 2 * 9.81 * 60,000 = 1,177,200`
- `v0_min = sqrt(1,177,200) = 1,085.91 m/s`

Interpretation:

- Any `v0 < 1,085.91 m/s` fails to reach `60 km` in no-drag mode.

## Example B: Turnaround Force

Inputs:

- `mdot = 1,500 kg/s`
- `v_top = 1,000 m/s`
- ideal reversal

Formula:

- `F_turn = 2 mdot v_top`

Computation:

- `F_turn = 2 * 1,500 * 1,000 = 3,000,000 N = 3.00 MN`

## Example C: Load Support Margin

Inputs:

- `loadMass = 250,000 kg`
- `g = 9.81 m/s^2`
- `F_turn = 3.00 MN`

Formulas:

- `W = M g`
- `margin = (F_turn - W) / W`

Computation:

- `W = 250,000 * 9.81 = 2,452,500 N`
- `margin = (3,000,000 - 2,452,500) / 2,452,500 = 0.2232 = 22.32%`

## Example D: Power Ledger

Inputs:

- `mdot = 1,500 kg/s`
- `v0 = 1,200 m/s`
- `H = 45,000 m`
- `etaRec = 0.6`
- `P_drag = 30 MW`
- `P_turnLoss = 20 MW`

Formulas:

- `P_in = 0.5 mdot v0^2`
- `P_grav = mdot g H`
- `P_rec = etaRec * P_grav`
- `P_net = P_in - P_rec + P_drag + P_turnLoss`

Computation:

- `P_in = 0.5 * 1,500 * 1,200^2 = 1.08 GW`
- `P_grav = 1,500 * 9.81 * 45,000 = 662.175 MW`
- `P_rec = 0.6 * 662.175 = 397.305 MW`
- `P_net = 1,080 - 397.305 + 30 + 20 = 732.695 MW`

Interpretation:

- Even with recovery, large launch power and losses dominate external power demand.
