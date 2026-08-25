import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the configured profile and calculated matches", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 1, name: "Explocation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Current criteria" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Top matches" })).toBeInTheDocument();
    expect(screen.getByText("Białowieża")).toBeInTheDocument();
    expect(screen.getAllByText(/Excluded:/)).not.toHaveLength(0);
  });
});
