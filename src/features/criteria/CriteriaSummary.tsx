import type { ConfiguredCriterion } from "../../types/criterion";
import { categoryLabels, criterionDefinitions } from "./criterion-definitions";
import { formatConfiguredCriterion } from "./format-criterion";

type CriteriaSummaryProps = Readonly<{
  criteria: readonly ConfiguredCriterion[];
}>;

export function CriteriaSummary({ criteria }: CriteriaSummaryProps) {
  return (
    <section aria-labelledby="criteria-heading">
      <div className="flex items-end justify-between gap-6 border-b border-stone-300 pb-4 dark:border-stone-700">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-lime-700 uppercase dark:text-lime-300">
            Default profile
          </p>
          <h2 id="criteria-heading" className="mt-2 text-2xl font-semibold tracking-tight">
            Current criteria
          </h2>
        </div>
        <p className="text-sm tabular-nums text-stone-500 dark:text-stone-400">
          {criteria.length} configured
        </p>
      </div>

      <ul className="mt-2 divide-y divide-stone-200 dark:divide-stone-800">
        {criteria.map((configured) => {
          const definition = criterionDefinitions[configured.criterionId];
          const formatted = formatConfiguredCriterion(configured);

          return (
            <li
              key={configured.criterionId}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-5 gap-y-1 py-4"
            >
              <div>
                <p className="font-medium text-stone-900 dark:text-stone-100">{formatted.label}</p>
                <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                  {categoryLabels[definition.category]}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                  {formatted.constraint}
                </p>
                <p
                  className={`mt-0.5 text-xs ${
                    configured.priority === "required"
                      ? "font-semibold text-amber-700 dark:text-amber-300"
                      : "text-stone-500 dark:text-stone-400"
                  }`}
                >
                  {formatted.priority}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
