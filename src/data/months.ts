export const months = [
  { id: "january", shortLabel: "Jan", fullLabel: "January" },
  { id: "february", shortLabel: "Feb", fullLabel: "February" },
  { id: "march", shortLabel: "Mar", fullLabel: "March" },
  { id: "april", shortLabel: "Apr", fullLabel: "April" },
  { id: "may", shortLabel: "May", fullLabel: "May" },
  { id: "june", shortLabel: "Jun", fullLabel: "June" },
  { id: "july", shortLabel: "Jul", fullLabel: "July" },
  { id: "august", shortLabel: "Aug", fullLabel: "August" },
  { id: "september", shortLabel: "Sep", fullLabel: "September" },
  { id: "october", shortLabel: "Oct", fullLabel: "October" },
  { id: "november", shortLabel: "Nov", fullLabel: "November" },
  { id: "december", shortLabel: "Dec", fullLabel: "December" },
] as const;

export type MonthId = (typeof months)[number]["id"];

export const monthIds: readonly MonthId[] = months.map((month) => month.id);

const monthById = new Map(months.map((month) => [month.id, month] as const));

export function getMonth(monthId: MonthId) {
  const month = monthById.get(monthId);

  if (month === undefined) {
    throw new Error(`Unknown month: ${monthId}`);
  }

  return month;
}
