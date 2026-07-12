import type { RenderTier } from "../core/types";

const PACKET_CAPS: Record<RenderTier, number> = {
  high: 2800,
  medium: 1800,
  low: 1200,
};

export function packetCapForTier(tier: RenderTier): number {
  return PACKET_CAPS[tier];
}

export class RenderTierController {
  private tier: RenderTier;
  private lowFpsStreak = 0;
  private veryLowFpsStreak = 0;
  private lowRecoveryStreak = 0;
  private highRecoveryStreak = 0;

  public constructor(initialTier: RenderTier) {
    this.tier = initialTier;
  }

  public getTier(): RenderTier {
    return this.tier;
  }

  public sample(fps: number): RenderTier {
    if (this.tier === "high") {
      this.lowFpsStreak = fps < 50 ? this.lowFpsStreak + 1 : 0;
      if (this.lowFpsStreak >= 4) {
        this.setTier("medium");
      }
      return this.tier;
    }

    if (this.tier === "medium") {
      this.veryLowFpsStreak = fps < 34 ? this.veryLowFpsStreak + 1 : 0;
      this.highRecoveryStreak = fps > 56 ? this.highRecoveryStreak + 1 : 0;

      if (this.veryLowFpsStreak >= 4) {
        this.setTier("low");
      } else if (this.highRecoveryStreak >= 8) {
        this.setTier("high");
      }
      return this.tier;
    }

    this.lowRecoveryStreak = fps > 48 ? this.lowRecoveryStreak + 1 : 0;
    if (this.lowRecoveryStreak >= 6) {
      this.setTier("medium");
    }
    return this.tier;
  }

  private setTier(tier: RenderTier): void {
    this.tier = tier;
    this.lowFpsStreak = 0;
    this.veryLowFpsStreak = 0;
    this.lowRecoveryStreak = 0;
    this.highRecoveryStreak = 0;
  }
}
