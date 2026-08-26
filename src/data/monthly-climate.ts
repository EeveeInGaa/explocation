import type { LocationClimateData } from "../types/climate";
import { months } from "./months";

type MonthlyValues = readonly [temperatureCelsius: number, daylightHours: number];
type MonthlyValuesFor<MonthDefinitions extends readonly unknown[]> =
  MonthDefinitions extends readonly [unknown, ...infer RemainingMonths]
    ? readonly [MonthlyValues, ...MonthlyValuesFor<RemainingMonths>]
    : readonly [];
type YearlyValues = MonthlyValuesFor<typeof months>;

function prepareMonths(values: YearlyValues) {
  return months.map((month, index) => {
    const valuesForMonth = values[index];

    if (valuesForMonth === undefined) {
      throw new Error(`Missing prepared climate values for ${month.fullLabel}.`);
    }

    return {
      month: month.id,
      averageTemperatureCelsius: valuesForMonth[0],
      daylightHours: valuesForMonth[1],
    };
  });
}

/**
 * Prepared prototype profiles for real locations. These deterministic values are designed to be
 * internally plausible and useful for product development, but they are not verified observations.
 * A later climate-data pipeline will replace them.
 */
export const preparedMonthlyClimateData = [
  {
    locationId: "vik-is",
    months: prepareMonths([
      [1, 5],
      [1, 8],
      [2, 12],
      [4, 15.5],
      [7, 19],
      [10, 21],
      [11, 19.5],
      [11, 16],
      [8, 12.5],
      [5, 9],
      [3, 6],
      [1, 4.5],
    ]),
  },
  {
    locationId: "kilpisjarvi-fi",
    months: prepareMonths([
      [-14, 1],
      [-13, 5],
      [-8, 10.5],
      [-2, 16],
      [4, 21.5],
      [9, 24],
      [11, 24],
      [9, 18],
      [4, 13],
      [-2, 7.5],
      [-9, 2.5],
      [-13, 0],
    ]),
  },
  {
    locationId: "bialowieza-pl",
    months: prepareMonths([
      [-3, 8],
      [-2, 10],
      [3, 12],
      [9, 14],
      [14, 16],
      [18, 16.7],
      [19.5, 16.2],
      [18.5, 14.7],
      [13, 12.7],
      [8, 10.7],
      [3, 8.8],
      [-1, 7.7],
    ]),
  },
  {
    locationId: "hanko-fi",
    months: prepareMonths([
      [-2, 6],
      [-3, 8.5],
      [0, 11.8],
      [5, 15],
      [10, 18],
      [15, 19],
      [17.5, 18],
      [16.5, 15.5],
      [12, 12.7],
      [7, 9.7],
      [3, 7],
      [0, 5.5],
    ]),
  },
  {
    locationId: "geiranger-no",
    months: prepareMonths([
      [-1, 5.5],
      [0, 8],
      [2, 11.5],
      [6, 15],
      [10, 18.3],
      [13, 19.5],
      [13.5, 18.5],
      [13, 15.5],
      [9, 12.5],
      [5, 9.5],
      [1, 6.5],
      [-1, 5],
    ]),
  },
  {
    locationId: "abisko-se",
    months: prepareMonths([
      [-13, 1],
      [-12, 5],
      [-8, 10],
      [-2, 16],
      [4, 22],
      [9, 24],
      [11.5, 24],
      [9, 18],
      [4, 13],
      [-2, 7],
      [-8, 2],
      [-11, 0],
    ]),
  },
  {
    locationId: "are-se",
    months: prepareMonths([
      [-8, 4.5],
      [-7, 7.5],
      [-3, 11],
      [2, 15],
      [7, 18.5],
      [12, 20],
      [13, 19],
      [11, 16],
      [7, 12.5],
      [2, 9],
      [-3, 6],
      [-7, 4],
    ]),
  },
  {
    locationId: "cesky-krumlov-cz",
    months: prepareMonths([
      [-1, 8.7],
      [1, 10.2],
      [5, 12],
      [10, 13.7],
      [15, 15.2],
      [18.5, 16],
      [19.5, 15.6],
      [19, 14.2],
      [14, 12.5],
      [9, 10.8],
      [4, 9.2],
      [0, 8.3],
    ]),
  },
  {
    locationId: "luneburg-de",
    months: prepareMonths([
      [1, 8],
      [2, 9.7],
      [6, 11.8],
      [10, 14],
      [15, 15.8],
      [18, 16.7],
      [20.5, 16.2],
      [19, 14.5],
      [15, 12.5],
      [10, 10.5],
      [5, 8.8],
      [2, 7.7],
    ]),
  },
  {
    locationId: "koli-fi",
    months: prepareMonths([
      [-10, 4.5],
      [-9, 7.5],
      [-4, 11],
      [2, 15],
      [8, 18.5],
      [13, 20],
      [15, 19],
      [13, 16],
      [8, 12.5],
      [2, 9],
      [-4, 6],
      [-8, 4],
    ]),
  },
] as const satisfies readonly LocationClimateData[];

const climateByLocationId = new Map<string, LocationClimateData>(
  preparedMonthlyClimateData.map((climateData) => [climateData.locationId, climateData]),
);

export function getPreparedMonthlyClimate(locationId: string): LocationClimateData | undefined {
  return climateByLocationId.get(locationId);
}
