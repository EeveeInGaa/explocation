import { type SubmitEvent, useRef, useState } from "react";
import {
  type ConfiguredCriterion,
  type ConstraintType,
  type CriterionId,
  type CriterionPriority,
  criterionCategories,
} from "../../types/criterion";
import { CriterionControl } from "./CriterionControl";
import { CriterionPicker } from "./CriterionPicker";
import { categoryLabels, criterionCatalog, criterionDefinitions } from "./criterion-definitions";

type CriteriaPanelProps = Readonly<{
  criteria: readonly ConfiguredCriterion[];
  prioritizeCompleteMatches: boolean;
  onConstraintTypeChange: (criterionId: CriterionId, constraintType: ConstraintType) => void;
  onThresholdChange: (criterionId: CriterionId, threshold: number) => void;
  onRangeChange: (criterionId: CriterionId, minimum: number, maximum: number) => void;
  onPriorityChange: (criterionId: CriterionId, priority: CriterionPriority) => void;
  onAddCriterion: (criterionId: CriterionId) => void;
  onRemoveCriterion: (criterionId: CriterionId) => void;
  onPrioritizeCompleteMatchesChange: (enabled: boolean) => void;
  onReset: () => void;
}>;

export function CriteriaPanel({
  criteria,
  prioritizeCompleteMatches,
  onConstraintTypeChange,
  onThresholdChange,
  onRangeChange,
  onPriorityChange,
  onAddCriterion,
  onRemoveCriterion,
  onPrioritizeCompleteMatchesChange,
  onReset,
}: CriteriaPanelProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const activeCriterionIds = new Set(criteria.map((configured) => configured.criterionId));
  const availableCriteria = criterionCatalog.filter(
    (definition) => !activeCriterionIds.has(definition.id),
  );

  function preventSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function handleAdd(criterionId: CriterionId) {
    onAddCriterion(criterionId);
    setIsPickerOpen(false);
    addButtonRef.current?.focus();
  }

  return (
    <section aria-labelledby="criteria-heading">
      <div className="flex items-end justify-between gap-5 border-b border-stone-300 pb-4 dark:border-stone-700">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-lime-700 uppercase dark:text-lime-300">
            Your preferences
          </p>
          <h2 id="criteria-heading" className="mt-2 text-2xl font-semibold tracking-tight">
            Criteria
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="min-h-12 rounded-sm px-3 py-2 text-sm font-semibold text-stone-700 underline decoration-stone-400 underline-offset-4 outline-none hover:text-stone-950 focus-visible:ring-2 focus-visible:ring-cyan-700 dark:text-stone-300 dark:hover:text-white dark:focus-visible:ring-cyan-300"
        >
          Reset preferences
        </button>
      </div>

      <form onSubmit={preventSubmit} className="mt-6 space-y-8">
        {criteria.length === 0 ? (
          <div className="rounded-sm border border-dashed border-stone-400 bg-white/50 px-5 py-6 dark:border-stone-600 dark:bg-stone-900/40">
            <h3 className="text-base font-semibold">
              Start by adding the things that matter to you.
            </h3>
            <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">
              Add criteria to discover places that fit how you want to live.
            </p>
          </div>
        ) : (
          <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-sm border border-stone-300 bg-white p-4 transition-colors hover:border-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-stone-500">
            <input
              type="checkbox"
              role="switch"
              aria-checked={prioritizeCompleteMatches}
              checked={prioritizeCompleteMatches}
              onChange={(event) => onPrioritizeCompleteMatchesChange(event.target.checked)}
              className="mt-0.5 size-5 shrink-0 cursor-pointer accent-cyan-700 outline-offset-4 focus-visible:outline-2 focus-visible:outline-cyan-700 dark:accent-cyan-300 dark:focus-visible:outline-cyan-300"
            />
            <span>
              <span className="block text-sm font-semibold">Prioritize complete matches</span>
              <span className="mt-1 block text-xs leading-5 text-stone-600 dark:text-stone-400">
                Rank locations that satisfy every preference before otherwise qualified matches.
              </span>
            </span>
          </label>
        )}

        {criterionCategories.map((category) => {
          const categoryCriteria = criteria.filter(
            (configured) => criterionDefinitions[configured.criterionId].category === category,
          );

          if (categoryCriteria.length === 0) {
            return null;
          }

          return (
            <section key={category}>
              <h3
                id={`category-${category}`}
                className="mb-3 text-xs font-semibold tracking-[0.14em] text-stone-500 uppercase dark:text-stone-400"
              >
                {categoryLabels[category]}
              </h3>
              <div className="space-y-4">
                {categoryCriteria.map((configured) => (
                  <CriterionControl
                    key={`${configured.criterionId}-${configured.constraint.type}`}
                    configured={configured}
                    onConstraintTypeChange={(constraintType) =>
                      onConstraintTypeChange(configured.criterionId, constraintType)
                    }
                    onThresholdChange={(threshold) =>
                      onThresholdChange(configured.criterionId, threshold)
                    }
                    onRangeChange={(minimum, maximum) =>
                      onRangeChange(configured.criterionId, minimum, maximum)
                    }
                    onPriorityChange={(priority) =>
                      onPriorityChange(configured.criterionId, priority)
                    }
                    onRemove={() => onRemoveCriterion(configured.criterionId)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        <div className="border-t border-stone-300 pt-5 dark:border-stone-700">
          <button
            ref={addButtonRef}
            type="button"
            aria-expanded={isPickerOpen}
            aria-controls="criterion-picker"
            disabled={availableCriteria.length === 0}
            onClick={() => setIsPickerOpen((isOpen) => !isOpen)}
            className="inline-flex min-h-12 items-center gap-2 rounded-sm border border-cyan-700 px-4 py-2 text-sm font-semibold text-cyan-800 outline-none transition-colors hover:bg-cyan-50 focus-visible:ring-2 focus-visible:ring-cyan-700/30 disabled:cursor-default disabled:border-stone-300 disabled:text-stone-500 dark:border-cyan-300 dark:text-cyan-200 dark:hover:bg-cyan-950/30 dark:focus-visible:ring-cyan-300/30 dark:disabled:border-stone-700 dark:disabled:text-stone-500"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              +
            </span>
            {availableCriteria.length === 0 ? "All criteria added" : "Add criterion"}
          </button>

          {isPickerOpen ? (
            <CriterionPicker availableCriteria={availableCriteria} onAdd={handleAdd} />
          ) : null}
        </div>
      </form>
    </section>
  );
}
