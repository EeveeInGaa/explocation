import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { LocationMapProps } from "./features/map/LocationMap";

vi.mock("./features/map/LocationMap", () => ({
  LocationMap: ({ matches, selectedLocationId, onSelect }: LocationMapProps) => {
    const mapLocation = matches.find((match) => match.location.id === "geiranger-no");

    return (
      <section aria-label="Location map">
        <p>Selected on map: {selectedLocationId ?? "none"}</p>
        <p>{matches.filter((match) => !match.qualified).length} excluded map locations</p>
        {mapLocation === undefined ? null : (
          <button type="button" onClick={() => onSelect(mapLocation.location.id)}>
            Select Geiranger from map
          </button>
        )}
      </section>
    );
  },
}));

import App from "./App";

function getCriterionGroup(name: string) {
  return screen.getByRole("group", { name });
}

function addCriterion(name: RegExp) {
  fireEvent.click(screen.getByRole("button", { name: "Add criterion" }));
  fireEvent.click(screen.getByRole("button", { name }));
}

describe("App", () => {
  it("starts with an empty profile and invites the user to add criteria", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 1, name: "Explocation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Criteria" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Top matches" })).toBeInTheDocument();
    expect(screen.getByText("Start by adding the things that matter to you.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Add criterion" })).toBeVisible();
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Ranked top matches" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("switch", { name: /Prioritize complete matches/ }),
    ).not.toBeInTheDocument();
  });

  it("can enable complete-match prioritization", () => {
    render(<App />);

    addCriterion(/Distance to forest/);

    const completeMatchesSwitch = screen.getByRole("switch", {
      name: /Prioritize complete matches/,
    });
    fireEvent.click(completeMatchesSwitch);

    expect(completeMatchesSwitch).toBeChecked();
  });

  it("opens a grouped picker that excludes active criteria", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Add criterion" }));

    expect(
      screen.getByRole("heading", { level: 3, name: "Choose what matters to you" }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { level: 4, name: "Nature" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 4, name: "Outdoor" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 4, name: "Services" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 4, name: "Mobility" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 4, name: "Climate" })).toBeVisible();
    expect(screen.getByRole("button", { name: /Distance to forest/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /Distance to water/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /Distance to hiking trail/ })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /Distance to forest/ }));
    fireEvent.click(screen.getByRole("button", { name: "Add criterion" }));
    expect(screen.queryByRole("button", { name: /Distance to forest/ })).not.toBeInTheDocument();
  });

  it("adds and removes a criterion without resetting existing configuration", () => {
    render(<App />);

    addCriterion(/Distance to airport/);
    const airport = getCriterionGroup("Airport");
    fireEvent.change(within(airport).getByLabelText("Value"), { target: { value: "150" } });
    fireEvent.change(within(airport).getByLabelText("Priority"), {
      target: { value: "required" },
    });
    addCriterion(/Distance to water/);

    expect(getCriterionGroup("Water")).toBeVisible();
    expect(within(getCriterionGroup("Airport")).getByLabelText("Value")).toHaveValue(150);
    expect(within(getCriterionGroup("Airport")).getByLabelText("Priority")).toHaveValue("required");

    fireEvent.click(screen.getByRole("button", { name: "Add criterion" }));
    expect(screen.queryByRole("button", { name: /Distance to water/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add criterion" }));

    fireEvent.click(screen.getByRole("button", { name: "Remove Water criterion" }));
    expect(screen.queryByRole("group", { name: "Water" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add criterion" }));
    expect(screen.getByRole("button", { name: /Distance to water/ })).toBeVisible();
  });

  it("updates matches when a criterion is added", () => {
    render(<App />);

    addCriterion(/Distance to forest/);
    const initialRanking = screen.getByRole("list", { name: "Ranked top matches" }).textContent;
    addCriterion(/Distance to water/);

    expect(screen.getByRole("list", { name: "Ranked top matches" }).textContent).not.toBe(
      initialRanking,
    );
  });

  it("updates results when a maximum value changes", () => {
    render(<App />);

    addCriterion(/Distance to forest/);
    fireEvent.click(screen.getByRole("button", { name: /Białowieża/ }));
    const forest = getCriterionGroup("Forest");
    const valueInput = within(forest).getByLabelText("Value");
    const initialMatchText = screen.getByRole("button", { name: /Białowieża/ }).textContent;
    fireEvent.change(valueInput, { target: { value: "0.1" } });

    expect(valueInput).toHaveValue(0.1);
    expect(screen.getByRole("button", { name: /Białowieża/ }).textContent).not.toBe(
      initialMatchText,
    );
    expect(screen.getByText("At most 0.1 km")).toBeVisible();
  });

  it("supports changing the same criterion to minimum and range constraints", () => {
    render(<App />);

    addCriterion(/Distance to forest/);
    fireEvent.click(screen.getByRole("button", { name: /Białowieża/ }));
    const forest = getCriterionGroup("Forest");
    const preferenceSelect = within(forest).getByLabelText("Preference");
    fireEvent.change(preferenceSelect, { target: { value: "minimum" } });

    const minimumForest = getCriterionGroup("Forest");
    const minimumSelect = within(minimumForest).getByLabelText("Preference");
    expect(minimumSelect).toHaveValue("minimum");
    expect(within(minimumForest).getByLabelText("Value")).toBeInTheDocument();
    expect(screen.getByText("At least 1 km")).toBeVisible();

    fireEvent.change(minimumSelect, { target: { value: "range" } });

    const rangeForest = getCriterionGroup("Forest");
    expect(within(rangeForest).getByLabelText("Preference")).toHaveValue("range");
    expect(within(rangeForest).getByLabelText("From")).toBeInTheDocument();
    expect(within(rangeForest).getByLabelText("To")).toBeInTheDocument();
    expect(within(rangeForest).queryByLabelText("Value")).not.toBeInTheDocument();
    expect(screen.getByText("Between 1 km and 1 km")).toBeVisible();
  });

  it("applies required priority changes to qualification", () => {
    render(<App />);

    addCriterion(/Distance to forest/);
    const forest = getCriterionGroup("Forest");
    fireEvent.change(within(forest).getByLabelText("Priority"), {
      target: { value: "required" },
    });

    expect(screen.getByText("Vík, Iceland")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Vík/ })).not.toBeInTheDocument();
  });

  it("offers every supported priority", () => {
    render(<App />);

    addCriterion(/Distance to forest/);
    const prioritySelect = within(getCriterionGroup("Forest")).getByLabelText("Priority");
    for (const priority of ["required", "important", "preferred", "niceToHave"]) {
      fireEvent.change(prioritySelect, { target: { value: priority } });
      expect(prioritySelect).toHaveValue(priority);
    }
  });

  it("keeps invalid drafts away from the matching engine", () => {
    render(<App />);

    addCriterion(/Distance to airport/);
    const airport = getCriterionGroup("Airport");
    const valueInput = within(airport).getByLabelText("Value");
    fireEvent.change(valueInput, { target: { value: "" } });
    fireEvent.blur(valueInput);

    expect(screen.getByText("Enter a finite number.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Białowieża/ })).toBeInTheDocument();
  });

  it("shows a useful no-results state and resets the complete profile", () => {
    render(<App />);

    addCriterion(/Distance to airport/);
    const completeMatchesSwitch = screen.getByRole("switch", {
      name: /Prioritize complete matches/,
    });
    fireEvent.click(completeMatchesSwitch);
    const airport = getCriterionGroup("Airport");
    fireEvent.change(within(airport).getByLabelText("Value"), {
      target: { value: "200" },
    });

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "No locations match all required criteria.",
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset preferences" }));

    expect(screen.queryByRole("group", { name: "Airport" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("switch", { name: /Prioritize complete matches/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Start by adding the things that matter to you.")).toBeVisible();
  });

  it("reset clears every user-selected criterion", () => {
    render(<App />);

    addCriterion(/Distance to forest/);
    addCriterion(/Distance to water/);
    fireEvent.click(screen.getByRole("button", { name: "Reset preferences" }));

    expect(screen.queryByRole("group", { name: "Forest" })).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Water" })).not.toBeInTheDocument();
  });

  it("shows a helpful empty state without ranking every location", () => {
    render(<App />);

    addCriterion(/Distance to forest/);
    fireEvent.click(screen.getByRole("button", { name: "Remove Forest criterion" }));

    expect(screen.getByText("Start by adding the things that matter to you.")).toBeVisible();
    expect(screen.getByText("Your match ranking will appear here.")).toBeVisible();
    expect(screen.queryByRole("list", { name: "Ranked top matches" })).not.toBeInTheDocument();
    expect(screen.getByText("Add criteria to begin")).toBeVisible();
    expect(screen.queryByText(/overall match/)).not.toBeInTheDocument();
  });

  it("shows explainable details for a selected match", () => {
    render(<App />);

    addCriterion(/Distance to forest/);
    fireEvent.click(screen.getByRole("button", { name: /Białowieża/ }));

    expect(screen.getByRole("heading", { level: 3, name: "Białowieża" })).toBeInTheDocument();
    expect(screen.getByText("Selected on map: bialowieza-pl")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "Nature" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 4, name: "Yearly climate" })).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 5, name: "Temperature through the year" }),
    ).toBeVisible();
    expect(screen.getByText("At most 1 km")).toBeVisible();
  });

  it("updates criterion visualizations when the selected location changes", () => {
    render(<App />);

    addCriterion(/Distance to forest/);
    fireEvent.click(screen.getByRole("button", { name: /Białowieża/ }));
    const forestHeading = screen.getByRole("heading", { level: 5, name: "Distance to forest" });
    const forestVisualization = forestHeading.closest("figure");

    if (forestVisualization === null) {
      throw new Error("Expected the forest criterion visualization.");
    }

    expect(within(forestVisualization).getByText("0.1 km", { selector: "span" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Select Geiranger from map" }));

    expect(within(forestVisualization).getByText("0.2 km", { selector: "span" })).toBeVisible();
  });

  it("removes inactive criterion evaluations while retaining informational climate", () => {
    render(<App />);

    addCriterion(/Distance to forest/);
    addCriterion(/Distance to grocery store/);
    fireEvent.click(screen.getByRole("button", { name: /Białowieża/ }));
    expect(screen.getByRole("heading", { level: 5, name: "Distance to forest" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 4, name: "Yearly climate" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Remove Forest criterion" }));

    expect(
      screen.queryByRole("heading", { level: 5, name: "Distance to forest" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "Yearly climate" })).toBeVisible();
  });

  it("synchronizes a map selection with location details", () => {
    render(<App />);

    addCriterion(/Distance to airport/);
    fireEvent.click(screen.getByRole("button", { name: "Select Geiranger from map" }));

    expect(screen.getByRole("heading", { level: 3, name: "Geiranger" })).toBeInTheDocument();
    expect(screen.getByText(/Norway · No longer qualified/)).toBeInTheDocument();
    expect(screen.getByText("Selected on map: geiranger-no")).toBeInTheDocument();
  });

  it("keeps the selected location when it becomes excluded", () => {
    render(<App />);

    addCriterion(/Distance to forest/);
    addCriterion(/Distance to airport/);
    fireEvent.click(screen.getByRole("button", { name: /Białowieża/ }));
    fireEvent.change(within(getCriterionGroup("Airport")).getByLabelText("Value"), {
      target: { value: "200" },
    });

    expect(screen.getByRole("heading", { level: 3, name: "Białowieża" })).toBeInTheDocument();
    expect(screen.getByText(/Poland · No longer qualified/)).toBeInTheDocument();
    expect(screen.getByText("Selected on map: bialowieza-pl")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 5, name: "Distance to airport" })).toBeVisible();
    expect(screen.getByText("At least 200 km")).toBeVisible();
  });
});
