import { describe, expect, it } from "vitest";
import type { ConfiguredCriterion, NumericConstraint } from "../../types/criterion";
import { criterionDefinitions } from "../criteria/criterion-definitions";
import { calculateCriterionScore, evaluateCriterion } from "./evaluate-criterion";

describe("maximum constraints", () => {
  const constraint = { type: "maximum", threshold: 10 } as const;

  it("scores a value well below the threshold as a perfect match", () => {
    expect(calculateCriterionScore(0, constraint)).toBe(1);
  });

  it("includes the threshold and gives it a boundary score", () => {
    const evaluation = evaluateCriterion(
      criterionDefinitions.forestDistance,
      { criterionId: "forestDistance", priority: "preferred", constraint },
      10,
    );

    expect(evaluation.satisfied).toBe(true);
    expect(evaluation.score).toBe(0.5);
  });

  it("progressively lowers the score above the threshold", () => {
    const evaluation = evaluateCriterion(
      criterionDefinitions.forestDistance,
      { criterionId: "forestDistance", priority: "preferred", constraint },
      15,
    );

    expect(evaluation.satisfied).toBe(false);
    expect(evaluation.score).toBe(0.25);
  });
});

describe("minimum constraints", () => {
  const constraint = { type: "minimum", threshold: 100 } as const;

  it("scores a value well above the threshold as a perfect match", () => {
    expect(calculateCriterionScore(200, constraint)).toBe(1);
  });

  it("includes the threshold and gives it a boundary score", () => {
    const evaluation = evaluateCriterion(
      criterionDefinitions.airportDistance,
      { criterionId: "airportDistance", priority: "required", constraint },
      100,
    );

    expect(evaluation.satisfied).toBe(true);
    expect(evaluation.score).toBe(0.5);
  });

  it("progressively lowers the score below the threshold", () => {
    const evaluation = evaluateCriterion(
      criterionDefinitions.airportDistance,
      { criterionId: "airportDistance", priority: "required", constraint },
      50,
    );

    expect(evaluation.satisfied).toBe(false);
    expect(evaluation.score).toBe(0.25);
  });
});

describe("range constraints", () => {
  const constraint = { type: "range", minimum: 14, maximum: 20 } as const;

  it.each([
    { label: "below", value: 11, satisfied: false, score: 0 },
    { label: "at the lower boundary", value: 14, satisfied: true, score: 0.5 },
    { label: "inside at the center", value: 17, satisfied: true, score: 1 },
    { label: "at the upper boundary", value: 20, satisfied: true, score: 0.5 },
    { label: "above", value: 23, satisfied: false, score: 0 },
  ])("scores a value $label", ({ value, satisfied, score }) => {
    const evaluation = evaluateCriterion(
      criterionDefinitions.summerAverageTemperature,
      {
        criterionId: "summerAverageTemperature",
        priority: "niceToHave",
        constraint,
      },
      value,
    );

    expect(evaluation.satisfied).toBe(satisfied);
    expect(evaluation.score).toBe(score);
  });
});

describe("configurable constraint direction", () => {
  const configurations: readonly Readonly<{
    constraint: NumericConstraint;
    satisfied: boolean;
    score: number;
  }>[] = [
    {
      constraint: { type: "maximum", threshold: 10 },
      satisfied: true,
      score: 0.75,
    },
    {
      constraint: { type: "minimum", threshold: 10 },
      satisfied: false,
      score: 0.25,
    },
    {
      constraint: { type: "range", minimum: 4, maximum: 6 },
      satisfied: true,
      score: 1,
    },
  ];

  it.each(configurations)(
    "evaluates forest distance as $constraint.type without engine changes",
    ({ constraint, satisfied, score }) => {
      const configured: ConfiguredCriterion = {
        criterionId: "forestDistance",
        priority: "preferred",
        constraint,
      };
      const evaluation = evaluateCriterion(criterionDefinitions.forestDistance, configured, 5);

      expect(evaluation.constraint.type).toBe(constraint.type);
      expect(evaluation.satisfied).toBe(satisfied);
      expect(evaluation.score).toBe(score);
    },
  );
});
