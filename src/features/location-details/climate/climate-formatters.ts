import { getMonth, type MonthId } from "../../../data/months";

const numberFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 1,
});

export function formatTemperature(value: number) {
  return `${numberFormatter.format(value)} °C`;
}

export function formatTemperatureAxis(value: number) {
  return `${numberFormatter.format(value)}°`;
}

export function formatDaylightHours(value: number) {
  return `${numberFormatter.format(value)} h`;
}

export function formatDaylightDuration(value: number) {
  const totalMinutes = Math.round(value * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

export function formatShortMonth(monthId: MonthId) {
  return getMonth(monthId).shortLabel;
}

export function formatFullMonth(monthId: MonthId) {
  return getMonth(monthId).fullLabel;
}
