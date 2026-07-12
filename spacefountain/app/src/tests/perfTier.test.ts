import { describe, expect, it } from "vitest";
import { packetCapForTier, RenderTierController } from "../render/perfTier";

describe("render tier packet caps", () => {
  it("returns expected packet caps", () => {
    expect(packetCapForTier("high")).toBe(2800);
    expect(packetCapForTier("medium")).toBe(1800);
    expect(packetCapForTier("low")).toBe(1200);
  });
});

describe("render tier hysteresis", () => {
  it("drops from high to medium after sustained low fps", () => {
    const controller = new RenderTierController("high");
    for (let i = 0; i < 3; i += 1) {
      expect(controller.sample(48)).toBe("high");
    }
    expect(controller.sample(48)).toBe("medium");
  });

  it("drops from medium to low after sustained very low fps", () => {
    const controller = new RenderTierController("medium");
    for (let i = 0; i < 3; i += 1) {
      expect(controller.sample(30)).toBe("medium");
    }
    expect(controller.sample(30)).toBe("low");
  });

  it("recovers from low to medium after sustained stronger fps", () => {
    const controller = new RenderTierController("low");
    for (let i = 0; i < 5; i += 1) {
      expect(controller.sample(50)).toBe("low");
    }
    expect(controller.sample(50)).toBe("medium");
  });

  it("recovers from medium to high only after a long stable streak", () => {
    const controller = new RenderTierController("medium");
    for (let i = 0; i < 7; i += 1) {
      expect(controller.sample(57)).toBe("medium");
    }
    expect(controller.sample(57)).toBe("high");
  });
});
