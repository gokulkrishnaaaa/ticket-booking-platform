export function getIndiaDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getIndiaDayRange(date: string) {
  const startOfDay = new Date(`${date}T00:00:00+05:30`);

  const startOfNextDay = new Date(startOfDay);
  startOfNextDay.setUTCDate(startOfNextDay.getUTCDate() + 1);

  return {
    startOfDay,
    startOfNextDay,
  };
}
