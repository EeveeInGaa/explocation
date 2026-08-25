import type { Location } from "../types/location";

/**
 * Coordinates identify real settlements. Metric values are hand-prepared prototype inputs for
 * exercising the matching model; they are not verified measurements and must not be presented as
 * authoritative location data. A later data pipeline will replace them.
 */
export const preparedPrototypeLocations = [
  {
    id: "vik-is",
    name: "Vík",
    country: "Iceland",
    coordinates: { latitude: 63.419, longitude: -19.01 },
    metrics: {
      forestDistance: 18,
      waterDistance: 0.3,
      hikingTrailDistance: 0.4,
      groceryDistance: 1,
      airportDistance: 190,
      summerAverageTemperature: 11,
    },
  },
  {
    id: "kilpisjarvi-fi",
    name: "Kilpisjärvi",
    country: "Finland",
    coordinates: { latitude: 69.0484, longitude: 20.7985 },
    metrics: {
      forestDistance: 0.4,
      waterDistance: 0.2,
      hikingTrailDistance: 0.1,
      groceryDistance: 0.8,
      airportDistance: 115,
      summerAverageTemperature: 11,
    },
  },
  {
    id: "bialowieza-pl",
    name: "Białowieża",
    country: "Poland",
    coordinates: { latitude: 52.7019, longitude: 23.8669 },
    metrics: {
      forestDistance: 0.1,
      waterDistance: 4.5,
      hikingTrailDistance: 0.2,
      groceryDistance: 1.2,
      airportDistance: 180,
      summerAverageTemperature: 19.5,
    },
  },
  {
    id: "hanko-fi",
    name: "Hanko",
    country: "Finland",
    coordinates: { latitude: 59.823, longitude: 22.969 },
    metrics: {
      forestDistance: 0.8,
      waterDistance: 0.1,
      hikingTrailDistance: 1.4,
      groceryDistance: 0.7,
      airportDistance: 120,
      summerAverageTemperature: 17.5,
    },
  },
  {
    id: "geiranger-no",
    name: "Geiranger",
    country: "Norway",
    coordinates: { latitude: 62.1015, longitude: 7.2058 },
    metrics: {
      forestDistance: 0.2,
      waterDistance: 0.1,
      hikingTrailDistance: 0.2,
      groceryDistance: 18,
      airportDistance: 65,
      summerAverageTemperature: 13.5,
    },
  },
  {
    id: "abisko-se",
    name: "Abisko",
    country: "Sweden",
    coordinates: { latitude: 68.3495, longitude: 18.8312 },
    metrics: {
      forestDistance: 0.5,
      waterDistance: 1.1,
      hikingTrailDistance: 0.1,
      groceryDistance: 90,
      airportDistance: 85,
      summerAverageTemperature: 11.5,
    },
  },
  {
    id: "are-se",
    name: "Åre",
    country: "Sweden",
    coordinates: { latitude: 63.399, longitude: 13.081 },
    metrics: {
      forestDistance: 0.3,
      waterDistance: 0.6,
      hikingTrailDistance: 0.2,
      groceryDistance: 0.9,
      airportDistance: 75,
      summerAverageTemperature: 13,
    },
  },
  {
    id: "cesky-krumlov-cz",
    name: "Český Krumlov",
    country: "Czechia",
    coordinates: { latitude: 48.8109, longitude: 14.3152 },
    metrics: {
      forestDistance: 1.3,
      waterDistance: 0.1,
      hikingTrailDistance: 2.5,
      groceryDistance: 0.5,
      airportDistance: 65,
      summerAverageTemperature: 19.5,
    },
  },
  {
    id: "luneburg-de",
    name: "Lüneburg",
    country: "Germany",
    coordinates: { latitude: 53.2464, longitude: 10.4115 },
    metrics: {
      forestDistance: 4,
      waterDistance: 0.8,
      hikingTrailDistance: 4,
      groceryDistance: 0.4,
      airportDistance: 55,
      summerAverageTemperature: 20.5,
    },
  },
  {
    id: "koli-fi",
    name: "Koli",
    country: "Finland",
    coordinates: { latitude: 63.096, longitude: 29.806 },
    metrics: {
      forestDistance: 0.1,
      waterDistance: 0.2,
      hikingTrailDistance: 0.1,
      groceryDistance: 22,
      airportDistance: 60,
      summerAverageTemperature: 15,
    },
  },
] as const satisfies readonly Location[];
