import { defaultSearchProfile } from "./data/default-search-profile";
import { preparedPrototypeLocations } from "./data/locations";
import { CriteriaSummary } from "./features/criteria/CriteriaSummary";
import { ExcludedLocations } from "./features/matches/ExcludedLocations";
import { rankLocations } from "./features/matches/rank-locations";
import { TopMatches } from "./features/matches/TopMatches";

const locationRanking = rankLocations(preparedPrototypeLocations, defaultSearchProfile, 3);

function App() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-stone-50 px-5 py-10 text-stone-950 sm:px-8 sm:py-14 dark:bg-stone-950 dark:text-stone-50">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_8%,rgba(132,204,22,0.12),transparent_24%),radial-gradient(circle_at_88%_40%,rgba(14,116,144,0.09),transparent_28%)] dark:bg-[radial-gradient(circle_at_12%_8%,rgba(132,204,22,0.08),transparent_24%),radial-gradient(circle_at_88%_40%,rgba(34,211,238,0.06),transparent_28%)]"
      />

      <div className="mx-auto w-full max-w-6xl">
        <header className="max-w-3xl border-l-2 border-lime-500 pl-6 sm:pl-8 dark:border-lime-400">
          <p className="text-xs font-semibold tracking-[0.18em] text-stone-600 uppercase dark:text-stone-300">
            Prototype model · Stage 2
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.045em] sm:text-7xl">
            Explocation
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600 sm:text-xl dark:text-stone-300">
            A first explainable ranking of places against adaptable lifestyle preferences.
          </p>
        </header>

        <p className="mt-8 max-w-3xl rounded-sm border border-amber-600/30 bg-amber-50/70 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-300/20 dark:bg-amber-950/20 dark:text-amber-100">
          Location metrics are prepared prototype values for testing the model, not verified
          real-world measurements.
        </p>

        <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.5fr)] lg:items-start">
          <CriteriaSummary criteria={defaultSearchProfile} />
          <TopMatches matches={locationRanking.topMatches} />
        </div>

        <div className="mt-16">
          <ExcludedLocations matches={locationRanking.excluded} />
        </div>
      </div>
    </main>
  );
}

export default App;
