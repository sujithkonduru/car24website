/**
 * Builds a `slots` array whose sum equals `totalHours`, using the same
 * greedy 24 → 12 → 6 breakdown as the backend pricing logic.
 * Partial hours are rounded up to the next full hour, then duration is
 * snapped up to a multiple of 6 hours so every hour is billable.
 */
export function totalHoursFromRange(startIso, endIso) {
  const a = new Date(startIso).getTime();
  const b = new Date(endIso).getTime();
  if (!(a < b)) return 0;
  return Math.ceil((b - a) / (1000 * 60 * 60));
}

export function snapHoursToPricingGrid(hours) {
  if (hours <= 0) return 6;
  return Math.ceil(hours / 6) * 6;
}

export function buildSlots(totalHours) {
  let remaining = totalHours;
  const slots = [];
  while (remaining >= 24) {
    slots.push(24);
    remaining -= 24;
  }
  while (remaining >= 12) {
    slots.push(12);
    remaining -= 12;
  }
  while (remaining >= 6) {
    slots.push(6);
    remaining -= 6;
  }
  if (remaining > 0) {
    slots.push(6);
  }
  return slots;
}

export function slotsFromBookingWindow(startIso, endIso) {
  const raw = totalHoursFromRange(startIso, endIso);
  const snapped = snapHoursToPricingGrid(raw);
  return buildSlots(snapped);
}
