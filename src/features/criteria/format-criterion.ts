import type {
  ConfiguredCriterion,
  ConstraintType,
  CriterionPriority,
  NumericConstraint,
} from "../../types/criterion";
import type { CriterionEvaluation } from "../../types/match";
import { unitDefinitions } from "../../types/unit";
import { criterionDefinitions } from "./criterion-definitions";

const numberFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 1,
});

export const constraintTypeLabels: Readonly<Record<ConstraintType, string>> = {
  maximum: "At most",
  minimum: "At least",
  range: "Between",
};

export const priorityLabels: Readonly<Record<CriterionPriority, string>> = {
  required: "Required",
  important: "Important",
  preferred: "Preferred",
  niceToHave: "Nice to have",
};

function formatValue(value: number, unitSymbol: string): string {
  return `${numberFormatter.format(value)} ${unitSymbol}`;
}

export function formatPreference(constraint: NumericConstraint, unitSymbol: string): string {
  switch (constraint.type) {
    case "maximum":
      return `At most ${formatValue(constraint.threshold, unitSymbol)}`;
    case "minimum":
      return `At least ${formatValue(constraint.threshold, unitSymbol)}`;
    case "range":
      return `Between ${formatValue(constraint.minimum, unitSymbol)} and ${formatValue(
        constraint.maximum,
        unitSymbol,
      )}`;
  }
}

export function formatActualValue(value: number, unitSymbol: string): string {
  return formatValue(value, unitSymbol);
}

export function formatConstraint(constraint: NumericConstraint, unitSymbol: string): string {
  switch (constraint.type) {
    case "maximum":
      return `≤ ${formatValue(constraint.threshold, unitSymbol)}`;
    case "minimum":
      return `≥ ${formatValue(constraint.threshold, unitSymbol)}`;
    case "range":
      return `${formatValue(constraint.minimum, unitSymbol)}–${formatValue(
        constraint.maximum,
        unitSymbol,
      )}`;
  }
}

export function formatConfiguredCriterion(configured: ConfiguredCriterion): Readonly<{
  label: string;
  constraint: string;
  priority: string;
}> {
  const definition = criterionDefinitions[configured.criterionId];
  const unit = unitDefinitions[definition.unit];

  return {
    label: definition.shortLabel,
    constraint: formatConstraint(configured.constraint, unit.symbol),
    priority: priorityLabels[configured.priority],
  };
}

export function formatRequiredFailure(evaluation: CriterionEvaluation): string {
  const definition = criterionDefinitions[evaluation.criterionId];
  const unit = unitDefinitions[evaluation.actual.unit];
  const actual = formatValue(evaluation.actual.value, unit.symbol);

  switch (evaluation.constraint.type) {
    case "maximum":
      return `${definition.shortLabel.toLowerCase()} ${actual}; required maximum ${formatValue(
        evaluation.constraint.threshold,
        unit.symbol,
      )}`;
    case "minimum":
      return `${definition.shortLabel.toLowerCase()} ${actual}; required minimum ${formatValue(
        evaluation.constraint.threshold,
        unit.symbol,
      )}`;
    case "range":
      return `${definition.shortLabel.toLowerCase()} ${actual}; required range ${formatValue(
        evaluation.constraint.minimum,
        unit.symbol,
      )}–${formatValue(evaluation.constraint.maximum, unit.symbol)}`;
  }
}
