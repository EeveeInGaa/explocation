import { type ChangeEvent, useState } from "react";
import {
  type ConfiguredCriterion,
  type ConstraintType,
  type CriterionPriority,
  constraintTypes,
  criterionPriorities,
} from "../../types/criterion";
import { unitDefinitions } from "../../types/unit";
import { criterionDefinitions } from "./criterion-definitions";
import { constraintTypeLabels, priorityLabels } from "./format-criterion";

type CriterionControlProps = Readonly<{
  configured: ConfiguredCriterion;
  onConstraintTypeChange: (constraintType: ConstraintType) => void;
  onThresholdChange: (threshold: number) => void;
  onRangeChange: (minimum: number, maximum: number) => void;
  onPriorityChange: (priority: CriterionPriority) => void;
}>;

type ThresholdInputProps = Readonly<{
  id: string;
  name: string;
  value: number;
  unitSymbol: string;
  onValidChange: (value: number) => void;
}>;

type RangeInputsProps = Readonly<{
  id: string;
  name: string;
  minimum: number;
  maximum: number;
  unitSymbol: string;
  onValidChange: (minimum: number, maximum: number) => void;
}>;

function parseFiniteNumber(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function isConstraintType(value: string): value is ConstraintType {
  return constraintTypes.some((constraintType) => constraintType === value);
}

function isCriterionPriority(value: string): value is CriterionPriority {
  return criterionPriorities.some((priority) => priority === value);
}

function ThresholdInput({ id, name, value, unitSymbol, onValidChange }: ThresholdInputProps) {
  const [draft, setDraft] = useState(() => String(value));
  const [showError, setShowError] = useState(false);
  const parsedValue = parseFiniteNumber(draft);
  const errorMessage = parsedValue === null ? "Enter a finite number." : null;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextDraft = event.target.value;
    const nextValue = parseFiniteNumber(nextDraft);
    setDraft(nextDraft);
    setShowError(false);

    if (nextValue !== null) {
      onValidChange(nextValue);
    }
  }

  function handleBlur() {
    if (parsedValue === null) {
      setShowError(true);
      return;
    }

    setDraft(String(parsedValue));
  }

  const feedbackId = `${id}-feedback`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-300"
      >
        Value
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          name={name}
          type="number"
          inputMode="decimal"
          step="any"
          required
          value={draft}
          aria-describedby={feedbackId}
          aria-invalid={showError && errorMessage !== null}
          onBlur={handleBlur}
          onChange={handleChange}
          className="min-h-12 min-w-0 flex-1 rounded-sm border border-stone-400 bg-white px-3 py-2 text-base tabular-nums outline-none focus-visible:border-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-700/25 dark:border-stone-600 dark:bg-stone-950 dark:focus-visible:border-cyan-300 dark:focus-visible:ring-cyan-300/25"
        />
        <span className="min-w-8 text-sm font-medium text-stone-600 dark:text-stone-300">
          {unitSymbol}
        </span>
      </div>
      <p
        id={feedbackId}
        aria-live="polite"
        className="mt-1 min-h-5 text-xs text-red-700 dark:text-red-300"
      >
        {showError ? errorMessage : null}
      </p>
    </div>
  );
}

function RangeInputs({ id, name, minimum, maximum, unitSymbol, onValidChange }: RangeInputsProps) {
  const [drafts, setDrafts] = useState(() => ({
    minimum: String(minimum),
    maximum: String(maximum),
  }));
  const [showError, setShowError] = useState(false);
  const parsedMinimum = parseFiniteNumber(drafts.minimum);
  const parsedMaximum = parseFiniteNumber(drafts.maximum);
  const errorMessage =
    parsedMinimum === null || parsedMaximum === null
      ? "Enter two finite numbers."
      : parsedMinimum > parsedMaximum
        ? "The lower value must not exceed the upper value."
        : null;

  function updateDraft(boundary: "minimum" | "maximum", value: string) {
    const nextDrafts = { ...drafts, [boundary]: value };
    const nextMinimum = parseFiniteNumber(nextDrafts.minimum);
    const nextMaximum = parseFiniteNumber(nextDrafts.maximum);
    setDrafts(nextDrafts);
    setShowError(false);

    if (nextMinimum !== null && nextMaximum !== null && nextMinimum <= nextMaximum) {
      onValidChange(nextMinimum, nextMaximum);
    }
  }

  function handleBlur() {
    if (errorMessage !== null) {
      setShowError(true);
      return;
    }

    setDrafts({
      minimum: String(parsedMinimum),
      maximum: String(parsedMaximum),
    });
  }

  const feedbackId = `${id}-feedback`;
  const inputClassName =
    "min-h-12 min-w-0 w-full rounded-sm border border-stone-400 bg-white px-3 py-2 text-base tabular-nums outline-none focus-visible:border-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-700/25 dark:border-stone-600 dark:bg-stone-950 dark:focus-visible:border-cyan-300 dark:focus-visible:ring-cyan-300/25";

  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-end gap-2">
        <div>
          <label
            htmlFor={`${id}-minimum`}
            className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-300"
          >
            From
          </label>
          <input
            id={`${id}-minimum`}
            name={`${name}-minimum`}
            type="number"
            inputMode="decimal"
            step="any"
            required
            value={drafts.minimum}
            aria-describedby={feedbackId}
            aria-invalid={showError && errorMessage !== null}
            onBlur={handleBlur}
            onChange={(event) => updateDraft("minimum", event.target.value)}
            className={inputClassName}
          />
        </div>
        <span aria-hidden="true" className="pb-3 text-stone-400">
          –
        </span>
        <div>
          <label
            htmlFor={`${id}-maximum`}
            className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-300"
          >
            To
          </label>
          <input
            id={`${id}-maximum`}
            name={`${name}-maximum`}
            type="number"
            inputMode="decimal"
            step="any"
            required
            value={drafts.maximum}
            aria-describedby={feedbackId}
            aria-invalid={showError && errorMessage !== null}
            onBlur={handleBlur}
            onChange={(event) => updateDraft("maximum", event.target.value)}
            className={inputClassName}
          />
        </div>
        <span className="min-w-8 pb-3 text-sm font-medium text-stone-600 dark:text-stone-300">
          {unitSymbol}
        </span>
      </div>
      <p
        id={feedbackId}
        aria-live="polite"
        className="mt-1 min-h-5 text-xs text-red-700 dark:text-red-300"
      >
        {showError ? errorMessage : null}
      </p>
    </div>
  );
}

export function CriterionControl({
  configured,
  onConstraintTypeChange,
  onThresholdChange,
  onRangeChange,
  onPriorityChange,
}: CriterionControlProps) {
  const definition = criterionDefinitions[configured.criterionId];
  const unit = unitDefinitions[definition.unit];
  const controlId = `criterion-${configured.criterionId}`;

  return (
    <fieldset className="rounded-sm border border-stone-300 bg-white/60 p-4 dark:border-stone-700 dark:bg-stone-900/50">
      <legend className="px-1 text-base font-semibold text-stone-900 dark:text-stone-100">
        {definition.shortLabel}
      </legend>

      <div className="mt-1 grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${controlId}-type`}
            className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-300"
          >
            Preference
          </label>
          <select
            id={`${controlId}-type`}
            name={`${configured.criterionId}-constraint-type`}
            value={configured.constraint.type}
            onChange={(event) => {
              if (isConstraintType(event.target.value)) {
                onConstraintTypeChange(event.target.value);
              }
            }}
            className="min-h-12 w-full rounded-sm border border-stone-400 bg-white px-3 py-2 text-base outline-none focus-visible:border-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-700/25 dark:border-stone-600 dark:bg-stone-950 dark:focus-visible:border-cyan-300 dark:focus-visible:ring-cyan-300/25"
          >
            {definition.supportedConstraintTypes.map((constraintType) => (
              <option key={constraintType} value={constraintType}>
                {constraintTypeLabels[constraintType]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={`${controlId}-priority`}
            className="mb-1.5 block text-xs font-medium text-stone-600 dark:text-stone-300"
          >
            Priority
          </label>
          <select
            id={`${controlId}-priority`}
            name={`${configured.criterionId}-priority`}
            value={configured.priority}
            onChange={(event) => {
              if (isCriterionPriority(event.target.value)) {
                onPriorityChange(event.target.value);
              }
            }}
            className="min-h-12 w-full rounded-sm border border-stone-400 bg-white px-3 py-2 text-base outline-none focus-visible:border-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-700/25 dark:border-stone-600 dark:bg-stone-950 dark:focus-visible:border-cyan-300 dark:focus-visible:ring-cyan-300/25"
          >
            {criterionPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabels[priority]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-1">
        {configured.constraint.type === "range" ? (
          <RangeInputs
            key="range"
            id={`${controlId}-range`}
            name={`${configured.criterionId}-range`}
            minimum={configured.constraint.minimum}
            maximum={configured.constraint.maximum}
            unitSymbol={unit.symbol}
            onValidChange={onRangeChange}
          />
        ) : (
          <ThresholdInput
            key={configured.constraint.type}
            id={`${controlId}-value`}
            name={`${configured.criterionId}-value`}
            value={configured.constraint.threshold}
            unitSymbol={unit.symbol}
            onValidChange={onThresholdChange}
          />
        )}
      </div>
    </fieldset>
  );
}
