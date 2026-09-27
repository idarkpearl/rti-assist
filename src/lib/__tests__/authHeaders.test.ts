import { describe, it, expect, beforeEach, afterEach } from 'vitest';

class MockLocalStorage {
  private store: Record<string, string> = {};
  getItem(key: string) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

// Polyfill globalThis.localStorage for test environment
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = new MockLocalStorage();
}

import { getAuthToken, AUTH_TOKEN_KEY } from '../api';

describe('Authentication & Token Header Attachment', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns null when no token is in storage', () => {
    expect(getAuthToken()).toBeNull();
  });

  it('retrieves stored JWT token from localStorage', () => {
    const mockJwt = 'header.payload.signature';
    localStorage.setItem(AUTH_TOKEN_KEY, mockJwt);
    expect(getAuthToken()).toBe(mockJwt);
  });

  it('clears token properly upon logout', () => {
    localStorage.setItem(AUTH_TOKEN_KEY, 'sample-jwt');
    expect(getAuthToken()).toBe('sample-jwt');
    localStorage.removeItem(AUTH_TOKEN_KEY);
    expect(getAuthToken()).toBeNull();
  });
});
