import type { LocationMatch } from "../../types/match";
import { formatRequiredFailure } from "../criteria/format-criterion";

type ExcludedLocationsProps = Readonly<{
  matches: readonly LocationMatch[];
}>;

export function ExcludedLocations({ matches }: ExcludedLocationsProps) {
  return (
    <section
      aria-labelledby="excluded-heading"
      className="border-t border-stone-300 pt-8 dark:border-stone-700"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-amber-700 uppercase dark:text-amber-300">
          Required constraint
        </p>
        <h2 id="excluded-heading" className="mt-2 text-xl font-semibold tracking-tight">
          Excluded locations
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">
          These locations retain their evaluations, but cannot enter the qualified ranking.
        </p>
      </div>

      <ul className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {matches.map((match) => (
          <li key={match.location.id} className="border-l-2 border-amber-500/70 pl-4">
            <p className="font-medium">
              {match.location.name}, {match.location.country}
            </p>
            <ul className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-400">
              {match.failedRequiredCriteria.map((evaluation) => (
                <li key={evaluation.criterionId}>Excluded: {formatRequiredFailure(evaluation)}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
