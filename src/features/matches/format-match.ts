const percentageFormatter = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 0,
});

export function formatMatchScore(score: number): string {
  return percentageFormatter.format(score);
}
