import { describe, expect, it } from "vitest";
import { preparedPrototypeLocations } from "./locations";
import { getPreparedMonthlyClimate, preparedMonthlyClimateData } from "./monthly-climate";
import { monthIds } from "./months";

describe("prepared monthly climate data", () => {
  it("contains one deterministic 12-month profile for every prepared location", () => {
    const locationIds = preparedPrototypeLocations.map((location) => location.id).sort();
    const climateLocationIds = preparedMonthlyClimateData
      .map((climateData) => climateData.locationId)
      .sort();

    expect(climateLocationIds).toEqual(locationIds);

    for (const climateData of preparedMonthlyClimateData) {
      expect(climateData.months).toHaveLength(12);
      expect(climateData.months.map((month) => month.month)).toEqual(monthIds);
      expect(getPreparedMonthlyClimate(climateData.locationId)).toBe(climateData);
    }
  });

  it("contains only finite numeric values", () => {
    for (const climateData of preparedMonthlyClimateData) {
      for (const month of climateData.months) {
        expect(Number.isFinite(month.averageTemperatureCelsius)).toBe(true);
        expect(Number.isFinite(month.daylightHours)).toBe(true);
      }
    }
  });
});
