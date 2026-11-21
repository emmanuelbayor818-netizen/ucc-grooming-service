// Time slot generation and schedule validation utilities

export function generateDailyTimeSlots(
  openingTime: string = "08:00",
  closingTime: string = "20:00",
  intervalMinutes: number = 30,
  breakPeriods: { start: string; end: string }[] = []
): string[] {
  const slots: string[] = [];
  const [openHour, openMin] = openingTime.split(":").map(Number);
  const [closeHour, closeMin] = closingTime.split(":").map(Number);

  const startMinutes = openHour * 60 + openMin;
  const endMinutes = closeHour * 60 + closeMin;

  for (let current = startMinutes; current + intervalMinutes <= endMinutes; current += intervalMinutes) {
    const slotHour = Math.floor(current / 60);
    const slotMin = current % 60;
    const formatted = `${String(slotHour).padStart(2, "0")}:${String(slotMin).padStart(2, "0")}`;

    // Check if slot falls in break
    const isInBreak = breakPeriods.some(bp => {
      const [bStartH, bStartM] = bp.start.split(":").map(Number);
      const [bEndH, bEndM] = bp.end.split(":").map(Number);
      const bStartTotal = bStartH * 60 + bStartM;
      const bEndTotal = bEndH * 60 + bEndM;
      return current >= bStartTotal && current < bEndTotal;
    });

    if (!isInBreak) {
      slots.push(formatted);
    }
  }

  return slots;
}

export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(":").map(Number);
  const total = h * 60 + m + durationMinutes;
  const endH = Math.floor(total / 60);
  const endM = total % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

export function areTimeIntervalsOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const toMins = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  return Math.max(toMins(startA), toMins(startB)) < Math.min(toMins(endA), toMins(endB));
}

export function formatGHS(amount: number): string {
  return `GH₵ ${Number(amount).toFixed(2)}`;
}
