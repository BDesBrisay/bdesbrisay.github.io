import * as THREE from "three";
import type { CouplerSegment, Derived, Inputs } from "../core/types";

function disposeMesh(mesh: THREE.Mesh): void {
  mesh.geometry.dispose();
  const material = mesh.material;
  if (Array.isArray(material)) {
    for (const entry of material) {
      entry.dispose();
    }
    return;
  }
  material.dispose();
}

export class TowerVisual {
  public readonly group: THREE.Group;

  private outerTube: THREE.Mesh;
  private innerTube: THREE.Mesh;
  private topHead: THREE.Mesh;
  private loadPlatform: THREE.Mesh;
  private couplerGroup: THREE.Group;
  private currentCouplerCount = 0;

  public constructor() {
    this.group = new THREE.Group();
    this.group.name = "tower-visual";

    const outerGeo = new THREE.CylinderGeometry(6, 6, 1, 24, 1, true);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x224d8e,
      emissive: 0x113a66,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.34,
      metalness: 0.25,
      roughness: 0.36,
    });
    this.outerTube = new THREE.Mesh(outerGeo, outerMat);

    const innerGeo = new THREE.CylinderGeometry(2.4, 2.4, 1, 24, 1, true);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x62f5ff,
      emissive: 0x1eb5d0,
      emissiveIntensity: 1.1,
      transparent: true,
      opacity: 0.16,
      metalness: 0.3,
      roughness: 0.25,
    });
    this.innerTube = new THREE.Mesh(innerGeo, innerMat);

    const headGeo = new THREE.TorusGeometry(8, 1.1, 18, 56);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xff4fd3,
      emissive: 0x7f1c6f,
      emissiveIntensity: 1.2,
      metalness: 0.3,
      roughness: 0.4,
    });
    this.topHead = new THREE.Mesh(headGeo, headMat);
    this.topHead.rotation.x = Math.PI / 2;

    const platformGeo = new THREE.CylinderGeometry(9, 9, 2, 32);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x39456f,
      emissive: 0x192540,
      emissiveIntensity: 0.6,
      metalness: 0.2,
      roughness: 0.5,
    });
    this.loadPlatform = new THREE.Mesh(platformGeo, platformMat);

    this.couplerGroup = new THREE.Group();
    this.couplerGroup.name = "couplers";

    this.group.add(this.outerTube, this.innerTube, this.topHead, this.loadPlatform, this.couplerGroup);
  }

  private rebuildCouplers(segments: CouplerSegment[]): void {
    for (const child of this.couplerGroup.children) {
      if (child instanceof THREE.Mesh) {
        disposeMesh(child);
      }
    }
    this.couplerGroup.clear();

    const maxForce = Math.max(
      1,
      ...segments.map((segment) => segment.force),
    );

    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      if (segment === undefined) {
        continue;
      }
      const forceNorm = segment.force / maxForce;
      const width = 7.1 + forceNorm * 2.1;
      const height = Math.max(0.8, segment.zEnd - segment.zStart);
      const geo = new THREE.CylinderGeometry(width, width, height, 18, 1, true);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x27f5ff,
        emissive: 0x0fa4c1,
        emissiveIntensity: 0.2 + forceNorm * 1.1,
        transparent: true,
        opacity: 0.08 + forceNorm * 0.12,
        metalness: 0.12,
        roughness: 0.65,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, (segment.zStart + segment.zEnd) * 0.5, 0);
      this.couplerGroup.add(mesh);
    }

    this.currentCouplerCount = segments.length;
  }

  public update(inputs: Inputs, derived: Derived, highlightKey: string | null): void {
    const height = Math.max(1, inputs.H);

    this.outerTube.scale.set(1, height, 1);
    this.innerTube.scale.set(1, height, 1);
    this.outerTube.position.set(0, height * 0.5, 0);
    this.innerTube.position.set(0, height * 0.5, 0);
    this.topHead.position.set(0, height, 0);
    this.loadPlatform.position.set(0, height + 5, 0);

    if (this.currentCouplerCount !== derived.couplerSegments.length) {
      this.rebuildCouplers(derived.couplerSegments);
    }

    const topMaterial = this.topHead.material;
    if (topMaterial instanceof THREE.MeshStandardMaterial) {
      const focusBoost = highlightKey === "turnaround" ? 1.5 : 1;
      topMaterial.emissiveIntensity = (0.8 + Math.min(2.5, derived.forceTurn / 5_000_000)) * focusBoost;
    }

    this.couplerGroup.visible = inputs.distributedCouplersEnabled;
  }

  public dispose(): void {
    disposeMesh(this.outerTube);
    disposeMesh(this.innerTube);
    disposeMesh(this.topHead);
    disposeMesh(this.loadPlatform);

    for (const child of this.couplerGroup.children) {
      if (child instanceof THREE.Mesh) {
        disposeMesh(child);
      }
    }
  }
}
