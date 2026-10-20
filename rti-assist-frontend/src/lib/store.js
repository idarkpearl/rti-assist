import { useState, useEffect } from 'react';
import { mockCases, mockAuthorities, mockAppealDrafts } from './mockData.js';

const CASES_STORAGE_KEY = 'rti_assist_cases';
const APPEALS_STORAGE_KEY = 'rti_assist_appeals';

export function getStoredCases() {
  try {
    const raw = localStorage.getItem(CASES_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const fakeIds = ['case-101', 'case-102', 'case-103', 'case-104'];
    const cleaned = parsed.filter(
      (c) => !fakeIds.includes(c.id) && c.applicant?.email !== 'vikram.roy@example.com'
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveStoredCases(cases) {
  try {
    localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(cases || []));
  } catch (err) {
    console.error('Failed to persist cases to localStorage', err);
  }
}

export function getStoredAppeals() {
  try {
    const raw = localStorage.getItem(APPEALS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const fakeIds = ['appeal-201', 'appeal-202'];
    const cleaned = parsed.filter(
      (a) =>
        !fakeIds.includes(a.id) &&
        !['case-101', 'case-102', 'case-103'].includes(a.caseId) &&
        a.appellant?.email !== 'vikram.roy@example.com'
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(APPEALS_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveStoredAppeals(appeals) {
  try {
    localStorage.setItem(APPEALS_STORAGE_KEY, JSON.stringify(appeals || []));
  } catch (err) {
    console.error('Failed to persist appeals to localStorage', err);
  }
}

export function useCaseStore() {
  const [cases, setCases] = useState(getStoredCases);
  const [authorities] = useState(mockAuthorities);
  const [appeals, setAppeals] = useState(getStoredAppeals);

  useEffect(() => {
    saveStoredCases(cases);
  }, [cases]);

  useEffect(() => {
    saveStoredAppeals(appeals);
  }, [appeals]);

  const addCase = (newCase) => {
    setCases((prev) => [newCase, ...prev]);
  };

  const updateCase = (id, updates) => {
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
  };

  const addAppeal = (newAppeal) => {
    setAppeals((prev) => [newAppeal, ...prev]);
  };

  const updateAppeal = (id, updates) => {
    setAppeals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
    );
  };

  return {
    cases,
    authorities,
    appeals,
    addCase,
    updateCase,
    addAppeal,
    updateAppeal,
  };
}
