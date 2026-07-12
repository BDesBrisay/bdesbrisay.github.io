import { INPUT_LIMITS } from "../core/constants";
import { PRESETS } from "../core/model/presets";
import type { Inputs } from "../core/types";
import { formatDistance, formatMass, formatPercent, formatVelocity } from "./format";
import type { AppStoreApi, AppStoreState } from "../state/store";

type NumericInputKey = {
  [K in keyof Inputs]: Inputs[K] extends number ? K : never;
}[keyof Inputs];

type SliderDef<K extends NumericInputKey> = {
  key: K;
  label: string;
  min: number;
  max: number;
  step: number;
  formatter: (value: number) => string;
  advanced?: boolean;
};

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

type ControlsPanelOptions = {
  onResetCamera?: () => void;
};

export class ControlsPanel {
  public readonly root: HTMLDivElement;

  private readonly store: AppStoreApi;
  private readonly sliderInputs = new Map<NumericInputKey, HTMLInputElement>();
  private readonly sliderValues = new Map<NumericInputKey, HTMLSpanElement>();
  private readonly presetButtons = new Map<string, HTMLButtonElement>();

  private readonly hintEl: HTMLParagraphElement;
  private readonly warningEl: HTMLDivElement;
  private readonly dragToggle: HTMLInputElement;
  private readonly rk4Toggle: HTMLInputElement;
  private readonly couplerToggle: HTMLInputElement;
  private readonly teachToggle: HTMLInputElement;
  private readonly compareToggle: HTMLInputElement;
  private readonly freeCameraToggle: HTMLInputElement;
  private readonly modeSelect: HTMLSelectElement;
  private readonly advancedToggleButton: HTMLButtonElement;
  private readonly resetCameraButton: HTMLButtonElement;
  private readonly advancedSection: HTMLElement;
  private readonly onResetCamera: (() => void) | null;

  private unsubscribe: (() => void) | null = null;

  public constructor(container: HTMLElement, store: AppStoreApi, options?: ControlsPanelOptions) {
    this.store = store;
    this.onResetCamera = options?.onResetCamera ?? null;
    this.root = createEl("div", "panel controls-panel");

    const title = createEl("h2", "panel-title");
    title.textContent = "Command Deck";

    const presetBar = createEl("div", "preset-bar");
    for (const preset of PRESETS) {
      const button = createEl("button", "preset-btn");
      button.type = "button";
      button.textContent = preset.label;
      button.title = preset.description;
      button.addEventListener("click", () => {
        this.store.getState().applyPreset(preset.id);
      });
      this.presetButtons.set(preset.id, button);
      presetBar.appendChild(button);
    }

    this.hintEl = createEl("p", "interaction-hint");
    this.warningEl = createEl("div", "warning-list");

    const basicSection = createEl("section", "controls-section");
    const basicTitle = createEl("h3", "section-title");
    basicTitle.textContent = "Core Inputs";
    basicSection.appendChild(basicTitle);

    const basicSliders: Array<SliderDef<NumericInputKey>> = [
      {
        key: "H",
        label: "Height",
        min: INPUT_LIMITS.H.min,
        max: INPUT_LIMITS.H.max,
        step: 500,
        formatter: formatDistance,
      },
      {
        key: "v0",
        label: "Injection Speed",
        min: INPUT_LIMITS.v0.min,
        max: INPUT_LIMITS.v0.max,
        step: 10,
        formatter: formatVelocity,
      },
      {
        key: "mdot",
        label: "Mass Flow",
        min: INPUT_LIMITS.mdot.min,
        max: INPUT_LIMITS.mdot.max,
        step: 5,
        formatter: (value) => `${value.toFixed(2)} kg/s`,
      },
      {
        key: "loadMass",
        label: "Load Mass",
        min: INPUT_LIMITS.loadMass.min,
        max: INPUT_LIMITS.loadMass.max,
        step: 500,
        formatter: formatMass,
      },
      {
        key: "etaRec",
        label: "Recovery Efficiency",
        min: INPUT_LIMITS.etaRec.min,
        max: INPUT_LIMITS.etaRec.max,
        step: 0.01,
        formatter: formatPercent,
      },
    ];

    for (const slider of basicSliders) {
      basicSection.appendChild(this.createSlider(slider));
    }

    const modeRow = createEl("div", "field-row");
    const modeLabel = createEl("label", "field-label");
    modeLabel.textContent = "Turnaround Mode";
    this.modeSelect = createEl("select", "field-select");

    const modes: Array<{ value: Inputs["turnaroundMode"]; label: string }> = [
      { value: "idealReverse", label: "Ideal Reverse" },
      { value: "lossyReverse", label: "Lossy Reverse" },
      { value: "stopAndDrop", label: "Stop and Drop" },
    ];

    for (const mode of modes) {
      const option = createEl("option");
      option.value = mode.value;
      option.textContent = mode.label;
      this.modeSelect.appendChild(option);
    }

    this.modeSelect.addEventListener("change", () => {
      const value = this.modeSelect.value as Inputs["turnaroundMode"];
      this.store.getState().setTurnaroundMode(value);
    });

    modeRow.append(modeLabel, this.modeSelect);

    const toggles = createEl("div", "toggle-grid");
    this.dragToggle = this.createToggle(toggles, "Enable Drag", (checked) => {
      this.store.getState().setInput("dragEnabled", checked);
    });
    this.rk4Toggle = this.createToggle(toggles, "Use RK4 Integrator", (checked) => {
      this.store.getState().setInput("useRk4", checked);
    });
    this.couplerToggle = this.createToggle(toggles, "Distributed Couplers", (checked) => {
      this.store.getState().setInput("distributedCouplersEnabled", checked);
    });
    this.teachToggle = this.createToggle(toggles, "Teach Mode", (checked) => {
      this.store.getState().setTeachMode(checked);
    });
    this.compareToggle = this.createToggle(toggles, "Show Baseline Overlay", (checked) => {
      this.store.getState().setCompareAgainstNoDrag(checked);
    });

    this.advancedToggleButton = createEl("button", "advanced-toggle");
    this.advancedToggleButton.type = "button";
    this.advancedToggleButton.textContent = "Show Advanced Controls";
    this.advancedToggleButton.addEventListener("click", () => {
      const current = this.store.getState().showAdvancedControls;
      this.store.getState().setShowAdvancedControls(!current);
    });

    this.resetCameraButton = createEl("button", "advanced-toggle");
    this.resetCameraButton.type = "button";
    this.resetCameraButton.textContent = "Reset Camera";
    this.resetCameraButton.addEventListener("click", () => {
      this.store.getState().setViewMode("locked2d");
      this.onResetCamera?.();
    });

    this.advancedSection = createEl("section", "controls-section advanced-section");
    const advancedTitle = createEl("h3", "section-title");
    advancedTitle.textContent = "Advanced Inputs";
    this.advancedSection.appendChild(advancedTitle);

    const advancedToggles = createEl("div", "toggle-grid");
    this.freeCameraToggle = this.createToggle(advancedToggles, "Enable Free Camera", (checked) => {
      this.store.getState().setViewMode(checked ? "free3d" : "locked2d");
    });
    this.advancedSection.appendChild(advancedToggles);

    const advancedSliders: Array<SliderDef<NumericInputKey>> = [
      {
        key: "turnaroundLossFraction",
        label: "Turnaround Loss Fraction",
        min: INPUT_LIMITS.turnaroundLossFraction.min,
        max: INPUT_LIMITS.turnaroundLossFraction.max,
        step: 0.01,
        formatter: formatPercent,
        advanced: true,
      },
      {
        key: "pelletRadius",
        label: "Pellet Radius",
        min: INPUT_LIMITS.pelletRadius.min,
        max: INPUT_LIMITS.pelletRadius.max,
        step: 0.001,
        formatter: (value) => `${value.toFixed(3)} m`,
        advanced: true,
      },
      {
        key: "Cd",
        label: "Drag Coefficient",
        min: INPUT_LIMITS.Cd.min,
        max: INPUT_LIMITS.Cd.max,
        step: 0.01,
        formatter: (value) => value.toFixed(2),
        advanced: true,
      },
      {
        key: "rho",
        label: "Air Density",
        min: INPUT_LIMITS.rho.min,
        max: INPUT_LIMITS.rho.max,
        step: 0.01,
        formatter: (value) => `${value.toFixed(2)} kg/m^3`,
        advanced: true,
      },
      {
        key: "packetDt",
        label: "Packet Spawn Delta",
        min: INPUT_LIMITS.packetDt.min,
        max: INPUT_LIMITS.packetDt.max,
        step: 0.001,
        formatter: (value) => `${(value * 1000).toFixed(1)} ms`,
        advanced: true,
      },
      {
        key: "couplerCount",
        label: "Coupler Count",
        min: INPUT_LIMITS.couplerCount.min,
        max: INPUT_LIMITS.couplerCount.max,
        step: 1,
        formatter: (value) => `${Math.round(value)}`,
        advanced: true,
      },
      {
        key: "couplerStrength",
        label: "Coupler Force Share",
        min: INPUT_LIMITS.couplerStrength.min,
        max: INPUT_LIMITS.couplerStrength.max,
        step: 0.01,
        formatter: formatPercent,
        advanced: true,
      },
    ];

    for (const slider of advancedSliders) {
      this.advancedSection.appendChild(this.createSlider(slider));
    }

    this.root.append(
      title,
      presetBar,
      this.hintEl,
      basicSection,
      modeRow,
      toggles,
      this.advancedToggleButton,
      this.resetCameraButton,
      this.advancedSection,
      this.warningEl,
    );

    container.appendChild(this.root);

    this.unsubscribe = this.store.subscribe((state, prevState) => {
      if (
        state.inputs === prevState.inputs &&
        state.activePresetId === prevState.activePresetId &&
        state.interactionHint === prevState.interactionHint &&
        state.derived.warnings === prevState.derived.warnings &&
        state.teachMode === prevState.teachMode &&
        state.compareAgainstNoDrag === prevState.compareAgainstNoDrag &&
        state.showAdvancedControls === prevState.showAdvancedControls &&
        state.viewMode === prevState.viewMode
      ) {
        return;
      }
      this.render(state);
    });

    this.render(this.store.getState());
  }

  private createSlider<K extends NumericInputKey>(slider: SliderDef<K>): HTMLDivElement {
    const row = createEl("div", "slider-row");
    if (slider.advanced === true) {
      row.classList.add("advanced-only");
    }

    const label = createEl("label", "slider-label");
    label.textContent = slider.label;

    const value = createEl("span", "slider-value");

    const input = createEl("input", "slider-input");
    input.type = "range";
    input.min = String(slider.min);
    input.max = String(slider.max);
    input.step = String(slider.step);
    input.addEventListener("input", () => {
      const numeric = Number(input.value);
      this.store.getState().setInput(slider.key, numeric as Inputs[K]);
    });

    this.sliderInputs.set(slider.key, input);
    this.sliderValues.set(slider.key, value);

    const top = createEl("div", "slider-top");
    top.append(label, value);

    row.append(top, input);
    return row;
  }

  private createToggle(
    container: HTMLElement,
    labelText: string,
    onChange: (checked: boolean) => void,
  ): HTMLInputElement {
    const label = createEl("label", "toggle-item");
    const input = createEl("input");
    input.type = "checkbox";
    input.addEventListener("change", () => {
      onChange(input.checked);
    });

    const text = createEl("span");
    text.textContent = labelText;

    label.append(input, text);
    container.appendChild(label);
    return input;
  }

  private render(state: AppStoreState): void {
    this.hintEl.textContent = state.interactionHint;

    for (const [presetId, button] of this.presetButtons) {
      button.classList.toggle("active", presetId === state.activePresetId);
    }

    for (const [key, input] of this.sliderInputs) {
      const value = state.inputs[key];
      input.value = String(value);
    }

    for (const [key, valueEl] of this.sliderValues) {
      const value = state.inputs[key];
      if (key === "H") {
        valueEl.textContent = formatDistance(value);
      } else if (key === "v0") {
        valueEl.textContent = formatVelocity(value);
      } else if (key === "loadMass") {
        valueEl.textContent = formatMass(value);
      } else if (
        key === "etaRec" ||
        key === "turnaroundLossFraction" ||
        key === "couplerStrength"
      ) {
        valueEl.textContent = formatPercent(value);
      } else if (key === "mdot") {
        valueEl.textContent = `${value.toFixed(2)} kg/s`;
      } else if (key === "pelletRadius") {
        valueEl.textContent = `${value.toFixed(3)} m`;
      } else if (key === "rho") {
        valueEl.textContent = `${value.toFixed(2)} kg/m^3`;
      } else if (key === "packetDt") {
        valueEl.textContent = `${(value * 1000).toFixed(1)} ms`;
      } else {
        valueEl.textContent = value.toFixed(2);
      }
    }

    this.dragToggle.checked = state.inputs.dragEnabled;
    this.rk4Toggle.checked = state.inputs.useRk4;
    this.couplerToggle.checked = state.inputs.distributedCouplersEnabled;
    this.teachToggle.checked = state.teachMode;
    this.compareToggle.checked = state.compareAgainstNoDrag;
    this.freeCameraToggle.checked = state.viewMode === "free3d";
    this.modeSelect.value = state.inputs.turnaroundMode;

    this.advancedSection.classList.toggle("hidden", !state.showAdvancedControls);
    this.advancedToggleButton.textContent = state.showAdvancedControls
      ? "Hide Advanced Controls"
      : "Show Advanced Controls";

    this.warningEl.innerHTML = "";
    for (const warning of state.derived.warnings) {
      const item = createEl("div", "warning-item");
      item.textContent = warning;
      this.warningEl.appendChild(item);
    }
  }

  public dispose(): void {
    if (this.unsubscribe !== null) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.root.remove();
  }
}
