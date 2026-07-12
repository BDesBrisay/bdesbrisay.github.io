import { G, TARGET_PACKET_COUNT } from "../core/constants";
import { dragForceMagnitude, crossSectionArea } from "../core/physics/dragIntegrator";
import { computeTurnaround } from "../core/physics/turnaround";
import type { Inputs, Packet } from "../core/types";

export type PacketStepResult = {
  packetCount: number;
  simulatedSeconds: number;
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

export class PacketStream {
  private packets: Packet[] = [];
  private nextPacketId = 1;
  private spawnAccumulator = 0;

  public getPackets(): readonly Packet[] {
    return this.packets;
  }

  private spawnPacket(inputs: Inputs): void {
    const packet: Packet = {
      id: this.nextPacketId,
      mass: Math.max(1e-6, inputs.mdot * inputs.packetDt),
      z: 0,
      v: inputs.v0,
      age: 0,
    };
    this.nextPacketId += 1;
    this.packets.push(packet);
  }

  private trimPackets(inputs: Inputs, packetCapOverride?: number): void {
    const estimateRoundTrip = Math.max(2, (2 * inputs.H) / Math.max(1, inputs.v0));
    const dynamicTarget = Math.floor(estimateRoundTrip / Math.max(0.005, inputs.packetDt));
    const cap = packetCapOverride ?? TARGET_PACKET_COUNT;
    const maxPackets = Math.max(500, Math.min(cap, dynamicTarget));

    if (this.packets.length > maxPackets) {
      const removeCount = this.packets.length - maxPackets;
      this.packets.splice(0, removeCount);
    }
  }

  public reset(): void {
    this.packets = [];
    this.nextPacketId = 1;
    this.spawnAccumulator = 0;
  }

  public step(dt: number, inputs: Inputs, packetCapOverride?: number): PacketStepResult {
    const area = crossSectionArea(inputs.pelletRadius);

    this.spawnAccumulator += dt;
    while (this.spawnAccumulator >= inputs.packetDt) {
      this.spawnAccumulator -= inputs.packetDt;
      this.spawnPacket(inputs);
    }

    for (let i = 0; i < this.packets.length; i += 1) {
      const packet = this.packets[i];
      if (packet === undefined) {
        continue;
      }
      const speed = Math.abs(packet.v);
      const drag = inputs.dragEnabled
        ? dragForceMagnitude(speed, inputs.rho, inputs.Cd, area)
        : 0;
      const direction = signWithFallback(packet.v, 1);
      const a = -G - (drag / packet.mass) * direction;

      packet.v += a * dt;
      packet.z += packet.v * dt;
      packet.age += dt;

      if (packet.z >= inputs.H && packet.v > 0) {
        packet.z = inputs.H;
        const turn = computeTurnaround(
          inputs.turnaroundMode,
          packet.v,
          inputs.mdot,
          inputs.turnaroundLossFraction,
        );
        packet.v = turn.vOut;
      }

      if (packet.z <= 0 && packet.v < 0) {
        packet.z = 0;
        packet.v = inputs.v0;
        packet.age = 0;
      }
    }

    this.trimPackets(inputs, packetCapOverride);

    return {
      packetCount: this.packets.length,
      simulatedSeconds: dt,
    };
  }
}
