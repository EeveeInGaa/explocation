import type { ConfiguredCriterion, CriterionId } from "../types/criterion";

type DefaultCriterionConfiguration = Omit<ConfiguredCriterion, "criterionId">;

/**
 * Product defaults used only when a criterion is added to a search profile.
 * They are starting points, not semantic rules for the criterion itself.
 */
export const defaultCriterionConfigurations: Readonly<
  Record<CriterionId, DefaultCriterionConfiguration>
> = {
  forestDistance: {
    priority: "preferred",
    constraint: { type: "maximum", threshold: 1 },
  },
  waterDistance: {
    priority: "preferred",
    constraint: { type: "maximum", threshold: 3 },
  },
  hikingTrailDistance: {
    priority: "preferred",
    constraint: { type: "maximum", threshold: 2 },
  },
  groceryDistance: {
    priority: "important",
    constraint: { type: "maximum", threshold: 15 },
  },
  airportDistance: {
    priority: "required",
    constraint: { type: "minimum", threshold: 100 },
  },
  summerAverageTemperature: {
    priority: "niceToHave",
    constraint: { type: "maximum", threshold: 20 },
  },
};
