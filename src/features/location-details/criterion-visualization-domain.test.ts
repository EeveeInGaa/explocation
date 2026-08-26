import { describe, expect, it } from "vitest";
import { deriveVisualizationDomain, getPreferredInterval } from "./criterion-visualization-domain";

describe("criterion visualization domains", () => {
  it.each([
    {
      label: "maximum with an actual value below its threshold",
      actual: 0.4,
      constraint: { type: "maximum", threshold: 1 } as const,
    },
    {
      label: "maximum with an actual value above its threshold",
      actual: 4.5,
      constraint: { type: "maximum", threshold: 3 } as const,
    },
    {
      label: "minimum with a large actual value",
      actual: 280,
      constraint: { type: "minimum", threshold: 100 } as const,
    },
    {
      label: "range with an actual value inside",
      actual: 17,
      constraint: { type: "range", minimum: 14, maximum: 20 } as const,
    },
  ])("contains every relevant value for $label", ({ actual, constraint }) => {
    const [minimum, maximum] = deriveVisualizationDomain(actual, constraint, "kilometers");
    const constraintValues =
      constraint.type === "range"
        ? [constraint.minimum, constraint.maximum]
        : [constraint.threshold];

    expect(minimum).toBeLessThanOrEqual(Math.min(actual, ...constraintValues));
    expect(maximum).toBeGreaterThan(Math.max(actual, ...constraintValues));
  });

  it("keeps zero as the lower bound for distance values", () => {
    expect(deriveVisualizationDomain(0, { type: "maximum", threshold: 0 }, "kilometers")[0]).toBe(
      0,
    );
  });

  it("pads an actual value exactly on its threshold", () => {
    const domain = deriveVisualizationDomain(10, { type: "maximum", threshold: 10 }, "kilometers");

    expect(domain[0]).toBe(0);
    expect(domain[1]).toBeGreaterThan(10);
  });

  it("allows negative temperature domains", () => {
    const domain = deriveVisualizationDomain(
      -8,
      { type: "range", minimum: -5, maximum: 2 },
      "degreesCelsius",
    );

    expect(domain[0]).toBeLessThan(-8);
    expect(domain[1]).toBeGreaterThan(2);
  });

  it("retains visible context for a very narrow range", () => {
    const [minimum, maximum] = deriveVisualizationDomain(
      14.05,
      { type: "range", minimum: 14, maximum: 14.1 },
      "degreesCelsius",
    );

    expect(maximum - minimum).toBeGreaterThan(1);
  });

  it.each([
    { label: "below", actual: 8 },
    { label: "above", actual: 24 },
  ])("expands a range domain when the actual value is $label", ({ actual }) => {
    const [minimum, maximum] = deriveVisualizationDomain(
      actual,
      { type: "range", minimum: 14, maximum: 20 },
      "degreesCelsius",
    );

    expect(minimum).toBeLessThan(Math.min(actual, 14));
    expect(maximum).toBeGreaterThan(Math.max(actual, 20));
  });

  it("derives the preferred interval from each constraint discriminant", () => {
    const domain = [0, 200] as const;

    expect(getPreferredInterval({ type: "maximum", threshold: 20 }, domain)).toEqual([0, 20]);
    expect(getPreferredInterval({ type: "minimum", threshold: 100 }, domain)).toEqual([100, 200]);
    expect(getPreferredInterval({ type: "range", minimum: 14, maximum: 20 }, domain)).toEqual([
      14, 20,
    ]);
  });
});
