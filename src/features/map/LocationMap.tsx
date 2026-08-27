import {
  GeoJSONSource,
  LngLatBounds,
  type MapLayerMouseEvent,
  Map as MapLibreMap,
  NavigationControl,
  ScaleControl,
  setWorkerUrl,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import mapWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LocationMatch } from "../../types/match";
import {
  type LocationMapFeatureCollection,
  toLocationMapFeatureCollection,
} from "./location-map-adapter";
import { basemapStyleUrl, mapFallbackView } from "./map-config";

setWorkerUrl(mapWorkerUrl);

const locationSourceId = "explocation-locations";
const locationHitAreaLayerId = "explocation-location-hit-areas";
const selectedHaloLayerId = "explocation-selected-halo";
const locationCircleLayerId = "explocation-location-circles";
const rankLabelLayerId = "explocation-rank-labels";
const locationNameLayerId = "explocation-location-names";

export type LocationMapProps = Readonly<{
  matches: readonly LocationMatch[];
  topMatches: readonly LocationMatch[];
  selectedLocationId: string | null;
  hasActiveCriteria: boolean;
  onSelect: (locationId: string) => void;
}>;

function fitMapToLocations(
  map: MapLibreMap,
  featureCollection: LocationMapFeatureCollection,
): void {
  const [onlyFeature] = featureCollection.features;

  if (featureCollection.features.length === 0 || onlyFeature === undefined) {
    return;
  }

  if (featureCollection.features.length === 1) {
    map.jumpTo({ center: onlyFeature.geometry.coordinates, zoom: 7 });
    return;
  }

  const bounds = new LngLatBounds();
  for (const feature of featureCollection.features) {
    bounds.extend(feature.geometry.coordinates);
  }

  map.fitBounds(bounds, {
    duration: 0,
    maxZoom: 7,
    padding: { top: 64, right: 48, bottom: 64, left: 48 },
  });
}

function addLocationLayers(
  map: MapLibreMap,
  featureCollection: LocationMapFeatureCollection,
): void {
  map.addSource(locationSourceId, {
    type: "geojson",
    data: featureCollection,
  });

  // Keep the visible markers restrained while giving every point a reliable
  // 44 px click and touch target. The near-transparent layer remains queryable
  // by MapLibre without changing the marker presentation.
  map.addLayer({
    id: locationHitAreaLayerId,
    type: "circle",
    source: locationSourceId,
    paint: {
      "circle-color": "#ffffff",
      "circle-opacity": 0.01,
      "circle-radius": 22,
    },
  });

  map.addLayer({
    id: selectedHaloLayerId,
    type: "circle",
    source: locationSourceId,
    filter: ["==", ["get", "selected"], true],
    paint: {
      "circle-color": "rgba(255, 255, 255, 0.15)",
      "circle-radius": 17,
      "circle-stroke-color": "#0f172a",
      "circle-stroke-width": 3,
    },
  });

  map.addLayer({
    id: locationCircleLayerId,
    type: "circle",
    source: locationSourceId,
    paint: {
      "circle-color": [
        "case",
        ["==", ["get", "searchActive"], false],
        "#78716c",
        ["get", "selected"],
        "#f59e0b",
        [">", ["get", "rank"], 0],
        "#0e7490",
        ["get", "qualified"],
        "#4d7c0f",
        "#78716c",
      ],
      "circle-opacity": [
        "case",
        ["==", ["get", "searchActive"], false],
        0.72,
        ["get", "selected"],
        1,
        ["get", "qualified"],
        0.94,
        0.42,
      ],
      "circle-radius": [
        "case",
        ["get", "selected"],
        12,
        ["==", ["get", "searchActive"], false],
        6,
        ["boolean", ["feature-state", "hover"], false],
        11,
        [">", ["get", "rank"], 0],
        10,
        ["get", "qualified"],
        7,
        5,
      ],
      "circle-stroke-color": "#ffffff",
      "circle-stroke-opacity": ["case", ["get", "selected"], 1, ["get", "qualified"], 1, 0.72],
      "circle-stroke-width": ["case", ["get", "selected"], 3, [">", ["get", "rank"], 0], 2.5, 1.5],
    },
  });

  map.addLayer({
    id: rankLabelLayerId,
    type: "symbol",
    source: locationSourceId,
    filter: [">", ["get", "rank"], 0],
    layout: {
      "text-allow-overlap": true,
      "text-field": ["to-string", ["get", "rank"]],
      "text-font": ["Noto Sans Regular"],
      "text-size": 11,
    },
    paint: {
      "text-color": ["case", ["get", "selected"], "#1c1917", "#ffffff"],
    },
  });

  map.addLayer({
    id: locationNameLayerId,
    type: "symbol",
    source: locationSourceId,
    layout: {
      "text-allow-overlap": true,
      "text-field": ["get", "name"],
      "text-font": ["Noto Sans Regular"],
      "text-ignore-placement": true,
      "text-offset": [0, 1.7],
      "text-size": 12,
    },
    paint: {
      "text-color": "#1c1917",
      "text-halo-color": "rgba(255, 255, 255, 0.92)",
      "text-halo-width": 1.5,
      "text-opacity": [
        "case",
        ["any", ["get", "selected"], ["boolean", ["feature-state", "hover"], false]],
        1,
        0,
      ],
    },
  });
}

function getFeatureId(event: MapLayerMouseEvent): string | null {
  const feature = event.features?.[0];
  const propertyId: unknown = feature?.properties.id;

  // The application ID is an explicit map property and therefore the stable
  // boundary back into React. MapLibre may omit or normalize the GeoJSON-level
  // feature ID in a rendered event, so use it only as a fallback.
  if (typeof propertyId === "string") {
    return propertyId;
  }

  const featureId: unknown = feature?.id;
  return typeof featureId === "string" ? featureId : null;
}

export function LocationMap({
  matches,
  topMatches,
  selectedLocationId,
  hasActiveCriteria,
  onSelect,
}: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onSelectRef = useRef(onSelect);
  const hoveredLocationIdRef = useRef<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const featureCollection = useMemo(
    () =>
      toLocationMapFeatureCollection(matches, topMatches, selectedLocationId, hasActiveCriteria),
    [matches, topMatches, selectedLocationId, hasActiveCriteria],
  );
  const latestFeatureCollectionRef = useRef(featureCollection);
  latestFeatureCollectionRef.current = featureCollection;
  onSelectRef.current = onSelect;

  useEffect(() => {
    const container = containerRef.current;

    if (container === null) {
      return;
    }

    const map = new MapLibreMap({
      attributionControl: { compact: true },
      center: mapFallbackView.center,
      cooperativeGestures: true,
      container,
      style: basemapStyleUrl,
      zoom: mapFallbackView.zoom,
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new ScaleControl({ maxWidth: 96, unit: "metric" }), "bottom-left");

    function handleLoad() {
      const currentFeatureCollection = latestFeatureCollectionRef.current;
      addLocationLayers(map, currentFeatureCollection);
      fitMapToLocations(map, currentFeatureCollection);
      setIsMapReady(true);
    }

    function handleLocationClick(event: MapLayerMouseEvent) {
      const featureId = getFeatureId(event);
      if (featureId !== null) {
        onSelectRef.current(featureId);
      }
    }

    function handleLocationEnter(event: MapLayerMouseEvent) {
      const featureId = getFeatureId(event);
      map.getCanvas().style.cursor = "pointer";

      if (featureId === null || featureId === hoveredLocationIdRef.current) {
        return;
      }

      if (hoveredLocationIdRef.current !== null) {
        map.setFeatureState(
          { id: hoveredLocationIdRef.current, source: locationSourceId },
          { hover: false },
        );
      }

      hoveredLocationIdRef.current = featureId;
      map.setFeatureState({ id: featureId, source: locationSourceId }, { hover: true });
    }

    function handleLocationLeave() {
      map.getCanvas().style.cursor = "";

      if (hoveredLocationIdRef.current !== null) {
        map.setFeatureState(
          { id: hoveredLocationIdRef.current, source: locationSourceId },
          { hover: false },
        );
        hoveredLocationIdRef.current = null;
      }
    }

    map.on("load", handleLoad);
    map.on("click", locationHitAreaLayerId, handleLocationClick);
    map.on("mousemove", locationHitAreaLayerId, handleLocationEnter);
    map.on("mouseleave", locationHitAreaLayerId, handleLocationLeave);

    return () => {
      map.off("load", handleLoad);
      map.off("click", locationHitAreaLayerId, handleLocationClick);
      map.off("mousemove", locationHitAreaLayerId, handleLocationEnter);
      map.off("mouseleave", locationHitAreaLayerId, handleLocationLeave);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const source = mapRef.current?.getSource(locationSourceId);
    if (source instanceof GeoJSONSource) {
      void source.setData(featureCollection);
    }
  }, [featureCollection]);

  useEffect(() => {
    const map = mapRef.current;
    if (map === null || selectedLocationId === null) {
      return;
    }

    const selectedFeature = latestFeatureCollectionRef.current.features.find(
      (feature) => feature.id === selectedLocationId,
    );
    if (selectedFeature === undefined) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.easeTo({
      center: selectedFeature.geometry.coordinates,
      duration: reducedMotion ? 0 : 550,
      essential: false,
      zoom: Math.max(map.getZoom(), 5),
    });
  }, [selectedLocationId]);

  return (
    <section
      aria-labelledby="location-map-heading"
      aria-describedby="location-map-description"
      aria-busy={!isMapReady}
      className="min-w-0"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-cyan-700 uppercase dark:text-cyan-300">
            Geographic workspace
          </p>
          <h2 id="location-map-heading" className="mt-2 text-2xl font-semibold tracking-tight">
            Location map
          </h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            {isMapReady
              ? hasActiveCriteria
                ? `${matches.length} prepared locations · Select a point for details`
                : `${matches.length} prepared locations · Add criteria to rank`
              : "Loading map…"}
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-stone-600 dark:text-stone-300">
          {!hasActiveCriteria ? (
            <li className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-stone-500 opacity-70 ring-1 ring-white"
              />
              Prepared location — add criteria to rank
            </li>
          ) : (
            <>
              <li className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-3 rounded-full bg-cyan-700 ring-2 ring-white"
                />
                Top 3
              </li>
              <li className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full bg-lime-700 ring-1 ring-white"
                />
                Qualified
              </li>
              <li className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-stone-500 opacity-50 ring-1 ring-white"
                />
                Excluded
              </li>
              <li className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-3 rounded-full bg-amber-500 ring-2 ring-stone-900"
                />
                Selected
              </li>
            </>
          )}
        </ul>
      </div>

      <div
        ref={containerRef}
        className="h-112 w-full overflow-hidden rounded-sm border border-stone-400 bg-stone-200 shadow-[0_1px_0_rgba(28,25,23,0.08)] sm:h-144 dark:border-stone-600 dark:bg-stone-800"
      />
      <p id="location-map-description" className="sr-only">
        {hasActiveCriteria
          ? "Interactive map of all prepared prototype locations. Top matches, qualified locations, excluded locations, and the selected location use different sizes, outlines, labels, and emphasis. Select a point to show its location details. The same results remain available in the lists and details on this page."
          : "Neutral map of all prepared prototype locations. Add at least one criterion to calculate and rank matches."}
      </p>
    </section>
  );
}
