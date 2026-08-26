import { describe, expect, it } from "vitest";
import { createTestLocation } from "../../test/location-fixture";
import type { ConfiguredCriterion } from "../../types/criterion";
import { rankLocations } from "./rank-locations";

describe("location ranking", () => {
  const profile: readonly ConfiguredCriterion[] = [
    {
      criterionId: "forestDistance",
      priority: "important",
      constraint: { type: "maximum", threshold: 10 },
    },
    {
      criterionId: "airportDistance",
      priority: "required",
      constraint: { type: "minimum", threshold: 100 },
    },
  ];

  it("excludes disqualified locations and orders qualified matches deterministically", () => {
    const locations = [
      createTestLocation("gamma", { forestDistance: 5, airportDistance: 150 }),
      createTestLocation("excluded", { forestDistance: 0, airportDistance: 50 }),
      createTestLocation("zulu", { forestDistance: 0, airportDistance: 200 }),
      createTestLocation("beta", { forestDistance: 5, airportDistance: 150 }),
    ];

    const ranking = rankLocations(locations, profile, { limit: 3 });

    expect(ranking.qualified.map(({ location }) => location.id)).toEqual(["zulu", "beta", "gamma"]);
    expect(ranking.topMatches.map(({ location }) => location.id)).toEqual([
      "zulu",
      "beta",
      "gamma",
    ]);
    expect(ranking.excluded.map(({ location }) => location.id)).toEqual(["excluded"]);
  });

  it("applies a caller-provided result limit", () => {
    const locations = [
      createTestLocation("first", { forestDistance: 0, airportDistance: 200 }),
      createTestLocation("second", { forestDistance: 5, airportDistance: 150 }),
    ];

    expect(rankLocations(locations, profile, { limit: 1 }).topMatches).toHaveLength(1);
  });

  it("can rank complete matches before higher-scoring soft failures", () => {
    const completeMatch = createTestLocation("complete", {
      forestDistance: 10,
      waterDistance: 10,
      airportDistance: 100,
    });
    const higherScoringSoftFailure = createTestLocation("soft-failure", {
      forestDistance: 0,
      waterDistance: 11,
      airportDistance: 100,
    });
    const completeProfile: readonly ConfiguredCriterion[] = [
      ...profile,
      {
        criterionId: "waterDistance",
        priority: "preferred",
        constraint: { type: "maximum", threshold: 10 },
      },
    ];

    const defaultRanking = rankLocations(
      [completeMatch, higherScoringSoftFailure],
      completeProfile,
    );
    const completeFirstRanking = rankLocations(
      [completeMatch, higherScoringSoftFailure],
      completeProfile,
      { prioritizeCompleteMatches: true },
    );

    expect(defaultRanking.qualified.map(({ location }) => location.id)).toEqual([
      "soft-failure",
      "complete",
    ]);
    expect(completeFirstRanking.qualified.map(({ location }) => location.id)).toEqual([
      "complete",
      "soft-failure",
    ]);
    expect(completeFirstRanking.qualified[0]?.allPreferencesSatisfied).toBe(true);
    expect(completeFirstRanking.qualified[1]?.allPreferencesSatisfied).toBe(false);
  });
});
