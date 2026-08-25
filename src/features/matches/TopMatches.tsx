import type { LocationMatch } from "../../types/match";
import { categoryLabels } from "../criteria/criterion-definitions";
import { formatMatchScore } from "./format-match";

type TopMatchesProps = Readonly<{
  matches: readonly LocationMatch[];
  qualifiedCount: number;
  totalCount: number;
  selectedLocationId: string | null;
  onSelect: (locationId: string) => void;
}>;

export function TopMatches({
  matches,
  qualifiedCount,
  totalCount,
  selectedLocationId,
  onSelect,
}: TopMatchesProps) {
  const topMatchNames = matches.map((match) => match.location.name).join(", ");

  return (
    <section aria-labelledby="matches-heading">
      <div className="flex items-end justify-between gap-5 border-b border-stone-300 pb-4 dark:border-stone-700">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-cyan-700 uppercase dark:text-cyan-300">
            Live ranking
          </p>
          <h2 id="matches-heading" className="mt-2 text-2xl font-semibold tracking-tight">
            Top matches
          </h2>
        </div>
        <p className="text-sm text-stone-500 tabular-nums dark:text-stone-400" aria-live="polite">
          {qualifiedCount} of {totalCount} qualify
          <span className="sr-only">. Top matches: {topMatchNames || "none"}.</span>
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-stone-400 bg-white/50 px-6 py-10 text-center dark:border-stone-600 dark:bg-stone-900/40">
          <h3 className="text-lg font-semibold">No locations match all required criteria.</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">
            Try relaxing one of your required preferences.
          </p>
        </div>
      ) : (
        <ol className="mt-5 space-y-3">
          {matches.map((match, index) => {
            const isSelected = match.location.id === selectedLocationId;

            return (
              <li key={match.location.id}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelect(match.location.id)}
                  className={`grid min-h-24 w-full gap-5 rounded-sm border bg-white p-5 text-left outline-none transition-colors sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center dark:bg-stone-900 ${
                    isSelected
                      ? "border-cyan-700 ring-2 ring-cyan-700/20 dark:border-cyan-300 dark:ring-cyan-300/20"
                      : "border-stone-300 hover:border-stone-500 focus-visible:border-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-700/30 dark:border-stone-700 dark:hover:border-stone-500 dark:focus-visible:border-cyan-300 dark:focus-visible:ring-cyan-300/30"
                  }`}
                >
                  <span className="grid size-9 place-items-center rounded-full bg-stone-900 text-sm font-semibold text-stone-50 tabular-nums dark:bg-stone-100 dark:text-stone-950">
                    <span className="sr-only">Rank </span>
                    {index + 1}
                  </span>

                  <span className="min-w-0">
                    <span className="block text-xl font-semibold tracking-tight">
                      {match.location.name}
                    </span>
                    <span className="mt-1 block text-sm text-stone-500 dark:text-stone-400">
                      {match.location.country}
                    </span>
                    <span className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                      {match.categoryScores.slice(0, 3).map((categoryScore) => (
                        <span
                          key={categoryScore.category}
                          className="flex items-baseline gap-2 text-sm"
                        >
                          <span className="text-stone-500 dark:text-stone-400">
                            {categoryLabels[categoryScore.category]}
                          </span>
                          <span className="font-semibold tabular-nums">
                            {formatMatchScore(categoryScore.score)}
                          </span>
                        </span>
                      ))}
                    </span>
                  </span>

                  <span className="border-t border-stone-200 pt-4 text-left sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6 sm:text-right dark:border-stone-700">
                    <span className="block text-3xl font-semibold tracking-[-0.04em] tabular-nums">
                      {formatMatchScore(match.score)}
                    </span>
                    <span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">
                      overall match
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
