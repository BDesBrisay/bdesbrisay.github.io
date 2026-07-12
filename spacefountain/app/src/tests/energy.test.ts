import { describe, expect, it } from "vitest";
import { DEFAULT_INPUTS } from "../core/constants";
import { derive } from "../core/model/derive";
import { gravityPower, inputPower, netPower, recoveryPower } from "../core/physics/energy";

describe("energy accounting", () => {
  it("matches direct power formulas", () => {
    const mdot = 1200;
    const v0 = 1400;
    const H = 45_000;
    const eta = 0.62;

    const P_in = inputPower(mdot, v0);
    const P_grav = gravityPower(mdot, 9.81, H);
    const P_rec = recoveryPower(eta, P_grav);

    expect(P_in).toBeCloseTo(0.5 * mdot * v0 * v0, 6);
    expect(P_grav).toBeCloseTo(mdot * 9.81 * H, 6);
    expect(P_rec).toBeCloseTo(eta * P_grav, 6);
  });

  it("satisfies net-power balance in derived model", () => {
    const inputs = {
      ...DEFAULT_INPUTS,
      dragEnabled: true,
      turnaroundMode: "lossyReverse" as const,
      turnaroundLossFraction: 0.25,
      Cd: 0.8,
      rho: 1.0,
    };

    const derived = derive(inputs);
    const recomputed = netPower(
      derived.P_in,
      derived.P_rec,
      derived.P_drag,
      derived.P_turnLoss,
    );

    expect(derived.P_net).toBeCloseTo(recomputed, 5);
  });

  it("higher turnaround loss does not reduce net power demand", () => {
    const lowLoss = derive({
      ...DEFAULT_INPUTS,
      turnaroundMode: "lossyReverse",
      turnaroundLossFraction: 0.1,
    });

    const highLoss = derive({
      ...DEFAULT_INPUTS,
      turnaroundMode: "lossyReverse",
      turnaroundLossFraction: 0.5,
    });

    expect(highLoss.P_net).toBeGreaterThanOrEqual(lowLoss.P_net);
  });
});
