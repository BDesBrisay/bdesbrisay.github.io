import type { TurnaroundMode, TurnaroundResult } from "../types";

function clampLoss(lossFraction: number): number {
  if (lossFraction < 0) {
    return 0;
  }
  if (lossFraction > 0.95) {
    return 0.95;
  }
  return lossFraction;
}

export function computeTurnaround(
  mode: TurnaroundMode,
  vIn: number,
  mdot: number,
  lossFraction: number,
): TurnaroundResult {
  const vin = Math.max(0, vIn);
  const clampedLoss = clampLoss(lossFraction);

  if (mode === "stopAndDrop") {
    const vOut = 0;
    const deltaV = -(vin - vOut);
    const force = mdot * Math.abs(deltaV);
    const lossPower = 0.5 * mdot * vin * vin;
    return { vOut, deltaV, force, lossPower };
  }

  if (mode === "lossyReverse") {
    const vOutMag = vin * (1 - clampedLoss);
    const vOut = -vOutMag;
    const deltaV = vOut - vin;
    const force = mdot * Math.abs(deltaV);
    const lossPower = 0.5 * mdot * (vin * vin - vOutMag * vOutMag);
    return { vOut, deltaV, force, lossPower };
  }

  const vOut = -vin;
  const deltaV = vOut - vin;
  const force = mdot * Math.abs(deltaV);
  return { vOut, deltaV, force, lossPower: 0 };
}
