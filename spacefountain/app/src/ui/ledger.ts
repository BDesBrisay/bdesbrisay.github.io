import type { AppStoreApi, AppStoreState } from "../state/store";
import { formatDistance, formatForce, formatPercent, formatPower, formatVelocity } from "./format";

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

type TileDef = {
  id: string;
  label: string;
  highlightKey: string;
  value: (state: AppStoreState) => string;
};

export class EnergyLedger {
  public readonly root: HTMLDivElement;

  private readonly store: AppStoreApi;
  private readonly tiles = new Map<string, HTMLDivElement>();
  private unsubscribe: (() => void) | null = null;

  private readonly defs: TileDef[] = [
    {
      id: "status",
      label: "Support Margin",
      highlightKey: "support",
      value: (state) => formatPercent(state.derived.supportMargin),
    },
    {
      id: "forceTurn",
      label: "Turnaround Force",
      highlightKey: "turnaround",
      value: (state) => formatForce(state.derived.forceTurn),
    },
    {
      id: "loadWeight",
      label: "Load Weight",
      highlightKey: "support",
      value: (state) => formatForce(state.derived.loadWeight),
    },
    {
      id: "vTop",
      label: "Top Speed",
      highlightKey: "reachability",
      value: (state) => formatVelocity(state.derived.vTop),
    },
    {
      id: "vDelta",
      label: "vTop vs Baseline",
      highlightKey: "reachability",
      value: (state) => formatPercent(state.derived.vTopDeltaPct),
    },
    {
      id: "height",
      label: "Target Height",
      highlightKey: "reachability",
      value: (state) => formatDistance(state.inputs.H),
    },
    {
      id: "P_in",
      label: "Base Input",
      highlightKey: "energy-in",
      value: (state) => formatPower(state.derived.P_in),
    },
    {
      id: "P_grav",
      label: "Gravity Rate",
      highlightKey: "energy-gravity",
      value: (state) => formatPower(state.derived.P_grav),
    },
    {
      id: "P_rec",
      label: "Recovered",
      highlightKey: "energy-rec",
      value: (state) => formatPower(state.derived.P_rec),
    },
    {
      id: "P_drag",
      label: "Drag Loss",
      highlightKey: "energy-net",
      value: (state) => formatPower(state.derived.P_drag),
    },
    {
      id: "P_turnLoss",
      label: "Turnaround Loss",
      highlightKey: "energy-net",
      value: (state) => formatPower(state.derived.P_turnLoss),
    },
    {
      id: "P_net",
      label: "Net External",
      highlightKey: "energy-net",
      value: (state) => formatPower(state.derived.P_net),
    },
    {
      id: "efficiency",
      label: "Recovery Ratio",
      highlightKey: "energy-rec",
      value: (state) => formatPercent(state.derived.efficiency),
    },
  ];

  public constructor(container: HTMLElement, store: AppStoreApi) {
    this.store = store;
    this.root = createEl("div", "panel ledger-panel");

    for (const def of this.defs) {
      const tile = createEl("div", "ledger-tile");
      tile.dataset.highlightKey = def.highlightKey;
      const label = createEl("div", "ledger-label");
      label.textContent = def.label;
      const value = createEl("div", "ledger-value");
      value.textContent = "-";
      tile.append(label, value);

      tile.addEventListener("mouseenter", () => {
        this.store.getState().setHighlightKey(def.highlightKey);
      });
      tile.addEventListener("mouseleave", () => {
        this.store.getState().setHighlightKey(null);
      });

      this.tiles.set(def.id, tile);
      this.root.appendChild(tile);
    }

    container.appendChild(this.root);

    this.unsubscribe = this.store.subscribe((state: AppStoreState, prevState: AppStoreState) => {
      if (state.derived === prevState.derived && state.highlightKey === prevState.highlightKey) {
        return;
      }
      this.render(state);
    });

    this.render(this.store.getState());
  }

  private render(state: AppStoreState): void {
    for (const def of this.defs) {
      const tile = this.tiles.get(def.id);
      if (tile === undefined) {
        continue;
      }
      const value = tile.querySelector(".ledger-value");
      if (value instanceof HTMLDivElement) {
        value.textContent = def.value(state);
      }

      tile.classList.toggle("highlight", state.highlightKey === def.highlightKey);
      tile.classList.toggle("stable", state.derived.statusLevel === "stable" && def.id === "status");
      tile.classList.toggle("near", state.derived.statusLevel === "near-limit" && def.id === "status");
      tile.classList.toggle("unstable", state.derived.statusLevel === "unstable" && def.id === "status");
      tile.classList.toggle("negative", def.id === "P_net" && state.derived.P_net < 0);
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
