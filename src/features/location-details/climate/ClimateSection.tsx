import { useState } from "react";
import type { LocationClimateData } from "../../../types/climate";
import { ClimateChart, type ClimateMetric } from "./ClimateChart";
import { formatDaylightDuration, formatFullMonth, formatTemperature } from "./climate-formatters";

type ClimateSectionProps = Readonly<{
  locationName: string;
  climateData: LocationClimateData | undefined;
}>;

const metricLabels = {
  temperature: "Temperature",
  daylight: "Daylight",
} as const satisfies Record<ClimateMetric, string>;

const climateMetrics = ["temperature", "daylight"] as const satisfies readonly ClimateMetric[];

export function ClimateSection({ locationName, climateData }: ClimateSectionProps) {
  const [metric, setMetric] = useState<ClimateMetric>("temperature");
  const metricLabel = metricLabels[metric];

  return (
    <section
      aria-labelledby="yearly-climate-heading"
      className="mt-10 border-t border-stone-300 pt-8 dark:border-stone-700"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <h4 id="yearly-climate-heading" className="text-xl font-semibold tracking-tight">
              Yearly climate
            </h4>
            <span className="rounded-full border border-amber-600/50 px-2 py-1 text-[0.65rem] font-semibold tracking-[0.1em] text-amber-800 uppercase dark:border-amber-300/50 dark:text-amber-200">
              Prepared prototype data
            </span>
          </div>
          <p
            id="climate-description"
            className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400"
          >
            A prepared monthly profile for {locationName}; these values are illustrative rather than
            verified climate observations.
          </p>
        </div>

        {climateData === undefined ? null : (
          <fieldset className="inline-flex rounded-sm border border-stone-300 bg-stone-100 p-1 dark:border-stone-700 dark:bg-stone-900">
            <legend className="sr-only">Climate metric</legend>
            {climateMetrics.map((availableMetric) => (
              <button
                key={availableMetric}
                type="button"
                aria-pressed={metric === availableMetric}
                onClick={() => setMetric(availableMetric)}
                className="rounded-[1px] px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-700 aria-pressed:bg-stone-900 aria-pressed:text-stone-50 dark:text-stone-300 dark:hover:text-stone-50 dark:focus-visible:outline-lime-300 dark:aria-pressed:bg-stone-100 dark:aria-pressed:text-stone-950"
              >
                {metricLabels[availableMetric]}
              </button>
            ))}
          </fieldset>
        )}
      </div>

      {climateData === undefined ? (
        <p className="mt-5 rounded-sm border border-dashed border-stone-400 px-5 py-7 text-sm leading-6 text-stone-600 dark:border-stone-600 dark:text-stone-400">
          Climate data is not available for this location yet.
        </p>
      ) : (
        <div className="mt-6 min-w-0 rounded-sm bg-stone-50 px-2 py-5 sm:px-5 dark:bg-stone-900/50">
          <h5 className="px-2 text-base font-semibold">{metricLabel} through the year</h5>
          <p className="px-2 pt-1 text-xs text-stone-500 dark:text-stone-400">
            {metric === "temperature"
              ? "Average monthly temperature in degrees Celsius"
              : "Average daylight duration per day"}
          </p>
          <ClimateChart data={climateData.months} metric={metric} />

          <div className="sr-only">
            <table>
              <caption>{locationName} monthly climate data</caption>
              <thead>
                <tr>
                  <th scope="col">Month</th>
                  <th scope="col">Average temperature</th>
                  <th scope="col">Daylight duration</th>
                </tr>
              </thead>
              <tbody>
                {climateData.months.map((month) => (
                  <tr key={month.month}>
                    <th scope="row">{formatFullMonth(month.month)}</th>
                    <td>{formatTemperature(month.averageTemperatureCelsius)}</td>
                    <td>{formatDaylightDuration(month.daylightHours)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
