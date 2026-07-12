import { requiredV0 } from "../physics/analytic";
import type { Derived, FormulaCard, Inputs } from "../types";

function formatNumber(value: number, digits: number): string {
  return Number.isFinite(value) ? value.toFixed(digits) : "0";
}

function formatPowerWatts(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) {
    return `${(value / 1e9).toFixed(2)} GW`;
  }
  if (abs >= 1e6) {
    return `${(value / 1e6).toFixed(2)} MW`;
  }
  if (abs >= 1e3) {
    return `${(value / 1e3).toFixed(2)} kW`;
  }
  return `${value.toFixed(2)} W`;
}

function formatForce(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) {
    return `${(value / 1e9).toFixed(2)} GN`;
  }
  if (abs >= 1e6) {
    return `${(value / 1e6).toFixed(2)} MN`;
  }
  if (abs >= 1e3) {
    return `${(value / 1e3).toFixed(2)} kN`;
  }
  return `${value.toFixed(2)} N`;
}

function percent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function buildFormulaCards(inputs: Inputs, derived: Derived): FormulaCard[] {
  const turnaroundLatex =
    inputs.turnaroundMode === "idealReverse"
      ? "F_{turn} = 2 \\dot{m} v_{top}"
      : inputs.turnaroundMode === "lossyReverse"
        ? "F_{turn} = (2-\\lambda) \\dot{m} v_{top}"
        : "F_{turn} = \\dot{m} v_{top}";

  const turnaroundEnglish =
    inputs.turnaroundMode === "idealReverse"
      ? "Ideal reversal gives the largest momentum change per packet."
      : inputs.turnaroundMode === "lossyReverse"
        ? "Loss factor reduces reversal speed and lowers force for the same mass flow."
        : "Stop-and-drop removes upward momentum without full reversal, reducing force.";

  const turnSubstitutions: Array<{ label: string; value: string }> = [
    { label: "\\dot{m}", value: `${formatNumber(inputs.mdot, 2)}\\,kg/s` },
    { label: "v_{top}", value: `${formatNumber(derived.vTop, 2)}\\,m/s` },
  ];

  if (inputs.turnaroundMode === "lossyReverse") {
    turnSubstitutions.push({
      label: "\\lambda",
      value: formatNumber(inputs.turnaroundLossFraction, 2),
    });
  }

  return [
    {
      id: "required-v0",
      title: "Minimum Injection Speed",
      latex: "v_{0,min} = \\sqrt{2 g H}",
      substitutions: [
        { label: "g", value: `${formatNumber(derived.g, 2)}\\,m/s^2` },
        { label: "H", value: `${formatNumber(inputs.H, 1)}\\,m` },
      ],
      result: `${formatNumber(requiredV0(inputs.H), 2)}\\,m/s`,
      plainEnglish: "This is the minimum launch speed needed to reach the selected height.",
      source: "analytic",
      highlightKey: "reachability",
    },
    {
      id: "turn-force",
      title: "Turnaround Force",
      latex: turnaroundLatex,
      substitutions: turnSubstitutions,
      result: formatForce(derived.forceTurn),
      plainEnglish: turnaroundEnglish,
      source: derived.sourceMode,
      highlightKey: "turnaround",
    },
    {
      id: "support-margin",
      title: "Support Margin",
      latex: "m = \\frac{F_{turn} - M g}{M g}",
      substitutions: [
        { label: "F_{turn}", value: formatForce(derived.forceTurn) },
        { label: "M g", value: formatForce(derived.loadWeight) },
      ],
      result: percent(derived.supportMargin),
      plainEnglish: "Positive margin means the fountain can support the selected load.",
      source: derived.sourceMode,
      highlightKey: "support",
    },
    {
      id: "input-power",
      title: "Base Accelerator Power",
      latex: "P_{in} = \\frac{1}{2} \\dot{m} v_0^2",
      substitutions: [
        { label: "\\dot{m}", value: `${formatNumber(inputs.mdot, 2)}\\,kg/s` },
        { label: "v_0", value: `${formatNumber(inputs.v0, 2)}\\,m/s` },
      ],
      result: formatPowerWatts(derived.P_in),
      plainEnglish: "This is the launch power required at the base accelerator.",
      source: "analytic",
      highlightKey: "energy-in",
    },
    {
      id: "gravity-power",
      title: "Potential Energy Rate",
      latex: "P_{grav} = \\dot{m} g H",
      substitutions: [
        { label: "\\dot{m}", value: `${formatNumber(inputs.mdot, 2)}\\,kg/s` },
        { label: "g", value: `${formatNumber(derived.g, 2)}\\,m/s^2` },
        { label: "H", value: `${formatNumber(inputs.H, 1)}\\,m` },
      ],
      result: formatPowerWatts(derived.P_grav),
      plainEnglish: "Power flow into gravitational potential for the upward mass stream.",
      source: "analytic",
      highlightKey: "energy-gravity",
    },
    {
      id: "recovery-power",
      title: "Recovered Power",
      latex: "P_{rec} = \\eta_{rec} \\dot{m} g H",
      substitutions: [
        { label: "\\eta_{rec}", value: formatNumber(inputs.etaRec, 2) },
        { label: "\\dot{m} g H", value: formatPowerWatts(derived.P_grav) },
      ],
      result: formatPowerWatts(derived.P_rec),
      plainEnglish: "Estimated power recovered at the base from return flow.",
      source: "analytic",
      highlightKey: "energy-rec",
    },
    {
      id: "net-power",
      title: "Net Power",
      latex: "P_{net} = P_{in} - P_{rec} + P_{drag} + P_{turnLoss}",
      substitutions: [
        { label: "P_{in}", value: formatPowerWatts(derived.P_in) },
        { label: "P_{rec}", value: formatPowerWatts(derived.P_rec) },
        { label: "P_{drag}", value: formatPowerWatts(derived.P_drag) },
        { label: "P_{turnLoss}", value: formatPowerWatts(derived.P_turnLoss) },
      ],
      result: formatPowerWatts(derived.P_net),
      plainEnglish: "Total external power demand after recovery and modeled losses.",
      source: derived.sourceMode,
      highlightKey: "energy-net",
    },
  ];
}
