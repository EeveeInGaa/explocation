/**
 * OpenFreeMap's public Positron style is suitable for this prototype and needs no API key.
 * Keep the URL isolated because a production deployment may require a provider with an SLA or
 * self-hosted tiles. Attribution is supplied by the style and rendered by MapLibre.
 */
export const basemapStyleUrl = "https://tiles.openfreemap.org/styles/positron";

export const mapFallbackView = {
  center: [12, 56] as [longitude: number, latitude: number],
  zoom: 2.5,
} as const;
