import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getPreparedMonthlyClimate } from "../../../data/monthly-climate";
import { ClimateSection } from "./ClimateSection";

describe("ClimateSection", () => {
  it("shows temperature by default with accessible monthly data", () => {
    render(
      <ClimateSection
        locationName="Białowieża"
        climateData={getPreparedMonthlyClimate("bialowieza-pl")}
      />,
    );

    expect(screen.getByRole("heading", { name: "Yearly climate" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Temperature through the year" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Temperature" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText(/prepared monthly profile for Białowieża/i)).toBeVisible();

    const january = screen.getByRole("row", { name: /January/ });
    expect(within(january).getByText("-3 °C")).toBeInTheDocument();
    expect(within(january).getByText("8 h")).toBeInTheDocument();
  });

  it("switches to a daylight chart and keeps its textual meaning available", () => {
    render(
      <ClimateSection
        locationName="Kilpisjärvi"
        climateData={getPreparedMonthlyClimate("kilpisjarvi-fi")}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Daylight" }));

    expect(screen.getByRole("heading", { name: "Daylight through the year" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Daylight" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("Average daylight duration per day")).toBeVisible();
    expect(screen.getByRole("row", { name: /June/ })).toHaveTextContent("24 h");
  });

  it("updates when the selected location changes", () => {
    const { rerender } = render(
      <ClimateSection
        locationName="Białowieża"
        climateData={getPreparedMonthlyClimate("bialowieza-pl")}
      />,
    );

    expect(screen.getByRole("row", { name: /January/ })).toHaveTextContent("-3 °C");

    rerender(
      <ClimateSection locationName="Hanko" climateData={getPreparedMonthlyClimate("hanko-fi")} />,
    );

    expect(screen.getByText(/prepared monthly profile for Hanko/i)).toBeVisible();
    expect(screen.getByRole("row", { name: /January/ })).toHaveTextContent("-2 °C");
  });

  it("shows an explicit fallback when climate data is unavailable", () => {
    render(<ClimateSection locationName="Unknown place" climateData={undefined} />);

    expect(screen.getByText("Climate data is not available for this location yet.")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Temperature" })).not.toBeInTheDocument();
  });
});
