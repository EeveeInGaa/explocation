import type { NumericConstraint } from "../../types/criterion";
import type { Unit } from "../../types/unit";

export type VisualizationDomain = readonly [minimum: number, maximum: number];

function getConstraintValues(constraint: NumericConstraint): readonly number[] {
  switch (constraint.type) {
    case "maximum":
    case "minimum":
      return [constraint.threshold];
    case "range":
      return [constraint.minimum, constraint.maximum];
  }
}

/**
 * Creates presentation context around the actual value and configured preference.
 * Distances retain zero as their meaningful lower baseline; temperature remains free
 * to extend below zero. Padding prevents thresholds at the chart edge and keeps equal
 * or very close values legible without encoding any scoring behavior.
 */
export function deriveVisualizationDomain(
  actualValue: number,
  constraint: NumericConstraint,
  unit: Unit,
): VisualizationDomain {
  const values = [actualValue, ...getConstraintValues(constraint)];

  if (unit === "kilometers") {
    values.push(0);
  }

  const minimumValue = Math.min(...values);
  const maximumValue = Math.max(...values);
  const span = maximumValue - minimumValue;
  const magnitude = Math.max(Math.abs(minimumValue), Math.abs(maximumValue), 1);
  const minimumPadding = unit === "kilometers" ? 0.25 : 1;
  const padding = Math.max(span * 0.15, magnitude * 0.05, minimumPadding);
  const minimum = unit === "kilometers" && minimumValue >= 0 ? 0 : minimumValue - padding;

  return [minimum, maximumValue + padding];
}

export function getPreferredInterval(
  constraint: NumericConstraint,
  domain: VisualizationDomain,
): VisualizationDomain {
  switch (constraint.type) {
    case "maximum":
      return [domain[0], constraint.threshold];
    case "minimum":
      return [constraint.threshold, domain[1]];
    case "range":
      return [constraint.minimum, constraint.maximum];
  }
}
