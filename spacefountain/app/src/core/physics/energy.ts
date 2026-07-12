export function inputPower(mdot: number, v0: number): number {
  return 0.5 * mdot * v0 * v0;
}

export function gravityPower(mdot: number, g: number, H: number): number {
  return mdot * g * H;
}

export function recoveryPower(etaRec: number, P_grav: number): number {
  return Math.max(0, Math.min(1, etaRec)) * P_grav;
}

export function netPower(
  P_in: number,
  P_rec: number,
  P_drag: number,
  P_turnLoss: number,
): number {
  return P_in - P_rec + P_drag + P_turnLoss;
}

export function efficiencyRatio(useful: number, totalInput: number): number {
  if (totalInput <= 0) {
    return 0;
  }
  return useful / totalInput;
}
