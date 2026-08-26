import { scaleLinear } from "d3";
import { useId } from "react";
import type { NumericConstraint } from "../../types/criterion";
import type { CriterionEvaluation } from "../../types/match";
import { unitDefinitions } from "../../types/unit";
import { criterionDefinitions } from "../criteria/criterion-definitions";
import { formatActualValue, formatPreference, priorityLabels } from "../criteria/format-criterion";
import { formatMatchScore } from "../matches/format-match";
import {
  deriveVisualizationDomain,
  getPreferredInterval,
  type VisualizationDomain,
} from "./criterion-visualization-domain";

const chartWidth = 640;
const chartHeight = 116;
const chartInset = 28;
const trackY = 42;

type CriterionVisualizationProps = Readonly<{
  evaluation: CriterionEvaluation;
}>;

type BoundaryMarker = Readonly<{
  label: string;
  value: number;
}>;

function getBoundaryMarkers(constraint: NumericConstraint): readonly BoundaryMarker[] {
  switch (constraint.type) {
    case "maximum":
      return [{ label: "maximum", value: constraint.threshold }];
    case "minimum":
      return [{ label: "minimum", value: constraint.threshold }];
    case "range":
      return [
        { label: "range start", value: constraint.minimum },
        { label: "range end", value: constraint.maximum },
      ];
  }
}

function getTextAnchor(xPosition: number): "start" | "middle" | "end" {
  if (xPosition < chartInset + 54) {
    return "start";
  }

  if (xPosition > chartWidth - chartInset - 54) {
    return "end";
  }

  return "middle";
}

export function CriterionVisualization({ evaluation }: CriterionVisualizationProps) {
  const id = useId();
  const definition = criterionDefinitions[evaluation.criterionId];
  const unit = unitDefinitions[evaluation.actual.unit];
  const actualValue = evaluation.actual.value;
  const rawDomain = deriveVisualizationDomain(actualValue, evaluation.constraint, unit.id);
  const scale = scaleLinear()
    .domain(rawDomain)
    .nice(4)
    .range([chartInset, chartWidth - chartInset]);
  const niceDomainValues = scale.domain();
  const niceDomain: VisualizationDomain = [
    niceDomainValues[0] ?? rawDomain[0],
    niceDomainValues[1] ?? rawDomain[1],
  ];
  const preferredInterval = getPreferredInterval(evaluation.constraint, niceDomain);
  const preferenceStart = scale(preferredInterval[0]);
  const preferenceEnd = scale(preferredInterval[1]);
  const actualPosition = scale(actualValue);
  const actual = formatActualValue(actualValue, unit.symbol);
  const preference = formatPreference(evaluation.constraint, unit.symbol);
  const priority = priorityLabels[evaluation.priority];
  const satisfaction = evaluation.satisfied ? "Satisfied" : "Not satisfied";
  const score = formatMatchScore(evaluation.score);
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const accessibleSummary = `${definition.label}. Actual value ${formatActualValue(
    actualValue,
    unit.label,
  )}. Preference ${preference}. ${satisfaction}. Match score ${score}. Priority ${priority}.`;
  const ticks = scale.ticks(4);
  const boundaryMarkers = getBoundaryMarkers(evaluation.constraint).map((boundary) => ({
    ...boundary,
    position: scale(boundary.value),
  }));
  const staggerBoundaryLabels =
    boundaryMarkers.length === 2 &&
    Math.abs((boundaryMarkers[0]?.position ?? 0) - (boundaryMarkers[1]?.position ?? 0)) < 120;

  return (
    <figure aria-labelledby={titleId} aria-describedby={descriptionId} className="min-w-0 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h5 id={titleId} className="text-base font-semibold tracking-tight">
          {definition.label}
        </h5>
        <div className="flex flex-wrap items-center justify-end gap-2 text-xs font-semibold">
          <span className="rounded-full border border-stone-300 px-2.5 py-1 text-stone-600 dark:border-stone-600 dark:text-stone-300">
            {priority}
          </span>
          <span
            className={
              evaluation.satisfied
                ? "text-lime-700 dark:text-lime-300"
                : "text-amber-700 dark:text-amber-300"
            }
          >
            <span aria-hidden="true">{evaluation.satisfied ? "✓" : "×"} </span>
            {satisfaction}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.4fr)_auto] sm:items-end">
        <p>
          <span className="block text-xs text-stone-500 dark:text-stone-400">Actual</span>
          <span className="mt-1 block text-xl font-semibold tabular-nums">{actual}</span>
        </p>
        <p>
          <span className="block text-xs text-stone-500 dark:text-stone-400">Preference</span>
          <span className="mt-1 block text-sm font-medium">{preference}</span>
        </p>
        <p className="text-left sm:text-right">
          <span className="block text-xs text-stone-500 dark:text-stone-400">Strength</span>
          <span className="mt-1 block text-sm font-semibold tabular-nums">{score} match</span>
        </p>
      </div>

      <svg
        aria-hidden="true"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="mt-3 block h-auto w-full overflow-visible"
      >
        <line
          x1={chartInset}
          x2={chartWidth - chartInset}
          y1={trackY}
          y2={trackY}
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-stone-300 dark:stroke-stone-700"
        />
        <line
          x1={preferenceStart}
          x2={preferenceEnd}
          y1={trackY}
          y2={trackY}
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-cyan-700 dark:stroke-cyan-300"
        />

        {boundaryMarkers.map((boundary, index) => {
          return (
            <g key={boundary.label}>
              <line
                x1={boundary.position}
                x2={boundary.position}
                y1="25"
                y2="61"
                strokeWidth="2"
                strokeDasharray="4 3"
                className="stroke-stone-800 dark:stroke-stone-100"
              />
              <text
                x={boundary.position}
                y={staggerBoundaryLabels ? 72 + index * 20 : 75}
                textAnchor={getTextAnchor(boundary.position)}
                className="fill-stone-600 text-[18px] font-medium dark:fill-stone-300"
              >
                {boundary.label}
              </text>
            </g>
          );
        })}

        <line
          x1={actualPosition}
          x2={actualPosition}
          y1="10"
          y2={trackY}
          strokeWidth="2"
          className={
            evaluation.satisfied
              ? "stroke-lime-700 dark:stroke-lime-300"
              : "stroke-amber-700 dark:stroke-amber-300"
          }
        />
        {evaluation.satisfied ? (
          <circle
            cx={actualPosition}
            cy={trackY}
            r="9"
            strokeWidth="3"
            className="fill-lime-700 stroke-white dark:fill-lime-300 dark:stroke-stone-950"
          />
        ) : (
          <rect
            x={actualPosition - 7}
            y={trackY - 7}
            width="14"
            height="14"
            rx="1"
            strokeWidth="3"
            transform={`rotate(45 ${actualPosition} ${trackY})`}
            className="fill-amber-700 stroke-white dark:fill-amber-300 dark:stroke-stone-950"
          />
        )}
        <text
          x={actualPosition}
          y="8"
          textAnchor={getTextAnchor(actualPosition)}
          className="fill-stone-950 text-[20px] font-semibold tabular-nums dark:fill-stone-50"
        >
          {actual}
        </text>

        {ticks.map((tick) => {
          const tickPosition = scale(tick);

          return (
            <g key={tick}>
              <line
                x1={tickPosition}
                x2={tickPosition}
                y1="88"
                y2="94"
                strokeWidth="1"
                className="stroke-stone-400 dark:stroke-stone-600"
              />
              <text
                x={tickPosition}
                y="112"
                textAnchor={getTextAnchor(tickPosition)}
                className="fill-stone-500 text-[17px] tabular-nums dark:fill-stone-400"
              >
                {formatActualValue(tick, unit.symbol)}
              </text>
            </g>
          );
        })}
      </svg>

      {evaluation.priority === "required" ? (
        <p className="mt-2 text-xs leading-5 text-stone-600 dark:text-stone-400">
          {evaluation.satisfied
            ? "Required condition met."
            : "Required condition failed — this location is excluded."}
        </p>
      ) : null}

      <figcaption id={descriptionId} className="sr-only">
        {accessibleSummary}
      </figcaption>
    </figure>
  );
}
