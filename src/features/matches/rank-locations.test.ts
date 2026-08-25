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

    const ranking = rankLocations(locations, profile, 3);

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

    expect(rankLocations(locations, profile, 1).topMatches).toHaveLength(1);
  });
});
