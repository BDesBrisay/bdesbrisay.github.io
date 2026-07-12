import { G, SAMPLE_COUNT } from "../constants";
import { computeTurnaround } from "./turnaround";
import type { Inputs } from "../types";

export type DragSimulationResult = {
  reachedTop: boolean;
  vTop: number;
  zMaxReached: number;
  energyDragPerKg: number;
  zSamples: Float32Array;
  vSamples: Float32Array;
};

type IntegratorKind = "euler" | "rk4";

type StepResult = {
  z: number;
  v: number;
  dragForWork: number;
};

function signWithFallback(value: number, fallback: 1 | -1): 1 | -1 {
  if (value > 0) {
    return 1;
  }
  if (value < 0) {
    return -1;
  }
  return fallback;
}

export function crossSectionArea(radius: number): number {
  return Math.PI * radius * radius;
}

export function dragForceMagnitude(
  speed: number,
  rho: number,
  Cd: number,
  area: number,
): number {
  return 0.5 * rho * Cd * area * speed * speed;
}

function accelerationAndDrag(
  v: number,
  fallbackDirection: 1 | -1,
  inputs: Inputs,
  area: number,
): { acceleration: number; drag: number } {
  const speed = Math.abs(v);
  const drag = dragForceMagnitude(speed, inputs.rho, inputs.Cd, area);
  const direction = signWithFallback(v, fallbackDirection);
  const acceleration = -G - drag * direction;
  return { acceleration, drag };
}

function stepEuler(
  z: number,
  v: number,
  dt: number,
  fallbackDirection: 1 | -1,
  inputs: Inputs,
  area: number,
): StepResult {
  const start = accelerationAndDrag(v, fallbackDirection, inputs, area);
  const nextV = v + start.acceleration * dt;
  const nextZ = z + nextV * dt;
  return {
    z: nextZ,
    v: nextV,
    dragForWork: start.drag,
  };
}

function accelerationOnly(
  v: number,
  fallbackDirection: 1 | -1,
  inputs: Inputs,
  area: number,
): number {
  return accelerationAndDrag(v, fallbackDirection, inputs, area).acceleration;
}

function stepRk4(
  z: number,
  v: number,
  dt: number,
  fallbackDirection: 1 | -1,
  inputs: Inputs,
  area: number,
): StepResult {
  const k1z = v;
  const k1v = accelerationOnly(v, fallbackDirection, inputs, area);

  const k2z = v + 0.5 * dt * k1v;
  const k2v = accelerationOnly(v + 0.5 * dt * k1v, fallbackDirection, inputs, area);

  const k3z = v + 0.5 * dt * k2v;
  const k3v = accelerationOnly(v + 0.5 * dt * k2v, fallbackDirection, inputs, area);

  const k4z = v + dt * k3v;
  const k4v = accelerationOnly(v + dt * k3v, fallbackDirection, inputs, area);

  const nextZ = z + (dt / 6) * (k1z + 2 * k2z + 2 * k3z + k4z);
  const nextV = v + (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);

  const dragStart = accelerationAndDrag(v, fallbackDirection, inputs, area).drag;
  const dragEnd = accelerationAndDrag(nextV, fallbackDirection, inputs, area).drag;

  return {
    z: nextZ,
    v: nextV,
    dragForWork: 0.5 * (dragStart + dragEnd),
  };
}

function stepKinematics(
  z: number,
  v: number,
  dt: number,
  fallbackDirection: 1 | -1,
  inputs: Inputs,
  area: number,
  integrator: IntegratorKind,
): StepResult {
  if (integrator === "rk4") {
    return stepRk4(z, v, dt, fallbackDirection, inputs, area);
  }
  return stepEuler(z, v, dt, fallbackDirection, inputs, area);
}

export function simulateDragTrajectory(inputs: Inputs): DragSimulationResult {
  const area = crossSectionArea(inputs.pelletRadius);
  const dt = 0.002;
  const maxSteps = 180_000;
  const integrator: IntegratorKind = inputs.useRk4 ? "rk4" : "euler";

  const upZ: number[] = [0];
  const upV: number[] = [inputs.v0];

  let z = 0;
  let v = inputs.v0;
  let dragWork = 0;
  let reachedTop = false;

  for (let step = 0; step < maxSteps; step += 1) {
    const prevZ = z;
    const stepped = stepKinematics(z, v, dt, 1, inputs, area, integrator);

    v = stepped.v;
    z = stepped.z;

    if (z < 0) {
      z = 0;
    }

    dragWork += stepped.dragForWork * Math.abs(z - prevZ);

    const lastUpZ = upZ[upZ.length - 1] ?? 0;
    if (z > lastUpZ) {
      upZ.push(z);
      upV.push(Math.max(0, v));
    }

    if (z >= inputs.H) {
      reachedTop = true;
      break;
    }

    if (v <= 0 && z < inputs.H) {
      break;
    }
  }

  const zMaxReached = upZ[upZ.length - 1] ?? 0;
  const vTop = reachedTop ? Math.max(0, upV[upV.length - 1] ?? 0) : 0;

  if (reachedTop) {
    const turn = computeTurnaround(
      inputs.turnaroundMode,
      vTop,
      1,
      inputs.turnaroundLossFraction,
    );
    z = inputs.H;
    v = turn.vOut;

    for (let step = 0; step < maxSteps; step += 1) {
      const prevZ = z;
      const stepped = stepKinematics(z, v, dt, -1, inputs, area, integrator);
      v = stepped.v;
      z = stepped.z;

      if (z <= 0) {
        dragWork += stepped.dragForWork * Math.abs(0 - prevZ);
        break;
      }

      dragWork += stepped.dragForWork * Math.abs(z - prevZ);
    }
  }

  const zSamples = new Float32Array(SAMPLE_COUNT);
  const vSamples = new Float32Array(SAMPLE_COUNT);

  let traceIndex = 0;
  for (let i = 0; i < SAMPLE_COUNT; i += 1) {
    const zTarget = (inputs.H * i) / (SAMPLE_COUNT - 1);
    zSamples[i] = zTarget;

    while (
      traceIndex + 1 < upZ.length &&
      (upZ[traceIndex + 1] ?? Number.POSITIVE_INFINITY) < zTarget
    ) {
      traceIndex += 1;
    }

    const z0 = upZ[traceIndex] ?? 0;
    const z1 = upZ[Math.min(traceIndex + 1, upZ.length - 1)] ?? z0;
    const v0 = upV[traceIndex] ?? 0;
    const v1 = upV[Math.min(traceIndex + 1, upV.length - 1)] ?? v0;

    if (z1 <= z0) {
      vSamples[i] = zTarget <= z0 ? v0 : 0;
      continue;
    }

    const alpha = (zTarget - z0) / (z1 - z0);
    vSamples[i] = v0 + (v1 - v0) * alpha;
  }

  return {
    reachedTop,
    vTop,
    zMaxReached,
    energyDragPerKg: dragWork,
    zSamples,
    vSamples,
  };
}
