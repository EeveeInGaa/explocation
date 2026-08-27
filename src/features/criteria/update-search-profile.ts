import { defaultCriterionConfigurations } from "../../data/default-criterion-configurations";
import type {
  ConfiguredCriterion,
  ConstraintType,
  CriterionDefinition,
  CriterionId,
  CriterionPriority,
  NumericConstraint,
} from "../../types/criterion";

export function createConfiguredCriterion(definition: CriterionDefinition): ConfiguredCriterion {
  const defaultConfiguration = defaultCriterionConfigurations[definition.id];

  if (!definition.supportedConstraintTypes.includes(defaultConfiguration.constraint.type)) {
    throw new Error(
      `Default constraint type ${defaultConfiguration.constraint.type} is not supported by ${definition.id}.`,
    );
  }

  return {
    criterionId: definition.id,
    ...defaultConfiguration,
    constraint: { ...defaultConfiguration.constraint },
  };
}

export function addCriterionToProfile(
  profile: readonly ConfiguredCriterion[],
  definition: CriterionDefinition,
): readonly ConfiguredCriterion[] {
  if (profile.some((configured) => configured.criterionId === definition.id)) {
    throw new Error(`Criterion ${definition.id} is already configured.`);
  }

  return [...profile, createConfiguredCriterion(definition)];
}

export function removeCriterionFromProfile(
  profile: readonly ConfiguredCriterion[],
  criterionId: CriterionId,
): readonly ConfiguredCriterion[] {
  if (!profile.some((configured) => configured.criterionId === criterionId)) {
    throw new Error(`Criterion ${criterionId} is not configured.`);
  }

  return profile.filter((configured) => configured.criterionId !== criterionId);
}

function replaceCriterion(
  profile: readonly ConfiguredCriterion[],
  criterionId: CriterionId,
  update: (configured: ConfiguredCriterion) => ConfiguredCriterion,
): readonly ConfiguredCriterion[] {
  let found = false;
  const updatedProfile = profile.map((configured) => {
    if (configured.criterionId !== criterionId) {
      return configured;
    }

    found = true;
    return update(configured);
  });

  if (!found) {
    throw new Error(`Criterion ${criterionId} is not configured.`);
  }

  return updatedProfile;
}

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`);
  }
}

function convertConstraint(
  constraint: NumericConstraint,
  constraintType: ConstraintType,
): NumericConstraint {
  if (constraint.type === constraintType) {
    return constraint;
  }

  switch (constraintType) {
    case "maximum":
      return {
        type: "maximum",
        threshold: constraint.type === "range" ? constraint.maximum : constraint.threshold,
      };
    case "minimum":
      return {
        type: "minimum",
        threshold: constraint.type === "range" ? constraint.minimum : constraint.threshold,
      };
    case "range": {
      if (constraint.type === "range") {
        return constraint;
      }

      return { type: "range", minimum: constraint.threshold, maximum: constraint.threshold };
    }
  }
}

export function copySearchProfile(
  profile: readonly ConfiguredCriterion[],
): readonly ConfiguredCriterion[] {
  return profile.map((configured) => ({
    ...configured,
    constraint: { ...configured.constraint },
  }));
}

export function changeConstraintType(
  profile: readonly ConfiguredCriterion[],
  criterionId: CriterionId,
  constraintType: ConstraintType,
): readonly ConfiguredCriterion[] {
  return replaceCriterion(profile, criterionId, (configured) => ({
    ...configured,
    constraint: convertConstraint(configured.constraint, constraintType),
  }));
}

export function changeThreshold(
  profile: readonly ConfiguredCriterion[],
  criterionId: CriterionId,
  threshold: number,
): readonly ConfiguredCriterion[] {
  assertFinite(threshold, "Threshold");

  return replaceCriterion(profile, criterionId, (configured) => {
    if (configured.constraint.type === "range") {
      throw new Error(`Criterion ${criterionId} requires range boundaries.`);
    }

    return {
      ...configured,
      constraint: {
        type: configured.constraint.type,
        threshold,
      },
    };
  });
}

export function changeRange(
  profile: readonly ConfiguredCriterion[],
  criterionId: CriterionId,
  minimum: number,
  maximum: number,
): readonly ConfiguredCriterion[] {
  assertFinite(minimum, "Range minimum");
  assertFinite(maximum, "Range maximum");

  if (minimum > maximum) {
    throw new Error("Range minimum must not exceed range maximum.");
  }

  return replaceCriterion(profile, criterionId, (configured) => {
    if (configured.constraint.type !== "range") {
      throw new Error(`Criterion ${criterionId} does not use a range constraint.`);
    }

    return {
      ...configured,
      constraint: { type: "range", minimum, maximum },
    };
  });
}

export function changePriority(
  profile: readonly ConfiguredCriterion[],
  criterionId: CriterionId,
  priority: CriterionPriority,
): readonly ConfiguredCriterion[] {
  return replaceCriterion(profile, criterionId, (configured) => ({
    ...configured,
    priority,
  }));
}
