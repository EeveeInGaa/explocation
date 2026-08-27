import { describe, expect, it } from "vitest";
import { preparedPrototypeLocations } from "../../data/locations";
import type { ConfiguredCriterion } from "../../types/criterion";
import { rankLocations } from "../matches/rank-locations";
import { toLocationMapFeatureCollection } from "./location-map-adapter";

describe("location map adapter", () => {
  const profile: readonly ConfiguredCriterion[] = [
    {
      criterionId: "forestDistance",
      priority: "preferred",
      constraint: { type: "maximum", threshold: 1 },
    },
    {
      criterionId: "groceryDistance",
      priority: "important",
      constraint: { type: "maximum", threshold: 15 },
    },
    {
      criterionId: "airportDistance",
      priority: "required",
      constraint: { type: "minimum", threshold: 100 },
    },
  ];
  const ranking = rankLocations(preparedPrototypeLocations, profile, { limit: 3 });
  const allMatches = [...ranking.qualified, ...ranking.excluded];
  const featureCollection = toLocationMapFeatureCollection(
    allMatches,
    ranking.topMatches,
    "bialowieza-pl",
  );

  it("maps domain coordinates to GeoJSON longitude-latitude order", () => {
    const vik = featureCollection.features.find((feature) => feature.id === "vik-is");

    expect(vik?.geometry).toEqual({
      type: "Point",
      coordinates: [-19.01, 63.419],
    });
  });

  it("represents qualification, Top 3 rank, and selection state", () => {
    const selectedTopMatch = featureCollection.features.find(
      (feature) => feature.id === "bialowieza-pl",
    );
    const excluded = featureCollection.features.find((feature) => feature.id === "geiranger-no");

    expect(selectedTopMatch?.properties).toMatchObject({
      id: "bialowieza-pl",
      qualified: true,
      rank: 1,
      selected: true,
    });
    expect(excluded?.properties).toMatchObject({
      qualified: false,
      rank: 0,
      selected: false,
    });
  });

  it("derives changing ranks from the current Top Matches", () => {
    const [firstMatch, secondMatch] = ranking.topMatches;

    expect(firstMatch).toBeDefined();
    expect(secondMatch).toBeDefined();
    if (firstMatch === undefined || secondMatch === undefined) {
      return;
    }

    const updated = toLocationMapFeatureCollection(allMatches, [secondMatch, firstMatch], null);

    expect(
      updated.features.find((feature) => feature.id === secondMatch.location.id)?.properties.rank,
    ).toBe(1);
    expect(
      updated.features.find((feature) => feature.id === firstMatch.location.id)?.properties.rank,
    ).toBe(2);
  });

  it("retains selected state for an excluded location", () => {
    const updated = toLocationMapFeatureCollection(allMatches, ranking.topMatches, "geiranger-no");
    const selectedExcluded = updated.features.find((feature) => feature.id === "geiranger-no");

    expect(selectedExcluded?.properties).toMatchObject({
      qualified: false,
      selected: true,
    });
  });

  it("keeps map properties lean and independent of criterion evaluations", () => {
    const feature = featureCollection.features[0];

    expect(Object.keys(feature?.properties ?? {}).sort()).toEqual([
      "id",
      "name",
      "qualified",
      "rank",
      "searchActive",
      "selected",
    ]);
  });

  it("marks prepared locations as neutral when the search profile is empty", () => {
    const neutral = toLocationMapFeatureCollection(allMatches, [], null, false);

    expect(neutral.features.every((feature) => !feature.properties.searchActive)).toBe(true);
    expect(neutral.features.every((feature) => feature.properties.rank === 0)).toBe(true);
  });
});
