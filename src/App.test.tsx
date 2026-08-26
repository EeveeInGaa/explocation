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

describe("App", () => {
  it("renders editable preferences and calculated matches", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 1, name: "Explocation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Criteria" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Top matches" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Białowieża/ })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /Prioritize complete matches/ })).not.toBeChecked();
  });

  it("can prioritize locations that satisfy every preference", () => {
    render(<App />);

    const rankedMatches = screen.getByRole("list", { name: "Ranked top matches" });
    const getRankedNames = () =>
      within(rankedMatches)
        .getAllByRole("button")
        .map((button) => button.textContent);

    expect(getRankedNames()[0]).toContain("Kilpisjärvi");
    expect(getRankedNames()[1]).toContain("Białowieża");
    expect(getRankedNames()[2]).toContain("Hanko");
    expect(getRankedNames()[1]).toContain("Some preferences missed");
    expect(getRankedNames()[2]).toContain("All preferences met");

    fireEvent.click(screen.getByRole("switch", { name: /Prioritize complete matches/ }));

    expect(getRankedNames()[0]).toContain("Kilpisjärvi");
    expect(getRankedNames()[1]).toContain("Hanko");
    expect(getRankedNames()[2]).toContain("Białowieża");
  });

  it("updates results when a maximum value changes", () => {
    render(<App />);

    const forest = getCriterionGroup("Forest");
    const valueInput = within(forest).getByLabelText("Value");
    const initialMatchText = screen.getByRole("button", { name: /Białowieża/ }).textContent;
    fireEvent.change(valueInput, { target: { value: "0.1" } });

    expect(valueInput).toHaveValue(0.1);
    expect(screen.getByRole("button", { name: /Białowieża/ }).textContent).not.toBe(
      initialMatchText,
    );
  });

  it("supports changing the same criterion to minimum and range constraints", () => {
    render(<App />);

    const forest = getCriterionGroup("Forest");
    const preferenceSelect = within(forest).getByLabelText("Preference");
    fireEvent.change(preferenceSelect, { target: { value: "minimum" } });

    const minimumForest = getCriterionGroup("Forest");
    const minimumSelect = within(minimumForest).getByLabelText("Preference");
    expect(minimumSelect).toHaveValue("minimum");
    expect(within(minimumForest).getByLabelText("Value")).toBeInTheDocument();

    fireEvent.change(minimumSelect, { target: { value: "range" } });

    const rangeForest = getCriterionGroup("Forest");
    expect(within(rangeForest).getByLabelText("Preference")).toHaveValue("range");
    expect(within(rangeForest).getByLabelText("From")).toBeInTheDocument();
    expect(within(rangeForest).getByLabelText("To")).toBeInTheDocument();
    expect(within(rangeForest).queryByLabelText("Value")).not.toBeInTheDocument();
  });

  it("applies required priority changes to qualification", () => {
    render(<App />);

    const forest = getCriterionGroup("Forest");
    fireEvent.change(within(forest).getByLabelText("Priority"), {
      target: { value: "required" },
    });

    expect(screen.getByText("Vík, Iceland")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Vík/ })).not.toBeInTheDocument();
  });

  it("offers every supported priority", () => {
    render(<App />);

    const prioritySelect = within(getCriterionGroup("Forest")).getByLabelText("Priority");
    for (const priority of ["required", "important", "preferred", "niceToHave"]) {
      fireEvent.change(prioritySelect, { target: { value: priority } });
      expect(prioritySelect).toHaveValue(priority);
    }
  });

  it("keeps invalid drafts away from the matching engine", () => {
    render(<App />);

    const airport = getCriterionGroup("Airport");
    const valueInput = within(airport).getByLabelText("Value");
    fireEvent.change(valueInput, { target: { value: "" } });
    fireEvent.blur(valueInput);

    expect(screen.getByText("Enter a finite number.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Białowieża/ })).toBeInTheDocument();
  });

  it("shows a useful no-results state and resets the complete profile", () => {
    render(<App />);

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

    expect(within(getCriterionGroup("Airport")).getByLabelText("Value")).toHaveValue(100);
    expect(screen.getByRole("switch", { name: /Prioritize complete matches/ })).not.toBeChecked();
    expect(screen.getByRole("button", { name: /Białowieża/ })).toBeInTheDocument();
  });

  it("shows explainable details for a selected match", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Białowieża/ }));

    expect(screen.getByRole("heading", { level: 3, name: "Białowieża" })).toBeInTheDocument();
    expect(screen.getByText("Selected on map: bialowieza-pl")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(6);
    expect(
      screen.getByText((_, element) =>
        Boolean(
          element?.tagName === "P" &&
            element.textContent?.includes("Actual:") &&
            element.textContent.includes("Preference: At most 1 km"),
        ),
      ),
    ).toBeInTheDocument();
  });

  it("synchronizes a map selection with location details", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Select Geiranger from map" }));

    expect(screen.getByRole("heading", { level: 3, name: "Geiranger" })).toBeInTheDocument();
    expect(screen.getByText(/Norway · No longer qualified/)).toBeInTheDocument();
    expect(screen.getByText("Selected on map: geiranger-no")).toBeInTheDocument();
  });

  it("keeps the selected location when it becomes excluded", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Białowieża/ }));
    fireEvent.change(within(getCriterionGroup("Airport")).getByLabelText("Value"), {
      target: { value: "200" },
    });

    expect(screen.getByRole("heading", { level: 3, name: "Białowieża" })).toBeInTheDocument();
    expect(screen.getByText(/Poland · No longer qualified/)).toBeInTheDocument();
    expect(screen.getByText("Selected on map: bialowieza-pl")).toBeInTheDocument();
  });
});
