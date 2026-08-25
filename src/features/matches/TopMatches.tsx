import type { LocationMatch } from "../../types/match";
import { categoryLabels } from "../criteria/criterion-definitions";
import { formatMatchScore } from "./format-match";

type TopMatchesProps = Readonly<{
  matches: readonly LocationMatch[];
}>;

export function TopMatches({ matches }: TopMatchesProps) {
  return (
    <section aria-labelledby="matches-heading">
      <div className="border-b border-stone-300 pb-4 dark:border-stone-700">
        <p className="text-xs font-semibold tracking-[0.16em] text-cyan-700 uppercase dark:text-cyan-300">
          Qualified ranking
        </p>
        <h2 id="matches-heading" className="mt-2 text-2xl font-semibold tracking-tight">
          Top matches
        </h2>
      </div>

      <ol className="mt-5 space-y-3">
        {matches.map((match, index) => (
          <li key={match.location.id}>
            <article className="grid gap-5 rounded-sm border border-stone-300 bg-white/70 p-5 shadow-[0_1px_0_rgba(28,25,23,0.04)] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center dark:border-stone-700 dark:bg-stone-900/70">
              <p className="grid size-9 place-items-center rounded-full bg-stone-900 text-sm font-semibold text-stone-50 tabular-nums dark:bg-stone-100 dark:text-stone-950">
                <span className="sr-only">Rank </span>
                {index + 1}
              </p>

              <div>
                <h3 className="text-xl font-semibold tracking-tight">{match.location.name}</h3>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  {match.location.country}
                </p>
                <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {match.categoryScores.slice(0, 3).map((categoryScore) => (
                    <div key={categoryScore.category} className="flex items-baseline gap-2 text-sm">
                      <dt className="text-stone-500 dark:text-stone-400">
                        {categoryLabels[categoryScore.category]}
                      </dt>
                      <dd className="font-semibold tabular-nums">
                        {formatMatchScore(categoryScore.score)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <p className="border-t border-stone-200 pt-4 text-left sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6 sm:text-right dark:border-stone-700">
                <span className="block text-3xl font-semibold tracking-[-0.04em] tabular-nums">
                  {formatMatchScore(match.score)}
                </span>
                <span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">
                  overall match
                </span>
              </p>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
