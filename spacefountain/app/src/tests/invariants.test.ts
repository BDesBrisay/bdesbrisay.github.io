import { describe, expect, it } from "vitest";
import { DEFAULT_INPUTS } from "../core/constants";
import { derive } from "../core/model/derive";
import { PRESETS } from "../core/model/presets";

describe("model invariants", () => {
  it("increasing mdot increases turnaround force with other inputs fixed", () => {
    const low = derive({ ...DEFAULT_INPUTS, mdot: 800 });
    const high = derive({ ...DEFAULT_INPUTS, mdot: 3000 });
    expect(high.forceTurn).toBeGreaterThan(low.forceTurn);
  });

  it("increasing H lowers vTop at fixed v0 when reachable", () => {
    const base = { ...DEFAULT_INPUTS, dragEnabled: false, v0: 2200 };
    const lower = derive({ ...base, H: 20_000 });
    const higher = derive({ ...base, H: 50_000 });
    expect(lower.isReachable).toBe(true);
    expect(higher.isReachable).toBe(true);
    expect(higher.vTop).toBeLessThan(lower.vTop);
  });

  it("drag enabled should not increase vTop over no-drag baseline", () => {
    const noDrag = derive({ ...DEFAULT_INPUTS, dragEnabled: false, H: 30_000, v0: 1800 });
    const withDrag = derive({ ...DEFAULT_INPUTS, dragEnabled: true, H: 30_000, v0: 1800, Cd: 0.9 });
    expect(withDrag.vTop).toBeLessThanOrEqual(noDrag.vTop + 1e-6);
  });

  it("preset regression: all presets derive finite values", () => {
    for (const preset of PRESETS) {
      const derived = derive(preset.inputs);
      expect(Number.isFinite(derived.P_net)).toBe(true);
      expect(Number.isFinite(derived.forceTurn)).toBe(true);
      expect(Number.isFinite(derived.supportMargin)).toBe(true);
    }
  });
});
