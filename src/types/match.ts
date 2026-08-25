import type {
  CriterionActualValue,
  CriterionCategory,
  CriterionId,
  CriterionPriority,
  NumericConstraint,
} from "./criterion";
import type { Location } from "./location";

export type CriterionEvaluation = Readonly<{
  criterionId: CriterionId;
  category: CriterionCategory;
  actual: CriterionActualValue;
  constraint: NumericConstraint;
  priority: CriterionPriority;
  satisfied: boolean;
  score: number;
}>;

export type CategoryScore = Readonly<{
  category: CriterionCategory;
  score: number;
  criterionIds: readonly CriterionId[];
}>;

export type LocationMatch = Readonly<{
  location: Location;
  qualified: boolean;
  score: number;
  evaluations: readonly CriterionEvaluation[];
  categoryScores: readonly CategoryScore[];
  failedRequiredCriteria: readonly CriterionEvaluation[];
}>;

export type RankedLocationMatches = Readonly<{
  qualified: readonly LocationMatch[];
  topMatches: readonly LocationMatch[];
  excluded: readonly LocationMatch[];
}>;
