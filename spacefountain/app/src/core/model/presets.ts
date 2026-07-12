import { DEFAULT_INPUTS } from "../constants";
import type { Inputs, Preset } from "../types";

function withInputs(overrides: Partial<Inputs>): Inputs {
  return {
    ...DEFAULT_INPUTS,
    ...overrides,
  };
}

export const PRESETS: Preset[] = [
  {
    id: "barely-stable",
    label: "Barely Stable",
    description: "Force margin sits just above zero. Good for seeing sensitivity.",
    highlightedMetric: "supportMargin",
    inputs: withInputs({
      H: 42_000,
      v0: 980,
      mdot: 1_450,
      loadMass: 185_000,
      etaRec: 0.48,
      turnaroundMode: "idealReverse",
      dragEnabled: false,
      distributedCouplersEnabled: false,
    }),
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Moderate power and healthy support margin for exploration.",
    highlightedMetric: "supportMargin",
    inputs: withInputs({
      H: 35_000,
      v0: 1_250,
      mdot: 1_900,
      loadMass: 150_000,
      etaRec: 0.55,
      turnaroundMode: "idealReverse",
      distributedCouplersEnabled: true,
      couplerStrength: 0.35,
    }),
  },
  {
    id: "high-throughput",
    label: "High Throughput",
    description: "Large mass flow drives high support force with a major power bill.",
    highlightedMetric: "P_net",
    inputs: withInputs({
      H: 70_000,
      v0: 1_650,
      mdot: 4_500,
      loadMass: 430_000,
      etaRec: 0.35,
      turnaroundMode: "lossyReverse",
      turnaroundLossFraction: 0.22,
      dragEnabled: false,
      distributedCouplersEnabled: true,
      couplerStrength: 0.55,
    }),
  },
  {
    id: "efficient-regen",
    label: "Efficient Regen",
    description: "High recovery efficiency and moderate force for net power reduction.",
    highlightedMetric: "P_net",
    inputs: withInputs({
      H: 50_000,
      v0: 1_250,
      mdot: 1_650,
      loadMass: 140_000,
      etaRec: 0.88,
      turnaroundMode: "idealReverse",
      dragEnabled: false,
      distributedCouplersEnabled: true,
      couplerStrength: 0.45,
    }),
  },
  {
    id: "failure-case",
    label: "Failure Case",
    description: "Intentionally unstable: low launch speed and high load.",
    highlightedMetric: "vTop",
    inputs: withInputs({
      H: 70_000,
      v0: 940,
      mdot: 1_100,
      loadMass: 500_000,
      etaRec: 0.3,
      turnaroundMode: "stopAndDrop",
      dragEnabled: true,
      Cd: 1.2,
      pelletRadius: 0.05,
      distributedCouplersEnabled: false,
    }),
  },
];

export function getPresetById(presetId: string): Preset {
  const preset = PRESETS.find((item) => item.id === presetId);
  if (preset === undefined) {
    const fallback = PRESETS[1] ?? PRESETS[0];
    if (fallback === undefined) {
      throw new Error("Preset registry is empty");
    }
    return fallback;
  }
  return preset;
}
