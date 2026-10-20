import { describe, it, expect } from 'vitest';
import {
  calculateDaysRemaining,
  getUrgencyColor,
  formatTimeRemainingText,
  getDeadlineTypeLabel,
  getStatutorySectionReference,
  isOverdue,
  isDueToday,
  formatDeadline,
  DeadlineInput,
} from '../deadlineUtils';

describe('deadlineUtils', () => {
  const BASE_DATE = new Date('2026-09-27T10:00:00Z');

  describe('calculateDaysRemaining', () => {
    it('returns 0 when dueDate is on the same calendar day regardless of time', () => {
      expect(calculateDaysRemaining('2026-09-27T00:00:00Z', BASE_DATE)).toBe(0);
      expect(calculateDaysRemaining('2026-09-27T12:00:00Z', BASE_DATE)).toBe(0);
      expect(calculateDaysRemaining('2026-09-27T23:59:59Z', BASE_DATE)).toBe(0);
    });

    it('returns positive day count for future dates', () => {
      expect(calculateDaysRemaining('2026-09-28T00:00:00Z', BASE_DATE)).toBe(1);
      expect(calculateDaysRemaining('2026-09-29T10:00:00Z', BASE_DATE)).toBe(2);
      expect(calculateDaysRemaining('2026-09-30T10:00:00Z', BASE_DATE)).toBe(3);
      expect(calculateDaysRemaining('2026-10-04T10:00:00Z', BASE_DATE)).toBe(7);
      expect(calculateDaysRemaining('2026-10-27T10:00:00Z', BASE_DATE)).toBe(30);
    });

    it('returns negative day count for past overdue dates', () => {
      expect(calculateDaysRemaining('2026-09-26T10:00:00Z', BASE_DATE)).toBe(-1);
      expect(calculateDaysRemaining('2026-09-22T10:00:00Z', BASE_DATE)).toBe(-5);
      expect(calculateDaysRemaining('2026-08-27T10:00:00Z', BASE_DATE)).toBe(-31);
    });

    it('correctly handles month boundaries and year rollover', () => {
      const nov30 = new Date('2026-11-30T12:00:00Z');
      expect(calculateDaysRemaining('2026-12-01T08:00:00Z', nov30)).toBe(1);

      const dec31 = new Date('2026-12-31T23:00:00Z');
      expect(calculateDaysRemaining('2027-01-01T01:00:00Z', dec31)).toBe(1);
    });

    it('throws error when given an invalid date input', () => {
      expect(() => calculateDaysRemaining('not-a-date', BASE_DATE)).toThrow(
        /Invalid date input/
      );
    });
  });

  describe('getUrgencyColor', () => {
    it('returns "red" for daysRemaining < 3 (including overdue and due-today)', () => {
      expect(getUrgencyColor(-5)).toBe('red');
      expect(getUrgencyColor(-1)).toBe('red');
      expect(getUrgencyColor(0)).toBe('red'); // Due today
      expect(getUrgencyColor(1)).toBe('red');
      expect(getUrgencyColor(2)).toBe('red');
    });

    it('returns "yellow" for 3 <= daysRemaining < 7', () => {
      expect(getUrgencyColor(3)).toBe('yellow');
      expect(getUrgencyColor(4)).toBe('yellow');
      expect(getUrgencyColor(5)).toBe('yellow');
      expect(getUrgencyColor(6)).toBe('yellow');
    });

    it('returns "green" for daysRemaining >= 7', () => {
      expect(getUrgencyColor(7)).toBe('green');
      expect(getUrgencyColor(8)).toBe('green');
      expect(getUrgencyColor(15)).toBe('green');
      expect(getUrgencyColor(30)).toBe('green');
      expect(getUrgencyColor(60)).toBe('green');
    });
  });

  describe('formatTimeRemainingText', () => {
    it('formats overdue days with singular and plural variants', () => {
      expect(formatTimeRemainingText(-1)).toBe('Overdue by 1 day');
      expect(formatTimeRemainingText(-2)).toBe('Overdue by 2 days');
      expect(formatTimeRemainingText(-14)).toBe('Overdue by 14 days');
    });

    it('formats 0 days as "Due today"', () => {
      expect(formatTimeRemainingText(0)).toBe('Due today');
    });

    it('formats 1 day left with singular "day"', () => {
      expect(formatTimeRemainingText(1)).toBe('1 day left');
    });

    it('formats multiple days left with plural "days"', () => {
      expect(formatTimeRemainingText(2)).toBe('2 days left');
      expect(formatTimeRemainingText(5)).toBe('5 days left');
      expect(formatTimeRemainingText(30)).toBe('30 days left');
    });
  });

  describe('getDeadlineTypeLabel', () => {
    it('returns descriptive title for all 4 statutory RTI deadline types', () => {
      expect(getDeadlineTypeLabel('response')).toBe('PIO 30-Day Response Window');
      expect(getDeadlineTypeLabel('life_liberty')).toBe('Life & Liberty Urgent Response (48h)');
      expect(getDeadlineTypeLabel('first_appeal')).toBe('First Appeal Filing Window');
      expect(getDeadlineTypeLabel('second_appeal')).toBe('Second Appeal Proceeding (CIC/SIC)');
    });

    it('handles aliases gracefully', () => {
      expect(getDeadlineTypeLabel('pio_response')).toBe('PIO 30-Day Response Window');
      expect(getDeadlineTypeLabel('life_and_liberty')).toBe('Life & Liberty Urgent Response (48h)');
      expect(getDeadlineTypeLabel('first_appeal_window')).toBe('First Appeal Filing Window');
    });

    it('provides fallback for unknown type', () => {
      expect(getDeadlineTypeLabel('custom_type')).toBe('Statutory RTI Deadline');
    });
  });

  describe('getStatutorySectionReference', () => {
    it('returns exact legal section for all types', () => {
      expect(getStatutorySectionReference('response')).toBe('RTI Act Sec 7(1)');
      expect(getStatutorySectionReference('life_liberty')).toBe('RTI Act Sec 7(1) Proviso');
      expect(getStatutorySectionReference('first_appeal')).toBe('RTI Act Sec 19(1)');
      expect(getStatutorySectionReference('second_appeal')).toBe('RTI Act Sec 19(3)');
    });
  });

  describe('isOverdue and isDueToday', () => {
    it('correctly reports isOverdue', () => {
      expect(isOverdue('2026-09-26T10:00:00Z', BASE_DATE)).toBe(true);
      expect(isOverdue('2026-09-27T10:00:00Z', BASE_DATE)).toBe(false);
      expect(isOverdue('2026-09-28T10:00:00Z', BASE_DATE)).toBe(false);
    });

    it('correctly reports isDueToday', () => {
      expect(isDueToday('2026-09-27T08:00:00Z', BASE_DATE)).toBe(true);
      expect(isDueToday('2026-09-26T08:00:00Z', BASE_DATE)).toBe(false);
      expect(isDueToday('2026-09-28T08:00:00Z', BASE_DATE)).toBe(false);
    });
  });

  describe('formatDeadline', () => {
    it('formats a 30-day response deadline on track (green)', () => {
      const deadline: DeadlineInput = {
        type: 'response',
        dueDate: '2026-10-12T10:00:00Z',
      };
      const result = formatDeadline(deadline, BASE_DATE);

      expect(result.daysRemaining).toBe(15);
      expect(result.isOverdue).toBe(false);
      expect(result.isDueToday).toBe(false);
      expect(result.urgencyColor).toBe('green');
      expect(result.timeRemainingText).toBe('15 days left');
      expect(result.typeLabel).toBe('PIO 30-Day Response Window');
      expect(result.sectionReference).toBe('RTI Act Sec 7(1)');
      expect(result.urgencyLabel).toBe('On Track');
    });

    it('formats an impending deadline (yellow, 4 days left)', () => {
      const deadline: DeadlineInput = {
        type: 'first_appeal',
        dueDate: '2026-10-01T10:00:00Z',
      };
      const result = formatDeadline(deadline, BASE_DATE);

      expect(result.daysRemaining).toBe(4);
      expect(result.urgencyColor).toBe('yellow');
      expect(result.timeRemainingText).toBe('4 days left');
      expect(result.typeLabel).toBe('First Appeal Filing Window');
      expect(result.sectionReference).toBe('RTI Act Sec 19(1)');
      expect(result.urgencyLabel).toBe('Impending Deadline');
    });

    it('formats an urgent deadline (red, 1 day left)', () => {
      const deadline: DeadlineInput = {
        type: 'life_liberty',
        dueDate: '2026-09-28T10:00:00Z',
      };
      const result = formatDeadline(deadline, BASE_DATE);

      expect(result.daysRemaining).toBe(1);
      expect(result.urgencyColor).toBe('red');
      expect(result.timeRemainingText).toBe('1 day left');
      expect(result.typeLabel).toBe('Life & Liberty Urgent Response (48h)');
      expect(result.sectionReference).toBe('RTI Act Sec 7(1) Proviso');
      expect(result.urgencyLabel).toBe('Critical Urgency');
    });

    it('formats a deadline due today (red, 0 days left)', () => {
      const deadline: DeadlineInput = {
        type: 'response',
        dueDate: '2026-09-27T18:00:00Z',
      };
      const result = formatDeadline(deadline, BASE_DATE);

      expect(result.daysRemaining).toBe(0);
      expect(result.isDueToday).toBe(true);
      expect(result.isOverdue).toBe(false);
      expect(result.urgencyColor).toBe('red');
      expect(result.timeRemainingText).toBe('Due today');
      expect(result.urgencyLabel).toBe('Due Today');
    });

    it('formats an overdue deadline (red, -3 days)', () => {
      const deadline: DeadlineInput = {
        type: 'second_appeal',
        dueDate: '2026-09-24T10:00:00Z',
      };
      const result = formatDeadline(deadline, BASE_DATE);

      expect(result.daysRemaining).toBe(-3);
      expect(result.isOverdue).toBe(true);
      expect(result.isDueToday).toBe(false);
      expect(result.urgencyColor).toBe('red');
      expect(result.timeRemainingText).toBe('Overdue by 3 days');
      expect(result.urgencyLabel).toBe('Overdue');
      expect(result.sectionReference).toBe('RTI Act Sec 19(3)');
    });

    it('handles date-only strings (YYYY-MM-DD), Date objects, and numeric timestamps', () => {
      // Date-only string exactly 7 days ahead
      const dateStringDeadline: DeadlineInput = {
        type: 'response',
        dueDate: '2026-10-04',
      };
      expect(formatDeadline(dateStringDeadline, BASE_DATE).daysRemaining).toBe(7);
      expect(formatDeadline(dateStringDeadline, BASE_DATE).urgencyColor).toBe('green');

      // Date instance 2 days ahead
      const dateObjDeadline: DeadlineInput = {
        type: 'life_liberty',
        dueDate: new Date('2026-09-29T10:00:00Z'),
      };
      expect(formatDeadline(dateObjDeadline, BASE_DATE).daysRemaining).toBe(2);
      expect(formatDeadline(dateObjDeadline, BASE_DATE).urgencyColor).toBe('red');

      // Numeric timestamp 3 days ahead
      const timestampDeadline: DeadlineInput = {
        type: 'first_appeal',
        dueDate: new Date('2026-09-30T10:00:00Z').getTime(),
      };
      expect(formatDeadline(timestampDeadline, BASE_DATE).daysRemaining).toBe(3);
      expect(formatDeadline(timestampDeadline, BASE_DATE).urgencyColor).toBe('yellow');
    });

    it('formats overdue by exactly 1 day with singular phrasing', () => {
      const deadline: DeadlineInput = {
        type: 'response',
        dueDate: '2026-09-26T10:00:00Z',
      };
      const result = formatDeadline(deadline, BASE_DATE);
      expect(result.daysRemaining).toBe(-1);
      expect(result.isOverdue).toBe(true);
      expect(result.urgencyColor).toBe('red');
      expect(result.timeRemainingText).toBe('Overdue by 1 day');
    });

    it('handles leap-year vs non-leap-year transitions accurately', () => {
      // Non-leap year 2026 (28 days in Feb)
      const feb28_2026 = new Date('2026-02-28T12:00:00Z');
      expect(calculateDaysRemaining('2026-03-01T12:00:00Z', feb28_2026)).toBe(1);

      // Leap year 2028 (29 days in Feb)
      const feb28_2028 = new Date('2028-02-28T12:00:00Z');
      expect(calculateDaysRemaining('2028-02-29T12:00:00Z', feb28_2028)).toBe(1);
      expect(calculateDaysRemaining('2028-03-01T12:00:00Z', feb28_2028)).toBe(2);
    });

    it('throws when deadline object is missing or has invalid date', () => {
      expect(() => formatDeadline({ type: 'response', dueDate: '' })).toThrow();
      expect(() => formatDeadline(null as any)).toThrow();
    });
  });
});
