# Explocation agent context

This file applies to the entire repository. Use it as the starting context for work in a new chat,
then inspect the relevant source files before changing behavior.

## Product and current scope

Explocation is an early, production-oriented web prototype for discovering real geographic
locations that match configurable lifestyle preferences. The current application is entirely
client-side and uses prepared data; it has no backend, database, remote APIs, or live geospatial
pipeline.

Implemented product slices:

- editable criteria with `maximum`, `minimum`, and `range` constraints
- priorities: `required`, `important`, `preferred`, and `niceToHave`
- explainable criterion, category, and overall match results
- required-criterion qualification, Top 3 ranking, excluded locations, and optional prioritization
  of matches that satisfy every preference
- synchronized Top Match, MapLibre map, and selected-location details
- D3 criterion/preference visualizations
- Recharts monthly temperature and daylight visualizations

Do not assume planned README items are implemented. Add dependencies and capabilities only in the
stage where they are required.

## Stack and commands

- React 19, strict TypeScript, Vite, pnpm, Tailwind CSS
- Biome only; do not add ESLint or Prettier
- Vitest and Testing Library for unit/component tests
- Playwright for the minimal Chromium E2E flow
- MapLibre GL JS for the map, D3 for bespoke criterion visuals, Recharts for climate time series

Use the scripts in `package.json`:

```sh
pnpm dev
pnpm check
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Before handing off implementation work, run Biome, type checking, all tests, the production build,
and Playwright when the environment supports it. Fix failures rather than suppressing them. Do not
create commits unless the user explicitly asks.

## Architecture boundaries

- `src/types/` contains framework-independent domain types.
- `src/data/` contains static configuration and prepared prototype datasets.
- `src/features/criteria/` owns criterion metadata, formatting, editing, and immutable profile
  updates.
- `src/features/matches/` is the framework-independent matching and ranking engine. It must not
  import React, MapLibre, D3, or Recharts.
- `src/features/map/` is the MapLibre boundary. Convert domain matches to lean GeoJSON there; do not
  leak MapLibre types into the domain.
- `src/features/location-details/` presents selected-match explanations. D3 remains responsible for
  the bespoke constraint visualization.
- `src/features/location-details/climate/` contains Recharts presentation only. Prepared climate
  data and climate types must remain chart-library independent.
- React may own editable profile state and selected-location state and invoke the domain engine. It
  must not calculate scores, satisfaction, qualification, or ranking.

Keep components and pure functions focused. Avoid speculative abstractions, giant barrel files,
state libraries, routing, form libraries, component libraries, and new runtime dependencies without
a present requirement. Do not use TypeScript `any`; safely narrow `unknown` when needed.

## Matching rules that must remain explicit

The six current criteria are exactly:

- `forestDistance`
- `waterDistance`
- `hikingTrailDistance`
- `groceryDistance`
- `airportDistance`
- `summerAverageTemperature`

Criterion definitions provide labels, categories, units, and supported constraint types. They must
never force a permanent direction. The configured criterion determines `maximum`, `minimum`, or
`range`; priority is independent of constraint type.

`required` is a qualification gate. The overall ranking score is calculated from soft criteria so a
required criterion does not add score after passing. By default, qualified locations rank by score,
then location ID for deterministic ties. When `prioritizeCompleteMatches` is enabled, qualified
locations satisfying every configured preference sort before other qualified locations, followed by
the normal score and ID ordering. A selected location remains selected if a profile change excludes
it so the detail view can explain the failure.

The matching evaluation output is the source of truth for the UI and visualizations. Do not
recalculate scores or satisfaction in React, D3, Recharts, or MapLibre code.

## Data provenance

`src/data/locations.ts` uses real place names and coordinates. Its six metric values are hand-prepared
prototype inputs chosen to exercise the matching model; they are not sourced or verified real-world
measurements and must never be presented as authoritative.

`src/data/monthly-climate.ts` likewise contains deterministic, internally plausible prototype
temperature and daylight profiles for the existing locations. Each profile has 12 ordered months,
but the values are not verified climate observations. A future geospatial/climate data pipeline will
replace both prepared datasets. Do not add random runtime data or imply factual accuracy.

## UI and accessibility expectations

- Preserve the calm, restrained, product-oriented visual direction and light/dark system themes.
- Keep the map an enhancement: criteria, ranked/excluded results, selection, and explanations must
  remain usable without map interaction.
- Use semantic native controls, visible labels, keyboard focus styles, and text in addition to color.
- Charts require accessible textual context. The climate section includes a screen-reader-only table
  with all monthly values; keep it inside an `sr-only` wrapper so table intrinsic sizing cannot cause
  mobile page overflow.
- Keep layouts usable at narrow widths with no page-level horizontal overflow.

## Dependency intent

- MapLibre is only for geographic presentation and interaction.
- D3 is only for custom criterion scales/positioning; React owns the SVG structure.
- Recharts is only for conventional monthly climate time series. `react-is` matches the installed
  React version because it is a required Recharts peer.
- Do not replace one visualization approach with another without a concrete product reason.
- Turf.js, live APIs, suitability polygons, buffers, heatmaps, isochrones, and additional climate
  metrics are not implemented yet.

## Documentation and generated files

Keep README changes minimal and truthful. Only mark a roadmap item complete when its entire wording
is implemented; do not mark combined climate/comparison items complete for partial work. Preserve
the explicit prototype-data caveat.

Generated build, test, and cache output must remain ignored. Review `git status` and the full diff
before handoff, preserve unrelated user changes, and never create a commit unless requested.
