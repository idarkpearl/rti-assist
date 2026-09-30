/**
 * RTI Assist API Client & Schema
 * Base URL: import.meta.env.VITE_API_URL
 * Feature Flag: import.meta.env.VITE_USE_MOCK
 */

import * as mockApi from './mockApi';

export const isMockEnabled =
  import.meta.env.VITE_USE_MOCK === 'true' ||
  import.meta.env.VITE_USE_MOCK === true ||
  import.meta.env.VITE_USE_MOCK === '1';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '');
const LLM_SERVICE_URL = (import.meta.env.VITE_LLM_SERVICE_URL || 'http://localhost:5000').replace(/\/+$/, '');

// ==========================================
// 1. DOMAIN MODELS & TYPES
// ==========================================

export type CaseStatus =
  | 'draft'
  | 'submitted'
  | 'transferred'
  | 'pio_replied'
  | 'first_appeal_pending'
  | 'first_appeal_disposed'
  | 'second_appeal_pending'
  | 'closed';

export type AuthorityLevel = 'central' | 'state' | 'municipal' | 'statutory';

export type DeadlineType =
  | 'pio_response'
  | 'life_and_liberty'
  | 'third_party_notice'
  | 'first_appeal_window'
  | 'first_appeal_decision'
  | 'second_appeal_window'
  | 'hearing';

export type DeadlineStatus = 'pending' | 'due_soon' | 'overdue' | 'completed' | 'waived';

export type AppealGround =
  | 'no_response'
  | 'malafide_denial'
  | 'excessive_fee_demanded'
  | 'misleading_or_incomplete_info'
  | 'exemptions_misapplied'
  | 'transfer_delayed'
  | 'other';

export type AppealStatus = 'draft' | 'ready_to_send' | 'submitted' | 'hearing_scheduled' | 'disposed';

export interface Authority {
  id: string;
  name: string;
  code?: string;
  ministry?: string;
  department?: string;
  level: AuthorityLevel;
  jurisdiction?: 'Central' | 'Delhi NCT' | string;
  categoryTags?: string[];
  state?: string;
  portalUrl?: string;
  applicationFee: number;
  paymentModes: string[];

  pio: {
    name: string;
    designation: string;
    email: string;
    phone?: string;
    address: string;
  };
  firstAppellateAuthority?: {
    name: string;
    designation: string;
    email: string;
    phone?: string;
    address: string;
  };
  guidelinesUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Deadline {
  id: string;
  caseId: string;
  title: string;
  type: DeadlineType;
  dueDate: string;
  calculatedDays: number;
  daysRemaining: number;
  status: DeadlineStatus;
  isLifeAndLiberty?: boolean;
  actSectionReference?: string;
  completedAt?: string | null;
  reminderSent?: boolean;
  notes?: string;
}

export interface AppealDraft {
  id: string;
  caseId: string;
  type: 'first_appeal' | 'second_appeal';
  appealNumber?: string;
  authorityId: string;
  authorityName: string;
  appellateAuthorityName: string;
  appellateAuthorityDesignation: string;
  appellant: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  originalApplicationDate: string;
  originalPioName?: string;
  groundOfAppeal: AppealGround;
  groundsSummary: string;
  detailedGrounds: string[];
  reliefSought: string;
  draftContent: string;
  status: AppealStatus;
  submissionDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Case {
  id: string;
  trackingNumber: string;
  title: string;
  subjectCategory: string;
  summary: string;
  description: string;
  queries: string[];
  applicant: {
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
    isBelowPovertyLine?: boolean;
  };
  authorityId: string;
  authority?: Authority;
  status: CaseStatus;
  isLifeAndLiberty: boolean;
  filingDate: string;
  submissionMode: 'online_portal' | 'registered_post' | 'in_person' | 'draft';
  feePaid: number;
  paymentReference?: string;
  deadlines: Deadline[];
  appeals: AppealDraft[];
  documents?: any[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 2. AI DRAFT CONTRACT TYPES (SPRING BOOT)
// ==========================================

export interface DraftRequestPayload {
  concern: string;
}

export interface DraftRequestResponse {
  category: string;
  draftText: string;
  suggestedAuthorityType: string;
}

export interface DraftAppealPayload {
  caseId: string;
  appealType: string;
  caseDetails?: Record<string, unknown> | null;
}

export interface DraftAppealResponse {
  draftText: string;
}

// ==========================================
// 3. ERROR HANDLING & RETRY WRAPPER
// ==========================================

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(statusCode: number, message: string, code = 'API_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Retry-once-on-failure wrapper for transient network or 5xx failures
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 1,
  delayMs: number = 500
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt > retries) {
        throw error;
      }
      console.warn(`[RTI Assist API] Request failed (attempt ${attempt}/${retries + 1}). Retrying in ${delayMs}ms...`, error);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

// ==========================================
// 4. LOW-LEVEL FETCH CLIENT
// ==========================================

async function request<T>(endpoint: string, options: any = {}): Promise<T> {
  const { params, body, headers, ...restOptions } = options;

  let url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('rti_assist_token') : null;

  const config = {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      let errorData = {
        code: `HTTP_${res.status}`,
        message: `HTTP ${res.status}: ${res.statusText}`,
      };
      try {
        const parsed = await res.json();
        if (parsed.message) errorData.message = parsed.message;
        if (parsed.code) errorData.code = parsed.code;
      } catch {
        const text = await res.text().catch(() => null);
        if (text) errorData.message = text;
      }
      throw new ApiError(res.status, errorData.message, errorData.code);
    }

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const json = await res.json();
      return (json && typeof json === 'object' && 'data' in json ? json.data : json) as T;
    }
    return (await res.text()) as unknown as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, err?.message || 'Network error occurred', 'NETWORK_ERROR', err);
  }
}

export const api = {
  get: <T>(endpoint: string, options?: any) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: any, options?: any) => request<T>(endpoint, { ...options, method: 'POST', body }),
  put: <T>(endpoint: string, body?: any, options?: any) => request<T>(endpoint, { ...options, method: 'PUT', body }),
  patch: <T>(endpoint: string, body?: any, options?: any) => request<T>(endpoint, { ...options, method: 'PATCH', body }),
  delete: <T>(endpoint: string, options?: any) => request<T>(endpoint, { ...options, method: 'DELETE' }),
  getBaseUrl: () => BASE_URL,
};

// ==========================================
// 5. CORE ENDPOINT FUNCTIONS
// ==========================================

export async function getAuthorities(params?: { search?: string; level?: string }): Promise<Authority[]> {
  if (isMockEnabled) return mockApi.getAuthorities(params);
  return api.get<Authority[]>('/authorities', { params });
}

export async function createCase(data: Partial<Case>): Promise<Case> {
  if (isMockEnabled) return mockApi.createCase(data);
  return api.post<Case>('/cases', data);
}

export async function getCase(id: string): Promise<Case> {
  if (isMockEnabled) return mockApi.getCase(id);
  return api.get<Case>(`/cases/${id}`);
}

export async function updateCase(id: string, updates: Partial<Case>): Promise<Case> {
  if (isMockEnabled) return (mockApi as any).updateCase(id, updates);
  return api.patch<Case>(`/cases/${id}`, updates);
}

export async function listCases(params?: { status?: string; search?: string; limit?: number }): Promise<Case[]> {
  if (isMockEnabled) return mockApi.listCases(params);
  return api.get<Case[]>('/cases', { params });
}

export async function getDeadlines(params?: { caseId?: string; status?: string }): Promise<Deadline[]> {
  if (isMockEnabled) return mockApi.getDeadlines(params);
  return api.get<Deadline[]>('/deadlines', { params });
}

export async function createAppealDraft(data: Partial<AppealDraft>): Promise<AppealDraft> {
  if (isMockEnabled) return mockApi.createAppealDraft(data);
  return api.post<AppealDraft>('/appeals', data);
}

/**
 * Calls Spring Boot endpoint POST ${baseURL}/draft-request
 * Backend owns the Claude / Gemini API call and prompt engineering.
 * Retries once on failure before throwing an informative ApiError.
 */
export async function draftRequest(concern: string): Promise<DraftRequestResponse> {
  if (!concern || typeof concern !== 'string' || !concern.trim()) {
    throw new ApiError(400, 'Concern description must be a non-empty string', 'VALIDATION_ERROR');
  }

  return withRetry(async () => {
    // 1. Prioritize calling the live LLM microservice if available
    if (LLM_SERVICE_URL) {
      try {
        const res = await fetch(`${LLM_SERVICE_URL}/draft-request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ concern: concern.trim() }),
        });
        if (res.ok) {
          const data = await res.json();
          return {
            category: data.category || 'other',
            draftText: data.draftText || '',
            suggestedAuthorityType: data.suggestedAuthorityType || 'Public Authority',
            disclaimer: data.disclaimer || '',
          };
        }
      } catch (llmErr: any) {
        console.warn('[RTI Assist] Live LLM microservice unreachable for draft-request, checking fallback:', llmErr?.message);
      }
    }

    // 2. Fallback to mock implementation if mock is enabled
    if (isMockEnabled) {
      const mockResult: any = await mockApi.draftRequest(concern);
      return {
        category: mockResult.category || 'Public Administration',
        draftText: typeof mockResult === 'string' ? mockResult : (mockResult.draftText || mockResult.sampleLetterDraft || ''),
        suggestedAuthorityType: mockResult.suggestedAuthorityType || (mockResult.recommendedAuthority?.level || 'central'),
      };
    }

    // 3. Fallback to standard backend URL
    try {
      return await api.post<DraftRequestResponse>('/draft-request', { concern: concern.trim() });
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : (err?.message || 'Failed to generate RTI draft from backend AI service');
      const statusCode = err?.statusCode || 500;
      throw new ApiError(statusCode, `Backend AI Service Error: ${message}`, 'AI_DRAFT_FAILED', err);
    }
  }, 1, 500);
}

/**
 * Calls live LLM microservice or backend endpoint POST /draft-appeal
 */
export async function draftAppeal(
  caseId: string,
  appealType: string = 'first_appeal',
  caseDetails?: any
): Promise<DraftAppealResponse> {
  if (!caseId) {
    throw new ApiError(400, 'Case ID is required to draft an appeal', 'VALIDATION_ERROR');
  }

  return withRetry(async () => {
    const formattedAppealType = String(appealType).toLowerCase().includes('second') ? 'second' : 'first';
    const formattedCaseDetails = {
      registrationNumber: caseDetails?.trackingNumber || caseDetails?.registrationNumber || caseDetails?.id || String(caseId),
      filingDate: caseDetails?.filingDate || caseDetails?.filedAt || caseDetails?.createdAt || new Date().toISOString().split('T')[0],
      authorityName: caseDetails?.authority?.name || caseDetails?.authorityName || (typeof caseDetails?.authority === 'string' ? caseDetails.authority : 'Concerned Public Authority'),
      originalRequestText: caseDetails?.originalRequestText || (Array.isArray(caseDetails?.queries) ? caseDetails.queries.join('\n') : caseDetails?.description) || caseDetails?.summary || 'Information requested under RTI Act, 2005.',
      responseReceived: caseDetails?.responseReceived || caseDetails?.pioResponse?.content || '',
    };

    // 1. Prioritize calling the live LLM microservice if available
    if (LLM_SERVICE_URL) {
      try {
        const res = await fetch(`${LLM_SERVICE_URL}/draft-appeal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appealType: formattedAppealType,
            caseDetails: formattedCaseDetails,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          return {
            draftText: data.draftText || '',
            disclaimer: data.disclaimer || '',
          };
        }
      } catch (llmErr: any) {
        console.warn('[RTI Assist] Live LLM microservice unreachable for draft-appeal, checking fallback:', llmErr?.message);
      }
    }

    // 2. Fallback to mock implementation if mock is enabled
    if (isMockEnabled) {
      const mockResult: any = await mockApi.draftAppeal(caseId, appealType);
      return {
        draftText: typeof mockResult === 'string' ? mockResult : (mockResult.draftText || mockResult.draftContent || ''),
      };
    }

    // 3. Fallback to standard backend URL
    try {
      return await api.post<DraftAppealResponse>('/draft-appeal', {
        caseId,
        appealType: formattedAppealType,
        caseDetails: formattedCaseDetails,
      });
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : (err?.message || 'Failed to generate appeal draft from backend AI service');
      const statusCode = err?.statusCode || 500;
      throw new ApiError(statusCode, `Backend AI Service Error: ${message}`, 'AI_APPEAL_DRAFT_FAILED', err);
    }
  }, 1, 500);
}

export async function recommendAuthority(draftText: string): Promise<any> {
  if (isMockEnabled) return (mockApi as any).recommendAuthority(draftText);
  return api.post<any>('/cases/recommend-authority', { draftText });
}

// Attach convenience methods to api export
(api as any).draftRequest = draftRequest;
(api as any).draftAppeal = draftAppeal;
(api as any).recommendAuthority = recommendAuthority;
(api as any).getAuthorities = getAuthorities;
(api as any).createCase = createCase;
(api as any).getCase = getCase;
(api as any).updateCase = updateCase;
(api as any).listCases = listCases;
(api as any).getDeadlines = getDeadlines;
(api as any).createAppealDraft = createAppealDraft;
(api as any).withRetry = withRetry;
