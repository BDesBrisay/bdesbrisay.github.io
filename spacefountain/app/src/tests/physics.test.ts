import { describe, expect, it } from "vitest";
import { G } from "../core/constants";
import { requiredV0, vAtZ, zMax } from "../core/physics/analytic";
import { computeTurnaround } from "../core/physics/turnaround";

describe("analytic physics", () => {
  it("computes zMax and requiredV0 as inverse relations", () => {
    const H = 32_000;
    const v0 = requiredV0(H);
    const z = zMax(v0);
    expect(z).toBeCloseTo(H, 6);
  });

  it("returns zero velocity above max height", () => {
    const v0 = 1000;
    const aboveTop = zMax(v0) + 100;
    expect(vAtZ(v0, aboveTop)).toBe(0);
  });

  it("gives expected mid-height velocity", () => {
    const H = 20_000;
    const v0 = 1200;
    const z = H * 0.5;
    const expected = Math.sqrt(Math.max(0, v0 * v0 - 2 * G * z));
    expect(vAtZ(v0, z)).toBeCloseTo(expected, 8);
  });
});

describe("turnaround models", () => {
  it("ideal reversal doubles momentum change", () => {
    const mdot = 1500;
    const vIn = 1800;
    const result = computeTurnaround("idealReverse", vIn, mdot, 0.2);
    expect(result.force).toBeCloseTo(2 * mdot * vIn, 6);
    expect(result.lossPower).toBe(0);
    expect(result.vOut).toBeCloseTo(-vIn, 8);
  });

  it("lossy reversal reduces outbound speed and adds loss", () => {
    const mdot = 900;
    const vIn = 2000;
    const loss = 0.2;
    const result = computeTurnaround("lossyReverse", vIn, mdot, loss);
    expect(result.vOut).toBeCloseTo(-1600, 6);
    expect(result.lossPower).toBeGreaterThan(0);
    expect(result.force).toBeLessThan(2 * mdot * vIn);
  });

  it("stop-and-drop has smaller force than ideal", () => {
    const mdot = 500;
    const vIn = 2200;
    const stop = computeTurnaround("stopAndDrop", vIn, mdot, 0);
    const ideal = computeTurnaround("idealReverse", vIn, mdot, 0);
    expect(stop.force).toBeLessThan(ideal.force);
    expect(stop.lossPower).toBeGreaterThan(0);
  });
});
