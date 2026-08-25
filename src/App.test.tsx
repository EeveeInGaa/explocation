import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
    expect(screen.getByRole("button", { name: /Białowieża/ })).toBeInTheDocument();
  });

  it("shows explainable details for a selected match", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Białowieża/ }));

    expect(screen.getByRole("heading", { level: 3, name: "Białowieża" })).toBeInTheDocument();
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
});
