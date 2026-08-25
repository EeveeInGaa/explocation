import type { Location, LocationMetricValues } from "../types/location";

const baseMetrics: LocationMetricValues = {
  forestDistance: 0,
  waterDistance: 0,
  hikingTrailDistance: 0,
  groceryDistance: 0,
  airportDistance: 0,
  summerAverageTemperature: 0,
};

export function createTestLocation(
  id: string,
  metricOverrides: Partial<LocationMetricValues> = {},
): Location {
  return {
    id,
    name: id,
    country: "Test country",
    coordinates: { latitude: 0, longitude: 0 },
    metrics: {
      ...baseMetrics,
      ...metricOverrides,
    },
  };
}
