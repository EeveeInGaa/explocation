import { describe, expect, it } from "vitest";
import { defaultSearchProfile } from "../../data/default-search-profile";
import { preparedPrototypeLocations } from "../../data/locations";
import { createTestLocation } from "../../test/location-fixture";
import type { ConfiguredCriterion } from "../../types/criterion";
import { calculateLocationMatch } from "./calculate-location-match";

describe("criterion priorities", () => {
  it("disqualifies a location when a required criterion fails", () => {
    const location = createTestLocation("required-failure", { airportDistance: 50 });
    const profile: readonly ConfiguredCriterion[] = [
      {
        criterionId: "airportDistance",
        priority: "required",
        constraint: { type: "minimum", threshold: 100 },
      },
    ];

    const match = calculateLocationMatch(location, profile);

    expect(match.qualified).toBe(false);
    expect(match.failedRequiredCriteria).toHaveLength(1);
    expect(match.failedRequiredCriteria[0]?.criterionId).toBe("airportDistance");
  });

  it("keeps a location qualified when a soft criterion fails", () => {
    const location = createTestLocation("soft-failure", { forestDistance: 5 });
    const profile: readonly ConfiguredCriterion[] = [
      {
        criterionId: "forestDistance",
        priority: "important",
        constraint: { type: "maximum", threshold: 1 },
      },
    ];

    const match = calculateLocationMatch(location, profile);

    expect(match.qualified).toBe(true);
    expect(match.evaluations[0]?.satisfied).toBe(false);
  });

  it("gives more influence to a higher-priority soft criterion", () => {
    const location = createTestLocation("weighted", {
      forestDistance: 0,
      waterDistance: 20,
    });
    const highScoreIsImportant: readonly ConfiguredCriterion[] = [
      {
        criterionId: "forestDistance",
        priority: "important",
        constraint: { type: "maximum", threshold: 10 },
      },
      {
        criterionId: "waterDistance",
        priority: "niceToHave",
        constraint: { type: "maximum", threshold: 10 },
      },
    ];
    const lowScoreIsImportant: readonly ConfiguredCriterion[] = [
      {
        criterionId: "forestDistance",
        priority: "niceToHave",
        constraint: { type: "maximum", threshold: 10 },
      },
      {
        criterionId: "waterDistance",
        priority: "important",
        constraint: { type: "maximum", threshold: 10 },
      },
    ];

    expect(calculateLocationMatch(location, highScoreIsImportant).score).toBe(0.75);
    expect(calculateLocationMatch(location, lowScoreIsImportant).score).toBe(0.25);
  });

  it("uses required criteria only as qualification gates, not ranking weights", () => {
    const nearAirportThreshold = createTestLocation("near-threshold", {
      forestDistance: 5,
      airportDistance: 100,
    });
    const farAboveAirportThreshold = createTestLocation("far-above-threshold", {
      forestDistance: 5,
      airportDistance: 200,
    });
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

    const nearMatch = calculateLocationMatch(nearAirportThreshold, profile);
    const farMatch = calculateLocationMatch(farAboveAirportThreshold, profile);

    expect(nearMatch.qualified).toBe(true);
    expect(farMatch.qualified).toBe(true);
    expect(nearMatch.score).toBe(0.75);
    expect(farMatch.score).toBe(nearMatch.score);
    expect(nearMatch.categoryScores.find(({ category }) => category === "mobility")?.score).toBe(
      0.5,
    );
    expect(farMatch.categoryScores.find(({ category }) => category === "mobility")?.score).toBe(1);
  });
});

describe("overall location matches", () => {
  it("retains complete evaluation and category data for a realistic profile", () => {
    const location = preparedPrototypeLocations.find((candidate) => candidate.id === "hanko-fi");

    if (location === undefined) {
      throw new Error("Expected Hanko in the prepared prototype dataset.");
    }

    const match = calculateLocationMatch(location, defaultSearchProfile);

    expect(match.qualified).toBe(true);
    expect(match.allPreferencesSatisfied).toBe(true);
    expect(match.score).toBeGreaterThan(0);
    expect(match.score).toBeLessThanOrEqual(1);
    expect(match.evaluations).toHaveLength(6);
    expect(match.categoryScores.map(({ category }) => category)).toEqual([
      "nature",
      "outdoor",
      "services",
      "mobility",
      "climate",
    ]);
    expect(match.evaluations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          criterionId: "airportDistance",
          actual: expect.objectContaining({ unit: "kilometers" }),
          constraint: { type: "minimum", threshold: 100 },
          priority: "required",
        }),
      ]),
    );
  });
});
