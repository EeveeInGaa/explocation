export type Unit = "kilometers" | "degreesCelsius";

export type UnitDefinition = Readonly<{
  id: Unit;
  label: string;
  symbol: string;
}>;

export const unitDefinitions: Readonly<Record<Unit, UnitDefinition>> = {
  kilometers: {
    id: "kilometers",
    label: "kilometers",
    symbol: "km",
  },
  degreesCelsius: {
    id: "degreesCelsius",
    label: "degrees Celsius",
    symbol: "°C",
  },
};
