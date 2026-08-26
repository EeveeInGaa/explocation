import { describe, expect, it } from "vitest";
import { defaultSearchProfile } from "../../data/default-search-profile";
import { preparedPrototypeLocations } from "../../data/locations";
import { rankLocations } from "../matches/rank-locations";
import { toLocationMapFeatureCollection } from "./location-map-adapter";

describe("location map adapter", () => {
  const ranking = rankLocations(preparedPrototypeLocations, defaultSearchProfile, { limit: 3 });
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
      rank: 2,
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
      "selected",
    ]);
  });
});
