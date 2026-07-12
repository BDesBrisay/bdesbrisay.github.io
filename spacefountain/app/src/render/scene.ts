import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { SAMPLE_COUNT } from "../core/constants";
import type { Derived, Inputs, Packet, RenderTier, ViewMode } from "../core/types";
import { computeLockedCameraFrame } from "./lockedCameraFrame";
import { OverlayVisual } from "./overlays";
import { PelletVisual } from "./pellets";
import { TowerVisual } from "./tower";

type StarfieldBundle = {
  points: THREE.Points;
  count: number;
};

function createStarfield(count: number): StarfieldBundle {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const radius = 300 + Math.random() * 1200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(1 - 2 * Math.random());
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const index = i * 3;
    positions[index] = x;
    positions[index + 1] = y;
    positions[index + 2] = z;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0x76a9ff,
    size: 1.2,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.75,
  });
  return { points: new THREE.Points(geometry, material), count };
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

export class SceneController {
  private readonly container: HTMLElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly composer: EffectComposer;
  private readonly bloomPass: UnrealBloomPass;

  private readonly simRoot: THREE.Group;
  private readonly towerVisual: TowerVisual;
  private readonly pelletVisual: PelletVisual;
  private readonly overlayVisual: OverlayVisual;
  private readonly starfield: THREE.Points;
  private readonly starfieldFullCount: number;

  private mounted = false;
  private heightScale = 0.002;
  private dprCap = 2;
  private viewMode: ViewMode = "locked2d";
  private renderTier: RenderTier = "high";

  public constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x040812);

    this.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 750_000);
    this.camera.position.set(120, 72, 130);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(1, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 20;
    this.controls.maxDistance = 420;
    this.controls.target.set(0, 42, 0);

    const ambient = new THREE.AmbientLight(0x88aaff, 0.32);
    const key = new THREE.PointLight(0x4ff5ff, 2.2, 0, 2.0);
    key.position.set(80, 120, 80);
    const magenta = new THREE.PointLight(0xff3dc8, 1.6, 0, 2.0);
    magenta.position.set(-65, 110, -70);

    const floorGeo = new THREE.CircleGeometry(160, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a1e36,
      emissive: 0x061322,
      emissiveIntensity: 0.5,
      roughness: 0.92,
      metalness: 0.08,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.3;

    this.simRoot = new THREE.Group();
    this.towerVisual = new TowerVisual();
    this.pelletVisual = new PelletVisual();
    this.overlayVisual = new OverlayVisual(SAMPLE_COUNT);
    const starfieldBundle = createStarfield(2000);
    this.starfield = starfieldBundle.points;
    this.starfieldFullCount = starfieldBundle.count;

    this.simRoot.add(this.towerVisual.group, this.pelletVisual.mesh, this.overlayVisual.group);
    this.scene.add(ambient, key, magenta, floor, this.starfield, this.simRoot);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.65, 0.35, 0.85);
    this.composer.addPass(this.bloomPass);

    this.applyRenderTier();
    this.setViewMode("locked2d");
    this.resize();
  }

  private computeHeightScale(H: number): number {
    const targetWorldHeight = 130;
    return clamp(targetWorldHeight / Math.max(1, H), 0.0005, 0.025);
  }

  private applyPixelRatio(): void {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.dprCap));
  }

  private applyRenderTier(): void {
    if (this.renderTier === "high") {
      this.dprCap = 2;
      this.bloomPass.enabled = true;
      this.starfield.visible = true;
      this.starfield.geometry.setDrawRange(0, this.starfieldFullCount);
    } else if (this.renderTier === "medium") {
      this.dprCap = 1.5;
      this.bloomPass.enabled = false;
      this.starfield.visible = true;
      this.starfield.geometry.setDrawRange(0, Math.floor(this.starfieldFullCount * 0.6));
    } else {
      this.dprCap = 1;
      this.bloomPass.enabled = false;
      this.starfield.visible = false;
      this.starfield.geometry.setDrawRange(0, Math.floor(this.starfieldFullCount * 0.35));
    }

    const starMaterial = this.starfield.material;
    if (starMaterial instanceof THREE.PointsMaterial) {
      starMaterial.opacity = this.renderTier === "high" ? 0.75 : this.renderTier === "medium" ? 0.42 : 0.28;
      starMaterial.needsUpdate = true;
    }

    this.applyPixelRatio();
    if (this.mounted) {
      this.resize();
    }
  }

  public setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    const free3d = mode === "free3d";
    this.controls.enabled = free3d;
    this.controls.enableRotate = free3d;
    this.controls.enableZoom = free3d;
    this.controls.enablePan = free3d;
  }

  public setRenderTier(tier: RenderTier): void {
    if (this.renderTier === tier) {
      return;
    }
    this.renderTier = tier;
    this.applyRenderTier();
  }

  public resetCameraToLockedFrame(inputs: Inputs): void {
    this.heightScale = this.computeHeightScale(inputs.H);
    const frame = computeLockedCameraFrame(inputs.H, this.heightScale);
    this.controls.target.set(frame.target.x, frame.target.y, frame.target.z);
    this.camera.position.set(frame.position.x, frame.position.y, frame.position.z);
    this.camera.lookAt(frame.target.x, frame.target.y, frame.target.z);
  }

  public mount(): void {
    if (this.mounted) {
      return;
    }
    this.container.appendChild(this.renderer.domElement);
    this.mounted = true;
  }

  public resize(): void {
    const width = Math.max(320, this.container.clientWidth);
    const height = Math.max(260, this.container.clientHeight);

    this.applyPixelRatio();
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  }

  public update(
    inputs: Inputs,
    derived: Derived,
    packets: readonly Packet[],
    highlightKey: string | null,
    teachMode: boolean,
    elapsedSec: number,
  ): void {
    this.heightScale = this.computeHeightScale(inputs.H);
    this.simRoot.scale.set(1, this.heightScale, 1);

    this.towerVisual.update(inputs, derived, highlightKey);
    this.pelletVisual.update(packets, inputs, teachMode, elapsedSec);
    this.overlayVisual.update(derived, inputs, highlightKey, elapsedSec);

    if (this.viewMode === "locked2d") {
      const frame = computeLockedCameraFrame(inputs.H, this.heightScale);
      this.controls.target.set(frame.target.x, frame.target.y, frame.target.z);
      this.camera.position.set(frame.position.x, frame.position.y, frame.position.z);
      this.camera.lookAt(frame.target.x, frame.target.y, frame.target.z);
    } else {
      this.controls.update();
    }

    if (this.starfield.visible) {
      this.starfield.rotation.y += 0.00012;
    }

    if (this.renderTier === "high") {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  public getActivePacketCount(): number {
    return this.pelletVisual.getActiveCount();
  }

  public dispose(): void {
    this.controls.dispose();
    this.towerVisual.dispose();
    this.pelletVisual.dispose();
    this.overlayVisual.dispose();

    this.starfield.geometry.dispose();
    const starMaterial = this.starfield.material;
    if (starMaterial instanceof THREE.Material) {
      starMaterial.dispose();
    }

    this.renderer.dispose();
    if (this.mounted) {
      this.renderer.domElement.remove();
      this.mounted = false;
    }
  }
}
