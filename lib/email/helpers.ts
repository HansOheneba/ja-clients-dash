export function firstNameFrom(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || "there";
}

/** "Q2 2026 (1 Apr 2026 to 30 Jun 2026)" -> "Q2 2026" */
export function shortPeriodLabel(label: string) {
  const cut = label.indexOf(" (");
  return cut === -1 ? label : label.slice(0, cut);
}

/** ISO date -> "30 June" */
export function asOfMonthDay(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
}
