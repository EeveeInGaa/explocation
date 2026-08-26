import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyClimateData } from "../../../types/climate";
import {
  formatDaylightDuration,
  formatDaylightHours,
  formatShortMonth,
  formatTemperature,
  formatTemperatureAxis,
} from "./climate-formatters";

export type ClimateMetric = "temperature" | "daylight";

type ClimateChartProps = Readonly<{
  data: readonly MonthlyClimateData[];
  metric: ClimateMetric;
}>;

const metricConfig = {
  temperature: {
    dataKey: "averageTemperatureCelsius",
    label: "Average temperature",
    formatAxis: formatTemperatureAxis,
    formatTooltip: formatTemperature,
    colorClassName: "text-amber-700 dark:text-amber-300",
  },
  daylight: {
    dataKey: "daylightHours",
    label: "Daylight duration",
    formatAxis: formatDaylightHours,
    formatTooltip: formatDaylightDuration,
    colorClassName: "text-lime-700 dark:text-lime-300",
  },
} as const;

function calculateDomain(data: readonly MonthlyClimateData[], metric: ClimateMetric) {
  const values = data.map((month) =>
    metric === "temperature" ? month.averageTemperatureCelsius : month.daylightHours,
  );

  if (values.length === 0) {
    return [0, 1] as const;
  }

  const minimum = Math.min(...values);
  const maximum = Math.max(...values);

  if (metric === "daylight") {
    return [0, Math.max(1, Math.ceil(maximum * 1.08))] as const;
  }

  const contextualMinimum = Math.min(0, minimum);
  const contextualMaximum = Math.max(0, maximum);
  const spread = Math.max(1, contextualMaximum - contextualMinimum);
  const padding = Math.max(1, spread * 0.08);

  return [Math.floor(contextualMinimum - padding), Math.ceil(contextualMaximum + padding)] as const;
}

export function ClimateChart({ data, metric }: ClimateChartProps) {
  const config = metricConfig[metric];
  const domain = calculateDomain(data, metric);
  const chartData = data.map((month) => ({
    ...month,
    monthLabel: formatShortMonth(month.month),
  }));

  return (
    <div className={`h-72 min-w-0 sm:h-80 ${config.colorClassName}`} aria-hidden="true">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        initialDimension={{ width: 720, height: 320 }}
      >
        <AreaChart
          data={chartData}
          margin={{ top: 12, right: 8, bottom: 4, left: 0 }}
          accessibilityLayer={false}
        >
          <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.12} />
          <XAxis
            dataKey="monthLabel"
            axisLine={false}
            tickLine={false}
            interval={0}
            tick={{ fill: "currentColor", fontSize: 10 }}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "currentColor", fontSize: 11 }}
            tickFormatter={config.formatAxis}
            domain={domain}
            width={45}
          />
          {metric === "temperature" ? (
            <ReferenceLine y={0} stroke="currentColor" strokeDasharray="3 4" strokeOpacity={0.45} />
          ) : null}
          <Tooltip
            cursor={{ stroke: "currentColor", strokeOpacity: 0.3 }}
            formatter={(value) => [
              typeof value === "number" ? config.formatTooltip(value) : "Not available",
              config.label,
            ]}
            contentStyle={{
              background: "#1c1917",
              border: "1px solid #57534e",
              borderRadius: "2px",
              color: "#fafaf9",
            }}
            itemStyle={{ color: "#fafaf9" }}
            labelStyle={{ color: "#d6d3d1", marginBottom: "0.25rem" }}
            isAnimationActive="auto"
          />
          <Area
            type="monotone"
            dataKey={config.dataKey}
            name={config.label}
            stroke="currentColor"
            strokeWidth={2.5}
            fill="currentColor"
            fillOpacity={0.1}
            dot={{ fill: "currentColor", r: 2.5, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "currentColor", stroke: "#fafaf9", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
