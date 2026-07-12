import * as THREE from "three";
import type { Derived, Inputs } from "../core/types";

function statusColorHex(status: Derived["statusLevel"]): number {
  if (status === "stable") {
    return 0x30f2a0;
  }
  if (status === "near-limit") {
    return 0xffb347;
  }
  return 0xff4d6d;
}

export class OverlayVisual {
  public readonly group: THREE.Group;

  private forceArrow: THREE.ArrowHelper;
  private loadArrow: THREE.ArrowHelper;
  private topPulse: THREE.Mesh;
  private densityLine: THREE.Line;
  private densityPositions: Float32Array;

  public constructor(sampleCount: number) {
    this.group = new THREE.Group();
    this.group.name = "overlay-visual";

    this.forceArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(14, 0, 0),
      1200,
      0x30f2a0,
      500,
      220,
    );

    this.loadArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(-14, 0, 0),
      1200,
      0xffb347,
      500,
      220,
    );

    const topPulseGeo = new THREE.SphereGeometry(3.6, 16, 16);
    const topPulseMat = new THREE.MeshStandardMaterial({
      color: 0xff56d0,
      emissive: 0xff37ba,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.3,
      metalness: 0.15,
      roughness: 0.5,
    });
    this.topPulse = new THREE.Mesh(topPulseGeo, topPulseMat);

    this.densityPositions = new Float32Array(sampleCount * 3);
    const densityGeometry = new THREE.BufferGeometry();
    densityGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.densityPositions, 3),
    );
    const densityMaterial = new THREE.LineBasicMaterial({
      color: 0x4ff5ff,
      transparent: true,
      opacity: 0.85,
    });
    this.densityLine = new THREE.Line(densityGeometry, densityMaterial);

    this.group.add(this.forceArrow, this.loadArrow, this.topPulse, this.densityLine);
  }

  public update(
    derived: Derived,
    inputs: Inputs,
    highlightKey: string | null,
    elapsedSec: number,
  ): void {
    const yTop = inputs.H;

    const forceLength = Math.max(500, Math.sqrt(Math.max(1, derived.forceTurn)) * 4.6);
    this.forceArrow.position.set(14, yTop * 0.64, 0);
    this.forceArrow.setLength(forceLength, Math.min(forceLength * 0.3, 1500), Math.min(forceLength * 0.15, 700));

    const loadLength = Math.max(500, Math.sqrt(Math.max(1, derived.loadWeight)) * 4.6);
    this.loadArrow.position.set(-14, yTop * 0.64, 0);
    this.loadArrow.setLength(loadLength, Math.min(loadLength * 0.3, 1500), Math.min(loadLength * 0.15, 700));

    const statusHex = statusColorHex(derived.statusLevel);
    this.forceArrow.setColor(new THREE.Color(statusHex));

    this.topPulse.position.set(0, yTop, 0);
    const topPulseMaterial = this.topPulse.material;
    if (topPulseMaterial instanceof THREE.MeshStandardMaterial) {
      const pulse = 0.78 + Math.sin(elapsedSec * 7.5) * 0.22;
      const focusBoost = highlightKey === "turnaround" ? 1.6 : 1;
      topPulseMaterial.emissiveIntensity = pulse * focusBoost;
      topPulseMaterial.opacity = 0.22 + (highlightKey === "turnaround" ? 0.16 : 0);
    }

    const sampleCount = derived.densitySamples.length;
    let maxDensity = 0;
    for (let i = 0; i < sampleCount; i += 1) {
      const density = derived.densitySamples[i] ?? 0;
      if (density > maxDensity) {
        maxDensity = density;
      }
    }
    maxDensity = Math.max(1, maxDensity);

    for (let i = 0; i < sampleCount; i += 1) {
      const ratio = i / (sampleCount - 1);
      const y = ratio * yTop;
      const density = derived.densitySamples[i] ?? 0;
      const densityRatio = density / maxDensity;
      const x = 18 + densityRatio * 9;
      const offset = i * 3;
      this.densityPositions[offset] = x;
      this.densityPositions[offset + 1] = y;
      this.densityPositions[offset + 2] = 0;
    }

    const densityAttribute = this.densityLine.geometry.getAttribute("position");
    if (densityAttribute instanceof THREE.BufferAttribute) {
      densityAttribute.needsUpdate = true;
    }

    const densityMaterial = this.densityLine.material;
    if (densityMaterial instanceof THREE.LineBasicMaterial) {
      densityMaterial.color.set(inputs.distributedCouplersEnabled ? 0x4ff5ff : 0xff3dc8);
    }
  }

  public dispose(): void {
    this.topPulse.geometry.dispose();
    const topMaterial = this.topPulse.material;
    if (topMaterial instanceof THREE.Material) {
      topMaterial.dispose();
    }

    this.densityLine.geometry.dispose();
    const densityMaterial = this.densityLine.material;
    if (densityMaterial instanceof THREE.Material) {
      densityMaterial.dispose();
    }
  }
}
