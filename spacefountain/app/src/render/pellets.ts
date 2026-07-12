import * as THREE from "three";
import type { Inputs, Packet } from "../core/types";

const MAX_INSTANCES = 12_000;

function kineticRatio(v: number, reference: number): number {
  const safeReference = Math.max(1, reference);
  const ratio = (v * v) / (safeReference * safeReference);
  if (ratio < 0) {
    return 0;
  }
  if (ratio > 1) {
    return 1;
  }
  return ratio;
}

function colorFromRatio(ratio: number): THREE.Color {
  const c = new THREE.Color();
  c.setHSL(0.52 - ratio * 0.14, 0.95, 0.58);
  return c;
}

export class PelletVisual {
  public readonly mesh: THREE.InstancedMesh;
  private readonly dummy = new THREE.Object3D();
  private activeCount = 0;

  public constructor() {
    const geo = new THREE.SphereGeometry(0.28, 8, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x67f7ff,
      emissive: 0x22d8ff,
      emissiveIntensity: 1.0,
      metalness: 0.1,
      roughness: 0.35,
      transparent: true,
      opacity: 0.9,
    });

    this.mesh = new THREE.InstancedMesh(geo, mat, MAX_INSTANCES);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;
  }

  public update(
    packets: readonly Packet[],
    inputs: Inputs,
    teachMode: boolean,
    elapsedSec: number,
  ): void {
    const count = Math.min(packets.length, MAX_INSTANCES);
    let rendered = 0;

    for (let i = 0; i < count; i += 1) {
      const packet = packets[i];
      if (packet === undefined) {
        continue;
      }
      const radialPhase = packet.id * 0.157 + packet.age * 13 + elapsedSec * 2.2;
      const radius = 0.6 + 0.2 * Math.sin(packet.age * 3.1);
      const x = Math.sin(radialPhase) * radius;
      const z = Math.cos(radialPhase) * radius;

      this.dummy.position.set(x, packet.z, z);
      this.dummy.scale.setScalar(teachMode ? 1.12 : 1);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(rendered, this.dummy.matrix);

      if (teachMode) {
        const ratio = kineticRatio(Math.abs(packet.v), inputs.v0);
        this.mesh.setColorAt(rendered, colorFromRatio(ratio));
      }
      rendered += 1;
    }

    this.activeCount = rendered;
    this.mesh.count = rendered;
    this.mesh.instanceMatrix.needsUpdate = true;

    if (teachMode && this.mesh.instanceColor !== null) {
      this.mesh.instanceColor.needsUpdate = true;
    }
  }

  public getActiveCount(): number {
    return this.activeCount;
  }

  public dispose(): void {
    this.mesh.geometry.dispose();
    const material = this.mesh.material;
    if (Array.isArray(material)) {
      for (const item of material) {
        item.dispose();
      }
      return;
    }
    material.dispose();
  }
}
