import { describe, expect, it } from "vitest";
import {
  formatDaylightDuration,
  formatDaylightHours,
  formatTemperature,
} from "./climate-formatters";

describe("climate presentation formatting", () => {
  it("formats negative and decimal temperatures without unnecessary precision", () => {
    expect(formatTemperature(-8)).toBe("-8 °C");
    expect(formatTemperature(4.5)).toBe("4.5 °C");
    expect(formatTemperature(18)).toBe("18 °C");
  });

  it("formats daylight for compact axes and human-readable detail", () => {
    expect(formatDaylightHours(8)).toBe("8 h");
    expect(formatDaylightHours(4.5)).toBe("4.5 h");
    expect(formatDaylightDuration(8)).toBe("8 h");
    expect(formatDaylightDuration(4.5)).toBe("4 h 30 min");
  });
});
