import "./styles/theme.css";
import { SIM_FIXED_DT } from "./core/constants";
import { packetCapForTier, RenderTierController } from "./render/perfTier";
import { SceneController } from "./render/scene";
import { PacketStream } from "./sim/packetStream";
import { appStore } from "./state/store";
import { ChartsPanel } from "./ui/charts";
import { ControlsPanel } from "./ui/controls";
import { formatDistance, formatForce, formatPercent, formatPower, formatVelocity } from "./ui/format";
import { FormulaCardsPanel } from "./ui/formulaCards";
import { EnergyLedger } from "./ui/ledger";

function createEl<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (className !== undefined) {
    el.className = className;
  }
  return el;
}

const root = document.getElementById("app");
if (root === null) {
  throw new Error("Missing #app container");
}

const shell = createEl("div", "app-shell");

const topBar = createEl("header", "top-bar panel");
const titleWrap = createEl("div", "title-wrap");
const appTitle = createEl("h1", "app-title");
appTitle.textContent = "Space Fountain Simulator";
const subtitle = createEl("p", "app-subtitle");
subtitle.textContent = "Momentum flux, force support, and energy accounting in real time.";
titleWrap.append(appTitle, subtitle);

const statusWrap = createEl("div", "status-wrap");
const statusBadge = createEl("div", "status-badge");
const supportMetric = createEl("div", "status-metric");
const vTopMetric = createEl("div", "status-metric");
const netMetric = createEl("div", "status-metric");
const forceMetric = createEl("div", "status-metric");
const reachMetric = createEl("div", "status-metric");
const perfMetric = createEl("div", "status-metric perf-metric");
statusWrap.append(statusBadge, supportMetric, vTopMetric, netMetric, forceMetric, reachMetric, perfMetric);

const mainGrid = createEl("div", "main-grid");
const leftRail = createEl("aside", "left-rail");
const centerRail = createEl("section", "center-rail panel");
const rightRail = createEl("aside", "right-rail");

const viewport = createEl("div", "viewport");
const viewportOverlay = createEl("div", "viewport-overlay");
const teachLabel = createEl("div", "teach-label");
teachLabel.textContent = "Teach Mode";
viewportOverlay.appendChild(teachLabel);
centerRail.append(viewport, viewportOverlay);

const bottomBar = createEl("footer", "bottom-rail");

topBar.append(titleWrap, statusWrap);
mainGrid.append(leftRail, centerRail, rightRail);
shell.append(topBar, mainGrid, bottomBar);
root.appendChild(shell);

const scene = new SceneController(viewport);
scene.mount();

const stream = new PacketStream();
const initialState = appStore.getState();
const tierController = new RenderTierController(initialState.renderTier);

const controlsPanel = new ControlsPanel(leftRail, appStore, {
  onResetCamera: () => {
    const state = appStore.getState();
    scene.setViewMode("locked2d");
    scene.resetCameraToLockedFrame(state.inputs);
  },
});
const formulaPanel = new FormulaCardsPanel(rightRail, appStore);
const chartsPanel = new ChartsPanel(rightRail, appStore);
const ledger = new EnergyLedger(bottomBar, appStore);

scene.setRenderTier(initialState.renderTier);
scene.setViewMode(initialState.viewMode);
scene.resetCameraToLockedFrame(initialState.inputs);

const resizeObserver = new ResizeObserver(() => {
  scene.resize();
});
resizeObserver.observe(viewport);

let animationHandle = 0;
let acc = 0;
let lastMs = performance.now();
let elapsed = 0;
let fpsFrames = 0;
let fpsTime = 0;
let rollingFps = 0;

function updateTopBar(): void {
  const state = appStore.getState();
  const derived = state.derived;

  statusBadge.textContent =
    derived.statusLevel === "stable"
      ? "Stable"
      : derived.statusLevel === "near-limit"
        ? "Near Limit"
        : "Unstable";

  statusBadge.classList.toggle("stable", derived.statusLevel === "stable");
  statusBadge.classList.toggle("near", derived.statusLevel === "near-limit");
  statusBadge.classList.toggle("unstable", derived.statusLevel === "unstable");

  supportMetric.textContent = `Support: ${formatPercent(derived.supportMargin)}`;
  vTopMetric.textContent = `v_top: ${formatVelocity(derived.vTop)}`;
  netMetric.textContent = `P_net: ${formatPower(derived.P_net)}`;
  forceMetric.textContent = `F_turn: ${formatForce(derived.forceTurn)}`;
  reachMetric.textContent = derived.isReachable
    ? `Reachability: OK (${formatDistance(state.inputs.H)})`
    : "Reachability: FAIL";

  const perf = state.performance;
  perfMetric.textContent =
    `FPS ${perf.fps.toFixed(0)} | Sim ${perf.simMs.toFixed(2)}ms | Packets ${perf.packetCount}` +
    ` | Tier ${state.renderTier.toUpperCase()}`;

  teachLabel.classList.toggle("visible", state.teachMode);
}

const unsubscribeState = appStore.subscribe((state, prevState) => {
  if (state.inputs !== prevState.inputs) {
    stream.reset();
    if (state.viewMode === "locked2d") {
      scene.resetCameraToLockedFrame(state.inputs);
    }
  }

  if (state.viewMode !== prevState.viewMode) {
    scene.setViewMode(state.viewMode);
    if (state.viewMode === "locked2d") {
      scene.resetCameraToLockedFrame(state.inputs);
    }
  }

  if (state.renderTier !== prevState.renderTier) {
    scene.setRenderTier(state.renderTier);
  }

  updateTopBar();
});

function frame(nowMs: number): void {
  const state = appStore.getState();

  const frameDt = (nowMs - lastMs) / 1000;
  lastMs = nowMs;
  elapsed += frameDt;
  acc += Math.min(frameDt, 0.2);

  const timeScale = state.teachMode ? 0.3 : 1;
  const effectiveStep = SIM_FIXED_DT * timeScale;
  const packetCap = packetCapForTier(state.renderTier);

  const simStart = performance.now();
  while (acc >= SIM_FIXED_DT) {
    stream.step(effectiveStep, state.inputs, packetCap);
    acc -= SIM_FIXED_DT;
  }
  const simMs = performance.now() - simStart;

  scene.update(
    state.inputs,
    state.derived,
    stream.getPackets(),
    state.highlightKey,
    state.teachMode,
    elapsed,
  );

  fpsFrames += 1;
  fpsTime += frameDt;
  if (fpsTime >= 0.5) {
    rollingFps = fpsFrames / fpsTime;
    fpsFrames = 0;
    fpsTime = 0;

    const currentTier = tierController.getTier();
    const nextTier = tierController.sample(rollingFps);
    if (nextTier !== currentTier) {
      appStore.getState().setRenderTier(nextTier);
    }

    appStore.getState().setPerformance({
      fps: rollingFps,
      simMs,
      packetCount: scene.getActivePacketCount(),
    });
  }

  animationHandle = window.requestAnimationFrame(frame);
}

updateTopBar();
animationHandle = window.requestAnimationFrame(frame);

window.addEventListener("beforeunload", () => {
  window.cancelAnimationFrame(animationHandle);
  unsubscribeState();
  resizeObserver.disconnect();
  controlsPanel.dispose();
  formulaPanel.dispose();
  chartsPanel.dispose();
  ledger.dispose();
  scene.dispose();
});
