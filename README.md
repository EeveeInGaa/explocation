# Explocation

Explocation is planned to be a tool for discovering geographic areas and locations that
match a person's criteria, such as access to nature and services or environmental conditions.
Suitable areas and points are marked on a map, details can be viewed for each location.

During the development of this project, I use an AI agent as a supporting tool. 
This allows me to strengthen my deliberate and professional use of AI while improving productivity and efficiency throughout the development process (eg. setup, tests, debugging, refinement, optimizations). 
I make technical and conceptual/architectual decisions myself and review, refine, and extend generated code according to the features and requirements.

## Tech stack

- React and TypeScript
- Vite
- Tailwind CSS
- Biome
- Vitest and Testing Library
- Playwright
- pnpm

## Prerequisites

- Node.js 22.13 or newer
- pnpm 11.24

## Setup

```sh
pnpm install
pnpm dev
```

## Planned Features

- [x] Configurable location criteria
- [x] Minimum, maximum, and range constraints
- [x] Required and weighted preferences
- [x] Explainable location match score
- [x] Top 3 location recommendations
- [ ] Interactive suitability map
- [ ] Suitable areas and match regions
- [ ] Location detail view
- [ ] Compare multiple locations
- [ ] Temperature, precipitation, snow, and daylight data
- [ ] Distance to 
  - (Nature) forests and water
  - (Outdoor) Hiking trails, viewpoints, rest areas, nature parks
  - (Services) Grocery stores, doctors, hospitals, vets
  - (Transportation) Airports, motorways, train stations, and other infrastructure
- [ ] Travel-time based criteria and isochrones
- [ ] Population and population density
- [ ] Light pollution, Air pollution
- [ ] Mobile network coverage, Internet/broadband availability
- [ ] Environmental and infrastructure exclusion criteria
- [ ] Interactive D3 visualizations
- [ ] Recharts-based climate and comparison charts
- [ ] Saved searches and favorite locations
- [ ] Shareable searches
- [ ] Similar-place discovery
