import type { MonthId } from "../data/months";

export type MonthlyClimateData = Readonly<{
  month: MonthId;
  averageTemperatureCelsius: number;
  daylightHours: number;
}>;

export type LocationClimateData = Readonly<{
  locationId: string;
  months: readonly MonthlyClimateData[];
}>;
