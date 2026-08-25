import type { Unit } from "./unit";

export const criterionIds = [
  "forestDistance",
  "waterDistance",
  "hikingTrailDistance",
  "groceryDistance",
  "airportDistance",
  "summerAverageTemperature",
] as const;

export type CriterionId = (typeof criterionIds)[number];

export const criterionCategories = [
  "nature",
  "outdoor",
  "services",
  "mobility",
  "climate",
] as const;

export type CriterionCategory = (typeof criterionCategories)[number];

export type ConstraintType = "maximum" | "minimum" | "range";

export type NumericConstraint =
  | Readonly<{
      type: "maximum";
      threshold: number;
    }>
  | Readonly<{
      type: "minimum";
      threshold: number;
    }>
  | Readonly<{
      type: "range";
      minimum: number;
      maximum: number;
    }>;

export type CriterionPriority = "required" | "important" | "preferred" | "niceToHave";

export type CriterionDefinition = Readonly<{
  id: CriterionId;
  label: string;
  shortLabel: string;
  category: CriterionCategory;
  unit: Unit;
  supportedConstraintTypes: readonly ConstraintType[];
}>;

export type ConfiguredCriterion = Readonly<{
  criterionId: CriterionId;
  priority: CriterionPriority;
  constraint: NumericConstraint;
}>;

export type CriterionActualValue = Readonly<{
  criterionId: CriterionId;
  value: number;
  unit: Unit;
}>;
