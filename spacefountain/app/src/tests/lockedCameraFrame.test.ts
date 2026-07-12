import { describe, expect, it } from "vitest";
import { computeLockedCameraFrame } from "../render/lockedCameraFrame";

describe("locked camera framing", () => {
  it("clamps to minimum distance for short world heights", () => {
    const frame = computeLockedCameraFrame(1000, 0.025);
    expect(frame.distance).toBe(85);
  });

  it("clamps to maximum distance for very tall world heights", () => {
    const frame = computeLockedCameraFrame(10_000_000, 0.0005);
    expect(frame.distance).toBe(350);
  });

  it("centers target around mid-height of the world tower", () => {
    const frame = computeLockedCameraFrame(60_000, 0.0021666667);
    expect(frame.target.y).toBeCloseTo(frame.worldTop * 0.5, 5);
  });
});
