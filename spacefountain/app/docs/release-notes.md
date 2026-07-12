# Space Fountain Release Notes (v0.1.0)

## Included

- Full static Three.js simulator shell with cyberpunk command-deck UI.
- Analytic and drag-integrated motion models.
- Turnaround mode switching with loss accounting.
- Energy ledger and formula surfacing panels.
- Distributed coupler force-density visualization.
- Presets, warnings, and teach mode.
- Unit/invariant tests and build tooling.

## Known Limitations

- Packet dynamics are representative and not a full many-body pellet collision model.
- Drag model is 1D and does not model turbulence transitions.
- Thermal subsystem is represented via aggregate loss terms.
- No persisted user profiles; all state is runtime local.
- No audio narration or guided tutorial steps yet.

## Future Work

- Add optional RK4 integrator toggle in UI with side-by-side diff panel.
- Add export/import of scenario presets.
- Add camera path presets for scripted demonstrations.
- Add detailed thermal budgeting for turnaround hardware.
- Add optional WebGPU path for larger packet counts.
