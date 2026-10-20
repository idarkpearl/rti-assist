/**
 * Pure functions for RTI deadline formatting and calculations.
 * 
 * Rules:
 * - Backend computes dueDate per RTI Act rules (30 days for Sec 7(1), 48h for Sec 7(1) proviso, etc.)
 * - This utility handles pure client-side formatting:
 *   - Urgency color: Red (< 3 days or overdue), Yellow (< 7 days), Green (>= 7 days)
 *   - Day-count text: "X days left", "1 day left", "Due today", "Overdue by X days"
 *   - State flags: isOverdue, isDueToday
 *   - Display labels and statutory section references
 */

export type DeadlineType = 'response' | 'life_liberty' | 'first_appeal' | 'second_appeal';

export type UrgencyColor = 'red' | 'yellow' | 'green';

export interface DeadlineInput {
  type: DeadlineType | string;
  dueDate: string | Date | number;
  id?: string;
  title?: string;
  notes?: string;
}

export interface FormattedDeadline {
  daysRemaining: number;
  isOverdue: boolean;
  isDueToday: boolean;
  urgencyColor: UrgencyColor;
  timeRemainingText: string;
  typeLabel: string;
  sectionReference: string;
  urgencyLabel: string;
  badgeClass: string;
  textClass: string;
}

/**
 * Normalizes date input into UTC midnight timestamp representing the calendar date.
 * Extracts year, month, and day based on ISO representation to avoid local timezone drift.
 */
function toMidnightTimestamp(input: string | Date | number): number {
  if (typeof input === 'string') {
    const match = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return Date.UTC(year, month, day);
    }
  }

  const d = new Date(input);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date input: ${String(input)}`);
  }
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Computes calendar day count from referenceDate to dueDate.
 * If referenceDate is omitted, current local time is used.
 * 
 * Positive: Days remaining in future
 * 0: Due today
 * Negative: Overdue by N days
 */
export function calculateDaysRemaining(
  dueDate: string | Date | number,
  referenceDate: string | Date | number = new Date()
): number {
  const targetMs = toMidnightTimestamp(dueDate);
  const refMs = toMidnightTimestamp(referenceDate);

  const diffMs = targetMs - refMs;
  const ONE_DAY_MS = 1000 * 60 * 60 * 24;

  return Math.round(diffMs / ONE_DAY_MS);
}

/**
 * Determines urgency color according to requirements:
 * - 'red': < 3 days (including due-today and overdue)
 * - 'yellow': < 7 days (i.e. 3, 4, 5, 6 days)
 * - 'green': otherwise (>= 7 days)
 */
export function getUrgencyColor(daysRemaining: number): UrgencyColor {
  if (daysRemaining < 3) {
    return 'red';
  }
  if (daysRemaining < 7) {
    return 'yellow';
  }
  return 'green';
}

/**
 * Computes human-readable time-remaining label.
 * Handles singular/plural and overdue/due-today states.
 */
export function formatTimeRemainingText(daysRemaining: number): string {
  if (daysRemaining < 0) {
    const overdueDays = Math.abs(daysRemaining);
    return overdueDays === 1 ? 'Overdue by 1 day' : `Overdue by ${overdueDays} days`;
  }
  if (daysRemaining === 0) {
    return 'Due today';
  }
  if (daysRemaining === 1) {
    return '1 day left';
  }
  return `${daysRemaining} days left`;
}

/**
 * Returns user-facing label for the statutory RTI deadline type.
 */
export function getDeadlineTypeLabel(type: DeadlineType | string): string {
  const normalized = String(type).toLowerCase().replace(/-/g, '_');
  switch (normalized) {
    case 'response':
    case 'pio_response':
      return 'PIO 30-Day Response Window';
    case 'life_liberty':
    case 'life_and_liberty':
      return 'Life & Liberty Urgent Response (48h)';
    case 'first_appeal':
    case 'first_appeal_window':
      return 'First Appeal Filing Window';
    case 'second_appeal':
    case 'second_appeal_window':
      return 'Second Appeal Proceeding (CIC/SIC)';
    default:
      return 'Statutory RTI Deadline';
  }
}

/**
 * Returns statutory section under RTI Act, 2005.
 */
export function getStatutorySectionReference(type: DeadlineType | string): string {
  const normalized = String(type).toLowerCase().replace(/-/g, '_');
  switch (normalized) {
    case 'response':
    case 'pio_response':
      return 'RTI Act Sec 7(1)';
    case 'life_liberty':
    case 'life_and_liberty':
      return 'RTI Act Sec 7(1) Proviso';
    case 'first_appeal':
    case 'first_appeal_window':
      return 'RTI Act Sec 19(1)';
    case 'second_appeal':
    case 'second_appeal_window':
      return 'RTI Act Sec 19(3)';
    default:
      return 'RTI Act 2005';
  }
}

/**
 * Pure helper checking if deadline is overdue (< 0 days).
 */
export function isOverdue(
  dueDate: string | Date | number,
  referenceDate: string | Date | number = new Date()
): boolean {
  return calculateDaysRemaining(dueDate, referenceDate) < 0;
}

/**
 * Pure helper checking if deadline is due today (0 days).
 */
export function isDueToday(
  dueDate: string | Date | number,
  referenceDate: string | Date | number = new Date()
): boolean {
  return calculateDaysRemaining(dueDate, referenceDate) === 0;
}

/**
 * Main pure formatter computing comprehensive display metadata from a Deadline object.
 */
export function formatDeadline(
  deadline: DeadlineInput,
  referenceDate: string | Date | number = new Date()
): FormattedDeadline {
  if (!deadline || !deadline.dueDate) {
    throw new Error('Deadline object must include a valid dueDate');
  }

  const daysRemaining = calculateDaysRemaining(deadline.dueDate, referenceDate);
  const overdue = daysRemaining < 0;
  const dueToday = daysRemaining === 0;
  const urgencyColor = getUrgencyColor(daysRemaining);
  const timeRemainingText = formatTimeRemainingText(daysRemaining);
  const typeLabel = getDeadlineTypeLabel(deadline.type);
  const sectionReference = getStatutorySectionReference(deadline.type);

  let urgencyLabel: string;
  let badgeClass: string;
  let textClass: string;

  switch (urgencyColor) {
    case 'red':
      urgencyLabel = overdue ? 'Overdue' : dueToday ? 'Due Today' : 'Critical Urgency';
      badgeClass = 'bg-rose-950/90 text-rose-300 border border-rose-800/90 ring-1 ring-rose-500/40';
      textClass = 'text-rose-400';
      break;
    case 'yellow':
      urgencyLabel = 'Impending Deadline';
      badgeClass = 'bg-amber-950/90 text-amber-300 border border-amber-800/90 ring-1 ring-amber-500/40';
      textClass = 'text-amber-400';
      break;
    case 'green':
      urgencyLabel = 'On Track';
      badgeClass = 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80';
      textClass = 'text-emerald-400';
      break;
  }

  return {
    daysRemaining,
    isOverdue: overdue,
    isDueToday: dueToday,
    urgencyColor,
    timeRemainingText,
    typeLabel,
    sectionReference,
    urgencyLabel,
    badgeClass,
    textClass,
  };
}
