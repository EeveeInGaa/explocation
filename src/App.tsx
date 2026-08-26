import { useMemo, useState } from "react";
import { defaultSearchProfile } from "./data/default-search-profile";
import { preparedPrototypeLocations } from "./data/locations";
import { CriteriaPanel } from "./features/criteria/CriteriaPanel";
import {
  changeConstraintType,
  changePriority,
  changeRange,
  changeThreshold,
  copySearchProfile,
} from "./features/criteria/update-search-profile";
import { LocationDetails } from "./features/location-details/LocationDetails";
import { LocationMap } from "./features/map/LocationMap";
import { ExcludedLocations } from "./features/matches/ExcludedLocations";
import { rankLocations } from "./features/matches/rank-locations";
import { TopMatches } from "./features/matches/TopMatches";
import type {
  ConfiguredCriterion,
  ConstraintType,
  CriterionId,
  CriterionPriority,
} from "./types/criterion";

function App() {
  const [configuredCriteria, setConfiguredCriteria] = useState<readonly ConfiguredCriterion[]>(() =>
    copySearchProfile(defaultSearchProfile),
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [editorVersion, setEditorVersion] = useState(0);
  const locationRanking = useMemo(
    () => rankLocations(preparedPrototypeLocations, configuredCriteria, 3),
    [configuredCriteria],
  );
  const allLocationMatches = useMemo(
    () => [...locationRanking.qualified, ...locationRanking.excluded],
    [locationRanking],
  );
  const selectedMatch =
    selectedLocationId === null
      ? null
      : (locationRanking.qualified.find((match) => match.location.id === selectedLocationId) ??
        locationRanking.excluded.find((match) => match.location.id === selectedLocationId) ??
        null);

  function handleConstraintTypeChange(criterionId: CriterionId, constraintType: ConstraintType) {
    setConfiguredCriteria((currentProfile) =>
      changeConstraintType(currentProfile, criterionId, constraintType),
    );
  }

  function handleThresholdChange(criterionId: CriterionId, threshold: number) {
    setConfiguredCriteria((currentProfile) =>
      changeThreshold(currentProfile, criterionId, threshold),
    );
  }

  function handleRangeChange(criterionId: CriterionId, minimum: number, maximum: number) {
    setConfiguredCriteria((currentProfile) =>
      changeRange(currentProfile, criterionId, minimum, maximum),
    );
  }

  function handlePriorityChange(criterionId: CriterionId, priority: CriterionPriority) {
    setConfiguredCriteria((currentProfile) =>
      changePriority(currentProfile, criterionId, priority),
    );
  }

  function handleReset() {
    setConfiguredCriteria(copySearchProfile(defaultSearchProfile));
    setSelectedLocationId(null);
    setEditorVersion((currentVersion) => currentVersion + 1);
  }

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8 text-stone-950 sm:px-8 sm:py-12 dark:bg-stone-950 dark:text-stone-50">
      <div className="mx-auto w-full max-w-7xl">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-lime-700 uppercase dark:text-lime-300">
            Interactive prototype
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
            Explocation
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600 sm:text-xl dark:text-stone-300">
            Find places that fit how you want to live.
          </p>
        </header>

        <p className="mt-7 max-w-3xl border-l-2 border-amber-600 pl-4 text-sm leading-6 text-stone-600 dark:border-amber-300 dark:text-stone-400">
          Location metrics are prepared prototype values for testing the model, not verified
          real-world measurements.
        </p>

        <div className="mt-12">
          <TopMatches
            matches={locationRanking.topMatches}
            qualifiedCount={locationRanking.qualified.length}
            totalCount={preparedPrototypeLocations.length}
            selectedLocationId={selectedLocationId}
            onSelect={setSelectedLocationId}
          />
        </div>

        <div className="mt-12 grid gap-10 xl:grid-cols-[minmax(21rem,0.64fr)_minmax(0,1.5fr)] xl:items-start">
          <div className="rounded-sm border border-stone-300 bg-stone-50 p-5 sm:p-6 dark:border-stone-700 dark:bg-stone-900/40">
            <CriteriaPanel
              key={editorVersion}
              criteria={configuredCriteria}
              onConstraintTypeChange={handleConstraintTypeChange}
              onThresholdChange={handleThresholdChange}
              onRangeChange={handleRangeChange}
              onPriorityChange={handlePriorityChange}
              onReset={handleReset}
            />
          </div>

          <LocationMap
            matches={allLocationMatches}
            topMatches={locationRanking.topMatches}
            selectedLocationId={selectedLocationId}
            onSelect={setSelectedLocationId}
          />
        </div>

        <div className="mt-14 space-y-14">
          <LocationDetails match={selectedMatch} />
          <ExcludedLocations matches={locationRanking.excluded} />
        </div>
      </div>
    </main>
  );
}

export default App;
