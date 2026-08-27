import type { ConfiguredCriterion } from "../types/criterion";

/** The empty profile shown on startup and restored by Reset preferences. */
export const initialSearchProfile = [] as const satisfies readonly ConfiguredCriterion[];
