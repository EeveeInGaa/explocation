import type { CriterionCategory, CriterionDefinition, CriterionId } from "../../types/criterion";
import { criterionCategories } from "../../types/criterion";
import { unitDefinitions } from "../../types/unit";
import { categoryLabels } from "./criterion-definitions";

type CriterionPickerProps = Readonly<{
  availableCriteria: readonly CriterionDefinition[];
  onAdd: (criterionId: CriterionId) => void;
}>;

export function CriterionPicker({ availableCriteria, onAdd }: CriterionPickerProps) {
  function criteriaInCategory(category: CriterionCategory) {
    return availableCriteria.filter((definition) => definition.category === category);
  }

  return (
    <section
      id="criterion-picker"
      aria-labelledby="criterion-picker-heading"
      className="mt-3 rounded-sm border border-cyan-700/40 bg-cyan-50/50 p-4 shadow-[0_12px_32px_rgba(28,25,23,0.08)] dark:border-cyan-300/30 dark:bg-cyan-950/20"
    >
      <div className="max-w-sm">
        <h3 id="criterion-picker-heading" className="text-base font-semibold tracking-tight">
          Choose what matters to you
        </h3>
        <p className="mt-1 text-xs leading-5 text-stone-600 dark:text-stone-400">
          Each criterion starts with a suggested preference that you can change immediately.
        </p>
      </div>

      <div className="mt-5 space-y-5">
        {criterionCategories.map((category) => {
          const categoryCriteria = criteriaInCategory(category);

          if (categoryCriteria.length === 0) {
            return null;
          }

          return (
            <section key={category} aria-labelledby={`picker-category-${category}`}>
              <h4
                id={`picker-category-${category}`}
                className="text-xs font-semibold tracking-[0.14em] text-stone-500 uppercase dark:text-stone-400"
              >
                {categoryLabels[category]}
              </h4>
              <ul className="mt-2 grid gap-2">
                {categoryCriteria.map((definition) => {
                  const unit = unitDefinitions[definition.unit];

                  return (
                    <li key={definition.id}>
                      <button
                        type="button"
                        onClick={() => onAdd(definition.id)}
                        className="group flex min-h-12 w-full items-center justify-between gap-4 rounded-sm border border-stone-300 bg-white px-3 py-2.5 text-left outline-none transition-colors hover:border-cyan-700 hover:bg-cyan-50 focus-visible:border-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-700/25 dark:border-stone-700 dark:bg-stone-900 dark:hover:border-cyan-300 dark:hover:bg-cyan-950/30 dark:focus-visible:border-cyan-300 dark:focus-visible:ring-cyan-300/25"
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold">{definition.label}</span>
                          <span className="mt-0.5 block text-xs text-stone-500 dark:text-stone-400">
                            Measured in {unit.label}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="grid size-7 shrink-0 place-items-center rounded-full border border-stone-300 text-lg leading-none text-cyan-800 transition-colors group-hover:border-cyan-700 dark:border-stone-600 dark:text-cyan-200 dark:group-hover:border-cyan-300"
                        >
                          +
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </section>
  );
}
