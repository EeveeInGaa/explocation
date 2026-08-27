import type { ConfiguredCriterion, CriterionId } from "../../types/criterion";
import { criterionCategories } from "../../types/criterion";
import type { Location } from "../../types/location";
import type { CategoryScore, CriterionEvaluation, LocationMatch } from "../../types/match";
import { criterionDefinitions } from "../criteria/criterion-definitions";
import { evaluateCriterion, isRequiredCriterionSatisfied } from "./evaluate-criterion";
import { priorityWeights } from "./priority-weights";

function calculateWeightedScore(evaluations: readonly CriterionEvaluation[]): number {
  const totalWeight = evaluations.reduce(
    (sum, evaluation) => sum + priorityWeights[evaluation.priority],
    0,
  );

  if (totalWeight === 0) {
    return 0;
  }

  const weightedScore = evaluations.reduce(
    (sum, evaluation) => sum + evaluation.score * priorityWeights[evaluation.priority],
    0,
  );

  return weightedScore / totalWeight;
}

function calculateSoftCriteriaScore(evaluations: readonly CriterionEvaluation[]): number {
  return calculateWeightedScore(
    evaluations.filter((evaluation) => evaluation.priority !== "required"),
  );
}

export function calculateCategoryScores(
  evaluations: readonly CriterionEvaluation[],
): readonly CategoryScore[] {
  return criterionCategories.flatMap((category) => {
    const categoryEvaluations = evaluations.filter(
      (evaluation) => evaluation.category === category,
    );

    if (categoryEvaluations.length === 0) {
      return [];
    }

    return [
      {
        category,
        score: calculateWeightedScore(categoryEvaluations),
        criterionIds: categoryEvaluations.map((evaluation) => evaluation.criterionId),
      },
    ];
  });
}

function assertUniqueCriteria(configuredCriteria: readonly ConfiguredCriterion[]): void {
  const seenCriteria = new Set<CriterionId>();

  for (const configured of configuredCriteria) {
    if (seenCriteria.has(configured.criterionId)) {
      throw new Error(`Criterion ${configured.criterionId} is configured more than once.`);
    }

    seenCriteria.add(configured.criterionId);
  }
}

export function calculateLocationMatch(
  location: Location,
  configuredCriteria: readonly ConfiguredCriterion[],
): LocationMatch {
  assertUniqueCriteria(configuredCriteria);

  const evaluations = configuredCriteria.map((configured) =>
    evaluateCriterion(
      criterionDefinitions[configured.criterionId],
      configured,
      location.metrics[configured.criterionId],
    ),
  );
  const failedRequiredCriteria = evaluations.filter(
    (evaluation) => !isRequiredCriterionSatisfied(evaluation),
  );

  return {
    location,
    qualified: failedRequiredCriteria.length === 0,
    allPreferencesSatisfied:
      evaluations.length > 0 && evaluations.every((evaluation) => evaluation.satisfied),
    // Required criteria are qualification gates. Only soft preferences determine
    // how qualified locations rank against one another.
    score: calculateSoftCriteriaScore(evaluations),
    evaluations,
    categoryScores: calculateCategoryScores(evaluations),
    failedRequiredCriteria,
  };
}
