import { createStore } from "zustand/vanilla";
import type { StoreApi } from "zustand/vanilla";
import { DEFAULT_INPUTS } from "../core/constants";
import { derive } from "../core/model/derive";
import { buildFormulaCards } from "../core/model/formulas";
import { getPresetById, PRESETS } from "../core/model/presets";
import type {
  Derived,
  FormulaCard,
  Inputs,
  PerformanceStats,
  Preset,
  RenderTier,
  TurnaroundMode,
  ViewMode,
} from "../core/types";

export type ChartTab = "velocity" | "force" | "power" | "density";

export type AppState = {
  inputs: Inputs;
  derived: Derived;
  formulas: FormulaCard[];
  activePresetId: string;
  chartTab: ChartTab;
  teachMode: boolean;
  showAdvancedControls: boolean;
  highlightKey: string | null;
  interactionHint: string;
  compareAgainstNoDrag: boolean;
  performance: PerformanceStats;
  viewMode: ViewMode;
  renderTier: RenderTier;
};

export type AppActions = {
  setInput: <K extends keyof Inputs>(key: K, value: Inputs[K]) => void;
  setTurnaroundMode: (mode: TurnaroundMode) => void;
  setChartTab: (tab: ChartTab) => void;
  setTeachMode: (enabled: boolean) => void;
  setShowAdvancedControls: (enabled: boolean) => void;
  setHighlightKey: (key: string | null) => void;
  applyPreset: (presetId: string) => void;
  setInteractionHint: (hint: string) => void;
  setCompareAgainstNoDrag: (enabled: boolean) => void;
  setPerformance: (stats: PerformanceStats) => void;
  setViewMode: (mode: ViewMode) => void;
  setRenderTier: (tier: RenderTier) => void;
};

export type AppStoreState = AppState & AppActions;
export type AppStoreApi = StoreApi<AppStoreState>;

function deriveAll(inputs: Inputs): { derived: Derived; formulas: FormulaCard[] } {
  const derived = derive(inputs);
  const formulas = buildFormulaCards(inputs, derived);
  return { derived, formulas };
}

const initial = deriveAll(DEFAULT_INPUTS);
const initialPreset = PRESETS[1] ?? PRESETS[0];

if (initialPreset === undefined) {
  throw new Error("Preset registry is empty");
}

export const appStore = createStore<AppStoreState>((set, get) => ({
  inputs: DEFAULT_INPUTS,
  derived: initial.derived,
  formulas: initial.formulas,
  activePresetId: initialPreset.id,
  chartTab: "velocity",
  teachMode: false,
  showAdvancedControls: false,
  highlightKey: null,
  interactionHint: "Adjust controls to see momentum and energy responses live.",
  compareAgainstNoDrag: true,
  performance: {
    fps: 0,
    simMs: 0,
    packetCount: 0,
  },
  viewMode: "locked2d",
  renderTier: "high",

  setInput: (key, value) => {
    const prev = get().inputs;
    const nextInputs: Inputs = {
      ...prev,
      [key]: value,
    };
    const next = deriveAll(nextInputs);

    const hint = key === "mdot"
      ? "Increasing mass flow raises momentum flux and turnaround force nearly linearly."
      : key === "H"
        ? "Higher target altitude requires more launch energy and usually lowers top speed."
        : key === "v0"
          ? "Launch speed strongly affects reachability and turnaround force at the top."
          : "Updated model outputs based on your current inputs.";

    set({
      inputs: nextInputs,
      derived: next.derived,
      formulas: next.formulas,
      interactionHint: hint,
    });
  },

  setTurnaroundMode: (mode) => {
    get().setInput("turnaroundMode", mode);
  },

  setChartTab: (tab) => {
    set({ chartTab: tab });
  },

  setTeachMode: (enabled) => {
    set({ teachMode: enabled });
  },

  setShowAdvancedControls: (enabled) => {
    set({ showAdvancedControls: enabled });
  },

  setHighlightKey: (key) => {
    set({ highlightKey: key });
  },

  applyPreset: (presetId) => {
    const preset: Preset = getPresetById(presetId);
    const next = deriveAll(preset.inputs);
    set({
      inputs: preset.inputs,
      derived: next.derived,
      formulas: next.formulas,
      activePresetId: preset.id,
      interactionHint: preset.description,
    });
  },

  setInteractionHint: (hint) => {
    set({ interactionHint: hint });
  },

  setCompareAgainstNoDrag: (enabled) => {
    set({ compareAgainstNoDrag: enabled });
  },

  setPerformance: (stats) => {
    set({ performance: stats });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  setRenderTier: (tier) => {
    set({ renderTier: tier });
  },
}));
