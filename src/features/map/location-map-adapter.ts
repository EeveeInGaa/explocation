import type { LocationMatch } from "../../types/match";

export type LocationMapProperties = Readonly<{
  id: string;
  name: string;
  qualified: boolean;
  rank: number;
  selected: boolean;
}>;

export type LocationMapFeature = Readonly<{
  type: "Feature";
  id: string;
  geometry: Readonly<{
    type: "Point";
    coordinates: [longitude: number, latitude: number];
  }>;
  properties: LocationMapProperties;
}>;

export type LocationMapFeatureCollection = Readonly<{
  type: "FeatureCollection";
  features: LocationMapFeature[];
}>;

export function toLocationMapFeatureCollection(
  matches: readonly LocationMatch[],
  topMatches: readonly LocationMatch[],
  selectedLocationId: string | null,
): LocationMapFeatureCollection {
  const ranks = new Map(topMatches.map((match, index) => [match.location.id, index + 1] as const));

  return {
    type: "FeatureCollection",
    features: matches.map((match) => ({
      type: "Feature",
      id: match.location.id,
      geometry: {
        type: "Point",
        coordinates: [match.location.coordinates.longitude, match.location.coordinates.latitude],
      },
      properties: {
        id: match.location.id,
        name: match.location.name,
        qualified: match.qualified,
        rank: ranks.get(match.location.id) ?? 0,
        selected: match.location.id === selectedLocationId,
      },
    })),
  };
}
