import type { ConfiguredCriterion } from "../../types/criterion";
import type { Location } from "../../types/location";
import type { LocationMatch, RankedLocationMatches } from "../../types/match";
import { calculateLocationMatch } from "./calculate-location-match";

function compareLocationIds(left: LocationMatch, right: LocationMatch): number {
  if (left.location.id < right.location.id) {
    return -1;
  }

  if (left.location.id > right.location.id) {
    return 1;
  }

  return 0;
}

function compareMatches(left: LocationMatch, right: LocationMatch): number {
  const scoreDifference = right.score - left.score;

  if (scoreDifference !== 0) {
    return scoreDifference;
  }

  return compareLocationIds(left, right);
}

export function rankLocations(
  locations: readonly Location[],
  configuredCriteria: readonly ConfiguredCriterion[],
  limit: number = locations.length,
): RankedLocationMatches {
  const matches = locations.map((location) => calculateLocationMatch(location, configuredCriteria));
  const qualified = matches.filter((match) => match.qualified).sort(compareMatches);
  const excluded = matches.filter((match) => !match.qualified).sort(compareLocationIds);
  const safeLimit = Math.max(0, Math.trunc(limit));

  return {
    qualified,
    topMatches: qualified.slice(0, safeLimit),
    excluded,
  };
}
