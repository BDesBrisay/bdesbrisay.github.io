import Chart from "chart.js/auto";
import type {
  ChartConfiguration,
  ChartDataset,
  ChartType,
  ScatterDataPoint,
} from "chart.js";
import { vAtZ } from "../core/physics/analytic";
import type { AppStoreApi, AppStoreState, ChartTab } from "../state/store";

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

function modeScale(mode: AppStoreState["inputs"]["turnaroundMode"], lossFraction: number): number {
  if (mode === "stopAndDrop") {
    return 1;
  }
  if (mode === "lossyReverse") {
    return 2 - Math.min(0.95, Math.max(0, lossFraction));
  }
  return 2;
}

function chartTypeForTab(tab: ChartTab): ChartType {
  return tab === "power" ? "bar" : "line";
}

export class ChartsPanel {
  public readonly root: HTMLDivElement;

  private readonly store: AppStoreApi;
  private readonly frame: HTMLDivElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly tabButtons = new Map<ChartTab, HTMLButtonElement>();
  private chart: Chart | null = null;
  private currentType: ChartType | null = null;
  private unsubscribe: (() => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;

  public constructor(container: HTMLElement, store: AppStoreApi) {
    this.store = store;
    this.root = createEl("div", "panel charts-panel");

    const title = createEl("h2", "panel-title");
    title.textContent = "Profiles";

    const tabs = createEl("div", "chart-tabs");
    const tabDefs: Array<{ tab: ChartTab; label: string }> = [
      { tab: "velocity", label: "Velocity" },
      { tab: "force", label: "Force" },
      { tab: "power", label: "Power" },
      { tab: "density", label: "Density" },
    ];

    for (const def of tabDefs) {
      const button = createEl("button", "chart-tab-btn");
      button.type = "button";
      button.textContent = def.label;
      button.addEventListener("click", () => {
        this.store.getState().setChartTab(def.tab);
      });
      this.tabButtons.set(def.tab, button);
      tabs.appendChild(button);
    }

    this.frame = createEl("div", "chart-frame");
    this.canvas = createEl("canvas", "chart-canvas");
    this.frame.appendChild(this.canvas);

    this.root.append(title, tabs, this.frame);
    container.appendChild(this.root);

    this.unsubscribe = this.store.subscribe((state: AppStoreState, prevState: AppStoreState) => {
      if (
        state.chartTab === prevState.chartTab &&
        state.derived === prevState.derived &&
        state.compareAgainstNoDrag === prevState.compareAgainstNoDrag &&
        state.inputs.dragEnabled === prevState.inputs.dragEnabled &&
        state.inputs.turnaroundMode === prevState.inputs.turnaroundMode &&
        state.inputs.turnaroundLossFraction === prevState.inputs.turnaroundLossFraction
      ) {
        return;
      }
      this.render(state);
    });

    this.resizeObserver = new ResizeObserver(() => {
      this.chart?.resize();
    });
    this.resizeObserver.observe(this.frame);

    this.render(this.store.getState());
  }

  private createLineData(
    state: AppStoreState,
    tab: "velocity" | "force" | "density",
  ): ChartDataset<"line", ScatterDataPoint[]>[] {
    const z = state.derived.zSamples;
    const activeY =
      tab === "velocity"
        ? state.derived.vSamples
        : tab === "force"
          ? state.derived.fSamples
          : state.derived.densitySamples;

    const activePoints: ScatterDataPoint[] = [];
    for (let i = 0; i < z.length; i += 1) {
      activePoints.push({ x: (z[i] ?? 0) / 1000, y: activeY[i] ?? 0 });
    }

    const datasets: ChartDataset<"line", ScatterDataPoint[]>[] = [
      {
        label: state.inputs.dragEnabled ? "Active (Integrated)" : "Active (Analytic)",
        data: activePoints,
        borderColor: "#4ff5ff",
        backgroundColor: "rgba(79,245,255,0.2)",
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.23,
      },
    ];

    if (state.compareAgainstNoDrag && (tab === "velocity" || tab === "force")) {
      const referencePoints: ScatterDataPoint[] = [];
      const scale = modeScale(state.inputs.turnaroundMode, state.inputs.turnaroundLossFraction);
      for (let i = 0; i < z.length; i += 1) {
        const zMeters = z[i] ?? 0;
        const v = vAtZ(state.inputs.v0, zMeters);
        referencePoints.push({
          x: zMeters / 1000,
          y: tab === "velocity" ? v : state.inputs.mdot * scale * v,
        });
      }
      datasets.push({
        label: "No Drag Baseline",
        data: referencePoints,
        borderColor: "#ff3dc8",
        backgroundColor: "rgba(255,61,200,0.2)",
        borderDash: [8, 4],
        pointRadius: 0,
        borderWidth: 1.6,
        tension: 0.18,
      });
    }

    if (tab === "density") {
      const topOnly: ScatterDataPoint[] = [];
      for (let i = 0; i < z.length; i += 1) {
        const isTop = i === z.length - 1;
        topOnly.push({
          x: (z[i] ?? 0) / 1000,
          y: isTop ? state.derived.forceTurn : 0,
        });
      }
      datasets.push({
        label: "Top-Only Reference",
        data: topOnly,
        borderColor: "#ffb347",
        backgroundColor: "rgba(255,179,71,0.2)",
        borderDash: [5, 5],
        pointRadius: 0,
        borderWidth: 1.5,
        tension: 0,
      });
    }

    return datasets;
  }

  private createPowerConfig(state: AppStoreState): ChartConfiguration<"bar"> {
    return {
      type: "bar",
      data: {
        labels: ["Input", "Recovered", "Drag Loss", "Turn Loss", "Net"],
        datasets: [
          {
            label: "Power (W)",
            data: [
              state.derived.P_in,
              state.derived.P_rec,
              state.derived.P_drag,
              state.derived.P_turnLoss,
              state.derived.P_net,
            ],
            backgroundColor: [
              "rgba(79,245,255,0.65)",
              "rgba(48,242,160,0.65)",
              "rgba(255,179,71,0.65)",
              "rgba(255,96,120,0.65)",
              "rgba(142,198,255,0.65)",
            ],
            borderColor: [
              "#4ff5ff",
              "#30f2a0",
              "#ffb347",
              "#ff6078",
              "#8ec6ff",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { color: "rgba(107,169,181,0.15)" },
            ticks: { color: "#b8f3ff" },
          },
          y: {
            grid: { color: "rgba(107,169,181,0.18)" },
            ticks: { color: "#b8f3ff" },
          },
        },
      },
    };
  }

  private createLineConfig(
    state: AppStoreState,
    tab: "velocity" | "force" | "density",
  ): ChartConfiguration<"line"> {
    const datasets = this.createLineData(state, tab);

    const yLabel =
      tab === "velocity"
        ? "Velocity (m/s)"
        : tab === "force"
          ? "Force Proxy (N)"
          : "Force Density (N/m)";

    return {
      type: "line",
      data: {
        datasets,
      },
      options: {
        parsing: false,
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            labels: {
              color: "#b8f3ff",
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            title: {
              display: true,
              text: "Height (km)",
              color: "#b8f3ff",
            },
            grid: { color: "rgba(107,169,181,0.18)" },
            ticks: { color: "#b8f3ff" },
          },
          y: {
            title: {
              display: true,
              text: yLabel,
              color: "#b8f3ff",
            },
            grid: { color: "rgba(107,169,181,0.18)" },
            ticks: { color: "#b8f3ff" },
          },
        },
      },
    };
  }

  private rebuildChart(state: AppStoreState): void {
    const tab = state.chartTab;
    const type = chartTypeForTab(tab);

    if (this.chart !== null) {
      this.chart.destroy();
      this.chart = null;
    }

    if (type === "bar") {
      this.chart = new Chart(this.canvas, this.createPowerConfig(state));
    } else {
      this.chart = new Chart(
        this.canvas,
        this.createLineConfig(state, tab as "velocity" | "force" | "density"),
      );
    }

    this.currentType = type;
  }

  private render(state: AppStoreState): void {
    for (const [tab, button] of this.tabButtons) {
      button.classList.toggle("active", state.chartTab === tab);
    }

    const expectedType = chartTypeForTab(state.chartTab);
    if (this.chart === null || this.currentType !== expectedType) {
      this.rebuildChart(state);
      return;
    }

    if (state.chartTab === "power") {
      const firstDataset = this.chart.data.datasets[0];
      if (firstDataset !== undefined) {
        firstDataset.data = [
          state.derived.P_in,
          state.derived.P_rec,
          state.derived.P_drag,
          state.derived.P_turnLoss,
          state.derived.P_net,
        ];
      }
      this.chart.update("none");
      return;
    }

    const config = this.createLineConfig(state, state.chartTab);
    this.chart.data = config.data;
    if (config.options !== undefined) {
      this.chart.options = config.options;
    }
    this.chart.update("none");
  }

  public dispose(): void {
    if (this.unsubscribe !== null) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.resizeObserver !== null) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.chart !== null) {
      this.chart.destroy();
      this.chart = null;
    }

    this.root.remove();
  }
}
