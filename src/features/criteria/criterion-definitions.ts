import type { CriterionCategory, CriterionDefinition, CriterionId } from "../../types/criterion";

const numericConstraintTypes = ["maximum", "minimum", "range"] as const;

export const categoryLabels: Readonly<Record<CriterionCategory, string>> = {
  nature: "Nature",
  outdoor: "Outdoor",
  services: "Services",
  mobility: "Mobility",
  climate: "Climate",
};

export const criterionDefinitions: Readonly<Record<CriterionId, CriterionDefinition>> = {
  forestDistance: {
    id: "forestDistance",
    label: "Distance to forest",
    shortLabel: "Forest",
    category: "nature",
    unit: "kilometers",
    supportedConstraintTypes: numericConstraintTypes,
  },
  waterDistance: {
    id: "waterDistance",
    label: "Distance to water",
    shortLabel: "Water",
    category: "nature",
    unit: "kilometers",
    supportedConstraintTypes: numericConstraintTypes,
  },
  hikingTrailDistance: {
    id: "hikingTrailDistance",
    label: "Distance to hiking trail",
    shortLabel: "Hiking trail",
    category: "outdoor",
    unit: "kilometers",
    supportedConstraintTypes: numericConstraintTypes,
  },
  groceryDistance: {
    id: "groceryDistance",
    label: "Distance to grocery store",
    shortLabel: "Grocery",
    category: "services",
    unit: "kilometers",
    supportedConstraintTypes: numericConstraintTypes,
  },
  airportDistance: {
    id: "airportDistance",
    label: "Distance to airport",
    shortLabel: "Airport",
    category: "mobility",
    unit: "kilometers",
    supportedConstraintTypes: numericConstraintTypes,
  },
  summerAverageTemperature: {
    id: "summerAverageTemperature",
    label: "Summer average temperature",
    shortLabel: "Summer temperature",
    category: "climate",
    unit: "degreesCelsius",
    supportedConstraintTypes: numericConstraintTypes,
  },
};
