import type { SubmitEvent } from "react";
import {
  type ConfiguredCriterion,
  type ConstraintType,
  type CriterionId,
  type CriterionPriority,
  criterionCategories,
} from "../../types/criterion";
import { CriterionControl } from "./CriterionControl";
import { categoryLabels, criterionDefinitions } from "./criterion-definitions";

type CriteriaPanelProps = Readonly<{
  criteria: readonly ConfiguredCriterion[];
  onConstraintTypeChange: (criterionId: CriterionId, constraintType: ConstraintType) => void;
  onThresholdChange: (criterionId: CriterionId, threshold: number) => void;
  onRangeChange: (criterionId: CriterionId, minimum: number, maximum: number) => void;
  onPriorityChange: (criterionId: CriterionId, priority: CriterionPriority) => void;
  onReset: () => void;
}>;

export function CriteriaPanel({
  criteria,
  onConstraintTypeChange,
  onThresholdChange,
  onRangeChange,
  onPriorityChange,
  onReset,
}: CriteriaPanelProps) {
  function preventSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
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
        {criterionCategories.map((category) => {
          const categoryCriteria = criteria.filter(
            (configured) => criterionDefinitions[configured.criterionId].category === category,
          );

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
                  />
                ))}
              </div>
            </section>
          );
        })}
      </form>
    </section>
  );
}
