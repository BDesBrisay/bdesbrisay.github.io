import { G, SAMPLE_COUNT, STATUS_THRESHOLDS } from "../constants";
import { inputPower, gravityPower, netPower, recoveryPower, efficiencyRatio } from "../physics/energy";
import { zMax, vAtZ } from "../physics/analytic";
import { computeTurnaround } from "../physics/turnaround";
import { simulateDragTrajectory } from "../physics/dragIntegrator";
import type {
  CouplerSegment,
  Derived,
  Inputs,
  StatusLevel,
} from "../types";

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

function statusFromMargin(margin: number): StatusLevel {
  if (margin >= STATUS_THRESHOLDS.stable) {
    return "stable";
  }
  if (margin >= STATUS_THRESHOLDS.nearLimit) {
    return "near-limit";
  }
  return "unstable";
}

function turnaroundScale(inputs: Inputs): number {
  if (inputs.turnaroundMode === "stopAndDrop") {
    return 1;
  }
  if (inputs.turnaroundMode === "lossyReverse") {
    return 2 - clamp(inputs.turnaroundLossFraction, 0, 0.95);
  }
  return 2;
}

function buildAnalyticSamples(inputs: Inputs): {
  zSamples: Float32Array;
  vSamples: Float32Array;
} {
  const zSamples = new Float32Array(SAMPLE_COUNT);
  const vSamples = new Float32Array(SAMPLE_COUNT);
  for (let i = 0; i < SAMPLE_COUNT; i += 1) {
    const z = (inputs.H * i) / (SAMPLE_COUNT - 1);
    zSamples[i] = z;
    vSamples[i] = vAtZ(inputs.v0, z);
  }
  return { zSamples, vSamples };
}

function buildCouplers(
  inputs: Inputs,
  forceTurn: number,
): {
  topForceShare: number;
  distributedForceShare: number;
  couplerSegments: CouplerSegment[];
  densitySamples: Float32Array;
} {
  const densitySamples = new Float32Array(SAMPLE_COUNT);

  if (!inputs.distributedCouplersEnabled || forceTurn <= 0) {
    densitySamples[SAMPLE_COUNT - 1] = forceTurn;
    return {
      topForceShare: forceTurn,
      distributedForceShare: 0,
      couplerSegments: [],
      densitySamples,
    };
  }

  const count = Math.max(4, Math.floor(inputs.couplerCount));
  const share = clamp(inputs.couplerStrength, 0, 1);
  const distributedForceShare = forceTurn * share;
  const topForceShare = forceTurn - distributedForceShare;

  const weights: number[] = [];
  let totalWeight = 0;
  for (let i = 0; i < count; i += 1) {
    const phase = (i + 0.5) / count;
    const weight = 0.7 + 0.6 * Math.sin(phase * Math.PI);
    weights.push(weight);
    totalWeight += weight;
  }

  const segmentHeight = inputs.H / count;
  const couplerSegments: CouplerSegment[] = [];
  for (let i = 0; i < count; i += 1) {
    const zStart = i * segmentHeight;
    const zEnd = (i + 1) * segmentHeight;
    const force = (distributedForceShare * (weights[i] ?? 0)) / totalWeight;
    couplerSegments.push({
      index: i,
      zStart,
      zEnd,
      force,
    });
  }

  for (let i = 0; i < SAMPLE_COUNT; i += 1) {
    const z = (inputs.H * i) / (SAMPLE_COUNT - 1);
    const rawIndex = Math.floor((z / inputs.H) * count);
    const segmentIndex = clamp(rawIndex, 0, count - 1);
    const segment = couplerSegments[segmentIndex];
    if (segment === undefined) {
      continue;
    }
    const dz = Math.max(1e-6, segment.zEnd - segment.zStart);
    densitySamples[i] = segment.force / dz;
  }

  densitySamples[SAMPLE_COUNT - 1] = (densitySamples[SAMPLE_COUNT - 1] ?? 0) + topForceShare;

  return {
    topForceShare,
    distributedForceShare,
    couplerSegments,
    densitySamples,
  };
}

function buildForceSamples(inputs: Inputs, vSamples: Float32Array): Float32Array {
  const scale = turnaroundScale(inputs);
  const fSamples = new Float32Array(vSamples.length);
  for (let i = 0; i < vSamples.length; i += 1) {
    fSamples[i] = inputs.mdot * scale * (vSamples[i] ?? 0);
  }
  return fSamples;
}

export function derive(inputs: Inputs): Derived {
  const warnings: string[] = [];
  const zMaxNoDrag = zMax(inputs.v0);
  const vTopNoDrag = zMaxNoDrag >= inputs.H ? vAtZ(inputs.v0, inputs.H) : 0;

  let sourceMode: Derived["sourceMode"] = "analytic";
  let zSamples: Float32Array;
  let vSamples: Float32Array;
  let vTop = vTopNoDrag;
  let isReachable = zMaxNoDrag >= inputs.H;
  let P_drag = 0;

  if (inputs.dragEnabled) {
    const dragResult = simulateDragTrajectory(inputs);
    sourceMode = "integrated";
    zSamples = dragResult.zSamples;
    vSamples = dragResult.vSamples;
    isReachable = dragResult.reachedTop;
    vTop = dragResult.vTop;
    P_drag = inputs.mdot * dragResult.energyDragPerKg;

    if (!dragResult.reachedTop) {
      warnings.push("Drag losses prevent packets from reaching target height.");
      warnings.push(`Maximum reached height: ${dragResult.zMaxReached.toFixed(0)} m`);
    }
  } else {
    const analytic = buildAnalyticSamples(inputs);
    zSamples = analytic.zSamples;
    vSamples = analytic.vSamples;
    if (!isReachable) {
      warnings.push("Injection speed is below the minimum needed for selected height.");
      warnings.push(`Need at least ${Math.sqrt(2 * G * inputs.H).toFixed(1)} m/s`);
    }
  }

  const turn = isReachable
    ? computeTurnaround(
        inputs.turnaroundMode,
        vTop,
        inputs.mdot,
        inputs.turnaroundLossFraction,
      )
    : { vOut: 0, deltaV: 0, force: 0, lossPower: 0 };

  const forceTurn = turn.force;
  const loadWeight = inputs.loadMass * G;
  const supportMargin = loadWeight > 0 ? (forceTurn - loadWeight) / loadWeight : 0;
  const statusLevel = statusFromMargin(supportMargin);
  const vTopDeltaPct = vTopNoDrag > 0 ? (vTop - vTopNoDrag) / vTopNoDrag : 0;

  const P_in = inputPower(inputs.mdot, inputs.v0);
  const P_grav = gravityPower(inputs.mdot, G, inputs.H);
  const P_rec = recoveryPower(inputs.etaRec, P_grav);
  const P_turnLoss = isReachable ? turn.lossPower : 0;
  const P_net = netPower(P_in, P_rec, P_drag, P_turnLoss);
  const efficiency = efficiencyRatio(P_rec, P_in + P_drag + P_turnLoss);

  const coupler = buildCouplers(inputs, forceTurn);
  const fSamples = buildForceSamples(inputs, vSamples);

  if (inputs.turnaroundMode === "lossyReverse" && inputs.turnaroundLossFraction > 0) {
    warnings.push("Lossy turnaround increases force conversion losses.");
  }

  if (inputs.turnaroundMode === "stopAndDrop") {
    warnings.push("Stop-and-drop mode reduces turnaround force and adds dissipation.");
  }

  if (inputs.dragEnabled && inputs.useRk4) {
    warnings.push("RK4 integrator active for drag trajectory integration.");
  }

  if (inputs.distributedCouplersEnabled) {
    warnings.push("Distributed couplers enabled: part of support force is spread along the tower.");
  }

  return {
    g: G,
    zMax: inputs.dragEnabled ? zMaxNoDrag : zMaxNoDrag,
    vTop,
    vTopNoDrag,
    vTopDeltaPct,
    forceTurn,
    loadWeight,
    supportMargin,
    statusLevel,
    P_in,
    P_grav,
    P_rec,
    P_drag,
    P_turnLoss,
    P_net,
    efficiency,
    topForceShare: coupler.topForceShare,
    distributedForceShare: coupler.distributedForceShare,
    couplerSegments: coupler.couplerSegments,
    isReachable,
    warnings,
    sourceMode,
    zSamples,
    vSamples,
    fSamples,
    densitySamples: coupler.densitySamples,
  };
}
