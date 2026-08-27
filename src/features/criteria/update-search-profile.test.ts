import { describe, expect, it } from "vitest";
import { initialSearchProfile } from "../../data/default-search-profile";
import { criterionIds } from "../../types/criterion";
import { criterionCatalog, criterionDefinitions } from "./criterion-definitions";
import {
  addCriterionToProfile,
  changePriority,
  changeThreshold,
  createConfiguredCriterion,
  removeCriterionFromProfile,
} from "./update-search-profile";

describe("search profile criteria", () => {
  it("creates a configured criterion from its centralized default", () => {
    expect(createConfiguredCriterion(criterionDefinitions.waterDistance)).toEqual({
      criterionId: "waterDistance",
      priority: "preferred",
      constraint: { type: "maximum", threshold: 3 },
    });
  });

  it("adds and removes a criterion without altering existing configurations", () => {
    const airportProfile = addCriterionToProfile(
      initialSearchProfile,
      criterionDefinitions.airportDistance,
    );
    const customizedProfile = changeThreshold(
      changePriority(airportProfile, "airportDistance", "required"),
      "airportDistance",
      150,
    );
    const withWater = addCriterionToProfile(customizedProfile, criterionDefinitions.waterDistance);
    const restored = removeCriterionFromProfile(withWater, "waterDistance");

    expect(withWater.at(-1)).toEqual({
      criterionId: "waterDistance",
      priority: "preferred",
      constraint: { type: "maximum", threshold: 3 },
    });
    expect(restored).toEqual(customizedProfile);
  });

  it("rejects duplicate configured criterion IDs", () => {
    expect(() =>
      addCriterionToProfile(
        addCriterionToProfile(initialSearchProfile, criterionDefinitions.forestDistance),
        criterionDefinitions.forestDistance,
      ),
    ).toThrow("Criterion forestDistance is already configured.");
  });

  it("keeps the complete catalog separate from the empty initial profile", () => {
    expect(criterionCatalog.map(({ id }) => id)).toEqual(criterionIds);
    expect(criterionCatalog).toHaveLength(6);
    expect(initialSearchProfile).toEqual([]);
  });
});
