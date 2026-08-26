import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { criterionDefinitions } from "../criteria/criterion-definitions";
import { evaluateCriterion } from "../matches/evaluate-criterion";
import { CriterionVisualization } from "./CriterionVisualization";

describe("CriterionVisualization", () => {
  it("renders a maximum preference with its actual value and accessible state", () => {
    const evaluation = evaluateCriterion(
      criterionDefinitions.forestDistance,
      {
        criterionId: "forestDistance",
        priority: "important",
        constraint: { type: "maximum", threshold: 1 },
      },
      0.8,
    );

    render(<CriterionVisualization evaluation={evaluation} />);

    expect(screen.getByRole("heading", { level: 5, name: "Distance to forest" })).toBeVisible();
    expect(screen.getByText("At most 1 km")).toBeVisible();
    expect(screen.getByText("Satisfied")).toBeVisible();
    expect(screen.getByText("Important")).toBeVisible();
    expect(screen.getByText(/Actual value 0.8 kilometers/)).toBeInTheDocument();
  });

  it("renders a failed required minimum and explains its exclusion effect", () => {
    const evaluation = evaluateCriterion(
      criterionDefinitions.airportDistance,
      {
        criterionId: "airportDistance",
        priority: "required",
        constraint: { type: "minimum", threshold: 100 },
      },
      50,
    );

    render(<CriterionVisualization evaluation={evaluation} />);

    expect(screen.getByText("At least 100 km")).toBeVisible();
    expect(screen.getByText("Not satisfied")).toBeVisible();
    expect(screen.getByText("Required")).toBeVisible();
    expect(
      screen.getByText("Required condition failed — this location is excluded."),
    ).toBeVisible();
  });

  it("renders both boundaries of a range preference", () => {
    const evaluation = evaluateCriterion(
      criterionDefinitions.summerAverageTemperature,
      {
        criterionId: "summerAverageTemperature",
        priority: "niceToHave",
        constraint: { type: "range", minimum: 14, maximum: 20 },
      },
      17,
    );

    render(<CriterionVisualization evaluation={evaluation} />);

    expect(screen.getByText("Between 14 °C and 20 °C")).toBeVisible();
    expect(screen.getByText("17 °C", { selector: "span" })).toBeVisible();
    expect(screen.getByText("100% match")).toBeVisible();
    expect(screen.getByText(/Preference Between 14 °C and 20 °C/)).toBeInTheDocument();
  });
});
