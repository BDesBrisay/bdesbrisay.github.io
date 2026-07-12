import type { Inputs } from "./types";

export const G = 9.81;
export const SAMPLE_COUNT = 160;
export const SIM_FIXED_DT = 1 / 60;
export const TARGET_PACKET_COUNT = 2800;

export const INPUT_LIMITS = {
  H: { min: 1_000, max: 120_000 },
  v0: { min: 500, max: 10_000 },
  mdot: { min: 10, max: 8_000 },
  loadMass: { min: 10_000, max: 1_000_000 },
  etaRec: { min: 0, max: 0.95 },
  turnaroundLossFraction: { min: 0, max: 0.95 },
  pelletRadius: { min: 0.002, max: 0.15 },
  Cd: { min: 0.05, max: 2.5 },
  rho: { min: 0.01, max: 1.3 },
  packetDt: { min: 0.005, max: 0.08 },
  couplerCount: { min: 4, max: 80 },
  couplerStrength: { min: 0, max: 1 },
} as const;

export const DEFAULT_INPUTS: Inputs = {
  H: 60_000,
  v0: 1_300,
  mdot: 1_800,
  loadMass: 120_000,
  etaRec: 0.55,
  turnaroundMode: "idealReverse",
  turnaroundLossFraction: 0.18,
  dragEnabled: false,
  pelletRadius: 0.025,
  Cd: 0.65,
  rho: 1.0,
  packetDt: 0.02,
  useRk4: false,
  distributedCouplersEnabled: false,
  couplerCount: 24,
  couplerStrength: 0.45,
};

export const STATUS_THRESHOLDS = {
  stable: 0.08,
  nearLimit: -0.05,
} as const;

export const UI_COLORS = {
  stable: "var(--ok)",
  nearLimit: "var(--amber)",
  unstable: "var(--danger)",
} as const;
