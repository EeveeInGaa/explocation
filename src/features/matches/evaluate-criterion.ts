import type {
  ConfiguredCriterion,
  CriterionDefinition,
  NumericConstraint,
} from "../../types/criterion";
import type { CriterionEvaluation } from "../../types/match";

function clampScore(score: number): number {
  return Math.min(1, Math.max(0, score));
}

function assertFiniteValue(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`);
  }
}

function thresholdScale(threshold: number): number {
  return Math.max(Math.abs(threshold), 1);
}

export function isConstraintSatisfied(actualValue: number, constraint: NumericConstraint): boolean {
  switch (constraint.type) {
    case "maximum":
      return actualValue <= constraint.threshold;
    case "minimum":
      return actualValue >= constraint.threshold;
    case "range":
      return actualValue >= constraint.minimum && actualValue <= constraint.maximum;
  }
}

/**
 * Scores are centered around the configured boundary rather than criterion-specific assumptions.
 * Maximum/minimum boundaries score 0.5, improve continuously on the preferred side, and decay on
 * the other side. Ranges score 1 at the center, 0.5 at either boundary, and decay outside.
 */
export function calculateCriterionScore(
  actualValue: number,
  constraint: NumericConstraint,
): number {
  assertFiniteValue(actualValue, "Actual value");

  switch (constraint.type) {
    case "maximum": {
      assertFiniteValue(constraint.threshold, "Maximum threshold");
      const score =
        0.5 + (constraint.threshold - actualValue) / (2 * thresholdScale(constraint.threshold));
      return clampScore(score);
    }
    case "minimum": {
      assertFiniteValue(constraint.threshold, "Minimum threshold");
      const score =
        0.5 + (actualValue - constraint.threshold) / (2 * thresholdScale(constraint.threshold));
      return clampScore(score);
    }
    case "range": {
      assertFiniteValue(constraint.minimum, "Range minimum");
      assertFiniteValue(constraint.maximum, "Range maximum");

      if (constraint.minimum > constraint.maximum) {
        throw new Error("Range minimum must not exceed range maximum.");
      }

      const center = (constraint.minimum + constraint.maximum) / 2;
      const halfWidth = (constraint.maximum - constraint.minimum) / 2;
      const scoreScale = halfWidth === 0 ? thresholdScale(center) : 2 * halfWidth;

      return clampScore(1 - Math.abs(actualValue - center) / scoreScale);
    }
  }
}

export function evaluateCriterion(
  definition: CriterionDefinition,
  configured: ConfiguredCriterion,
  actualValue: number,
): CriterionEvaluation {
  if (definition.id !== configured.criterionId) {
    throw new Error(
      `Criterion definition ${definition.id} does not match configuration ${configured.criterionId}.`,
    );
  }

  if (!definition.supportedConstraintTypes.includes(configured.constraint.type)) {
    throw new Error(
      `Constraint type ${configured.constraint.type} is not supported by ${definition.id}.`,
    );
  }

  return {
    criterionId: configured.criterionId,
    category: definition.category,
    actual: {
      criterionId: configured.criterionId,
      value: actualValue,
      unit: definition.unit,
    },
    constraint: configured.constraint,
    priority: configured.priority,
    satisfied: isConstraintSatisfied(actualValue, configured.constraint),
    score: calculateCriterionScore(actualValue, configured.constraint),
  };
}

export function isRequiredCriterionSatisfied(evaluation: CriterionEvaluation): boolean {
  return evaluation.priority !== "required" || evaluation.satisfied;
}
