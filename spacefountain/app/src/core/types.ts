export type TurnaroundMode = "idealReverse" | "lossyReverse" | "stopAndDrop";
export type ViewMode = "locked2d" | "free3d";
export type RenderTier = "high" | "medium" | "low";

export type MetricSource = "analytic" | "integrated" | "input" | "constant";

export type StatusLevel = "stable" | "near-limit" | "unstable";

export type Inputs = {
  H: number;
  v0: number;
  mdot: number;
  loadMass: number;
  etaRec: number;
  turnaroundMode: TurnaroundMode;
  turnaroundLossFraction: number;
  dragEnabled: boolean;
  pelletRadius: number;
  Cd: number;
  rho: number;
  packetDt: number;
  useRk4: boolean;
  distributedCouplersEnabled: boolean;
  couplerCount: number;
  couplerStrength: number;
};

export type CouplerSegment = {
  index: number;
  zStart: number;
  zEnd: number;
  force: number;
};

export type Derived = {
  g: number;
  zMax: number;
  vTop: number;
  vTopNoDrag: number;
  vTopDeltaPct: number;
  forceTurn: number;
  loadWeight: number;
  supportMargin: number;
  statusLevel: StatusLevel;

  P_in: number;
  P_grav: number;
  P_rec: number;
  P_drag: number;
  P_turnLoss: number;
  P_net: number;
  efficiency: number;

  topForceShare: number;
  distributedForceShare: number;
  couplerSegments: CouplerSegment[];

  isReachable: boolean;
  warnings: string[];
  sourceMode: MetricSource;

  zSamples: Float32Array;
  vSamples: Float32Array;
  fSamples: Float32Array;
  densitySamples: Float32Array;
};

export type FormulaCard = {
  id: string;
  title: string;
  latex: string;
  substitutions: Array<{ label: string; value: string }>;
  result: string;
  plainEnglish: string;
  source: MetricSource;
  highlightKey: string;
};

export type Preset = {
  id: string;
  label: string;
  description: string;
  inputs: Inputs;
  highlightedMetric: "supportMargin" | "P_net" | "vTop";
};

export type Packet = {
  id: number;
  mass: number;
  z: number;
  v: number;
  age: number;
};

export type PerformanceStats = {
  fps: number;
  simMs: number;
  packetCount: number;
};

export type TurnaroundResult = {
  vOut: number;
  deltaV: number;
  force: number;
  lossPower: number;
};
