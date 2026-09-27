import { useState, useEffect } from 'react';
import { mockCases, mockAuthorities, mockAppealDrafts } from './mockData.js';

const CASES_STORAGE_KEY = 'rti_assist_cases';
const APPEALS_STORAGE_KEY = 'rti_assist_appeals';

export function getStoredCases() {
  try {
    const raw = localStorage.getItem(CASES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(mockCases));
      return mockCases;
    }
    return JSON.parse(raw);
  } catch {
    return mockCases;
  }
}

export function saveStoredCases(cases) {
  try {
    localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(cases));
  } catch (err) {
    console.error('Failed to persist cases to localStorage', err);
  }
}

export function getStoredAppeals() {
  try {
    const raw = localStorage.getItem(APPEALS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(APPEALS_STORAGE_KEY, JSON.stringify(mockAppealDrafts));
      return mockAppealDrafts;
    }
    return JSON.parse(raw);
  } catch {
    return mockAppealDrafts;
  }
}

export function saveStoredAppeals(appeals) {
  try {
    localStorage.setItem(APPEALS_STORAGE_KEY, JSON.stringify(appeals));
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
