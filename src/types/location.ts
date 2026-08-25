import type { CriterionId } from "./criterion";

export type Coordinates = Readonly<{
  latitude: number;
  longitude: number;
}>;

export type LocationMetricValues = Readonly<Record<CriterionId, number>>;

export type Location = Readonly<{
  id: string;
  name: string;
  country: string;
  coordinates: Coordinates;
  metrics: LocationMetricValues;
}>;
