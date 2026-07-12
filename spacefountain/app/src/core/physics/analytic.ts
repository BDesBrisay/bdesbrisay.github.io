import { G } from "../constants";

export function zMax(v0: number): number {
  return (v0 * v0) / (2 * G);
}

export function requiredV0(H: number): number {
  return Math.sqrt(2 * G * H);
}

export function vAtZ(v0: number, z: number): number {
  const term = v0 * v0 - 2 * G * z;
  return term <= 0 ? 0 : Math.sqrt(term);
}

export function tAtZ(v0: number, z: number): number {
  const root = vAtZ(v0, z);
  return (v0 - root) / G;
}

export function forceForDeltaV(mdot: number, deltaV: number): number {
  return mdot * Math.abs(deltaV);
}
