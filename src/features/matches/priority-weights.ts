import type { CriterionPriority } from "../../types/criterion";

/** Initial soft-preference weighting is intentionally linear and easy to tune. */
export const priorityWeights: Readonly<Record<CriterionPriority, number>> = {
  // Required evaluations use the weight only for category-level explanation;
  // they are excluded from the overall ranking score.
  required: 4,
  important: 3,
  preferred: 2,
  niceToHave: 1,
};
