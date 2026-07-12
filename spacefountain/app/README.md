# Space Fountain App

Static Three.js + TypeScript simulator for space-fountain momentum support and energy accounting.

## Setup

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev`: start development server
- `npm run build`: typecheck + production build
- `npm run preview`: preview production build
- `npm run typecheck`: strict TypeScript validation
- `npm run lint`: alias to typecheck
- `npm run test`: run Vitest in watch mode
- `npm run test:run`: run Vitest once

## Project Layout

- `src/core`: physics and derived-model logic
- `src/sim`: packet stream simulation
- `src/render`: Three.js scene and visuals
- `src/ui`: control, formula, chart, and ledger panels
- `src/state`: central Zustand store
- `src/tests`: model tests and invariants
- `docs/user-guide.md`: end-user walkthrough
- `docs/developer-guide.md`: architecture and extension notes
- `validation.md`: hand-worked physics checks

## Static Hosting

Vite is configured with `base: "./"` in `vite.config.ts` for relative asset paths.

Build output is emitted to `dist/`.
