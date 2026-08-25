import type { ConfiguredCriterion } from "../types/criterion";

/* just a placeholder for now */
export const defaultSearchProfile = [
  {
    criterionId: "forestDistance",
    priority: "important",
    constraint: { type: "maximum", threshold: 1 },
  },
  {
    criterionId: "waterDistance",
    priority: "preferred",
    constraint: { type: "maximum", threshold: 3 },
  },
  {
    criterionId: "hikingTrailDistance",
    priority: "preferred",
    constraint: { type: "maximum", threshold: 2 },
  },
  {
    criterionId: "groceryDistance",
    priority: "important",
    constraint: { type: "maximum", threshold: 15 },
  },
  {
    criterionId: "airportDistance",
    priority: "required",
    constraint: { type: "minimum", threshold: 100 },
  },
  {
    criterionId: "summerAverageTemperature",
    priority: "niceToHave",
    constraint: { type: "maximum", threshold: 20 },
  },
] as const satisfies readonly ConfiguredCriterion[];
