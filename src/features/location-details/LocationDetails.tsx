import { criterionCategories } from "../../types/criterion";
import type { LocationMatch } from "../../types/match";
import { categoryLabels } from "../criteria/criterion-definitions";
import { formatMatchScore } from "../matches/format-match";
import { CriterionVisualization } from "./CriterionVisualization";

type LocationDetailsProps = Readonly<{
  match: LocationMatch | null;
}>;

export function LocationDetails({ match }: LocationDetailsProps) {
  return (
    <section
      aria-labelledby="location-details-heading"
      className="border-t border-stone-300 pt-8 dark:border-stone-700"
    >
      <p className="text-xs font-semibold tracking-[0.16em] text-lime-700 uppercase dark:text-lime-300">
        Match explanation
      </p>
      <h2 id="location-details-heading" className="mt-2 text-2xl font-semibold tracking-tight">
        Location details
      </h2>

      {match === null ? (
        <p className="mt-4 rounded-sm border border-dashed border-stone-400 px-5 py-7 text-sm leading-6 text-stone-600 dark:border-stone-600 dark:text-stone-400">
          Select a top match to inspect every criterion evaluation.
        </p>
      ) : (
        <div className="mt-5">
          <div className="flex flex-wrap items-end justify-between gap-5 rounded-sm bg-stone-900 px-5 py-5 text-stone-50 dark:bg-stone-100 dark:text-stone-950">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">{match.location.name}</h3>
              <p className="mt-1 text-sm text-stone-300 dark:text-stone-600">
                {match.location.country} · {match.qualified ? "Qualified" : "No longer qualified"}
              </p>
            </div>
            <p className="text-right">
              <span className="block text-3xl font-semibold tabular-nums">
                {formatMatchScore(match.score)}
              </span>
              <span className="block text-xs text-stone-300 dark:text-stone-600">
                overall match
              </span>
            </p>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {match.categoryScores.map((categoryScore) => (
              <div
                key={categoryScore.category}
                className="rounded-sm border border-stone-300 px-3 py-3 dark:border-stone-700"
              >
                <dt className="text-xs text-stone-500 dark:text-stone-400">
                  {categoryLabels[categoryScore.category]}
                </dt>
                <dd className="mt-1 font-semibold tabular-nums">
                  {formatMatchScore(categoryScore.score)}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            {criterionCategories.map((category) => {
              const evaluations = match.evaluations.filter(
                (evaluation) => evaluation.category === category,
              );

              if (evaluations.length === 0) {
                return null;
              }

              return (
                <div
                  key={category}
                  className="grid gap-2 border-t border-stone-300 py-3 lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-8 dark:border-stone-700"
                >
                  <h4 className="pt-5 text-xs font-semibold tracking-[0.14em] text-stone-500 uppercase dark:text-stone-400">
                    {categoryLabels[category]}
                  </h4>
                  <div className="min-w-0 divide-y divide-stone-200 dark:divide-stone-800">
                    {evaluations.map((evaluation) => (
                      <CriterionVisualization
                        key={evaluation.criterionId}
                        evaluation={evaluation}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
