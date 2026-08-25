import type { CriterionPriority } from "../../types/criterion";

/**
 * Initial weighting is intentionally linear and easy to tune. Required criteria also gate
 * qualification; their weight keeps a strong satisfied requirement visible in the overall score.
 */
export const priorityWeights: Readonly<Record<CriterionPriority, number>> = {
  required: 4,
  important: 3,
  preferred: 2,
  niceToHave: 1,
};
