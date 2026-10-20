/**
 * RTI Assist API Client
 * Base URL configured from Vite environment: import.meta.env.VITE_API_URL
 * Feature Flag configured from Vite environment: import.meta.env.VITE_USE_MOCK
 */

import * as mockApi from './mockApi.js';

// Feature Flag: switch between real and mock implementations
export const isMockEnabled =
  import.meta.env.VITE_USE_MOCK === 'true' ||
  import.meta.env.VITE_USE_MOCK === true ||
  import.meta.env.VITE_USE_MOCK === '1';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '');
const LLM_SERVICE_URL = (import.meta.env.VITE_LLM_SERVICE_URL || '').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(statusCode, message, code = 'API_ERROR', details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const AUTH_TOKEN_KEY = 'rti_assist_token';
export const AUTH_USER_KEY = 'rti_assist_user';

export function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

async function request(endpoint, options = {}) {
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

  const token = getAuthToken();

  const finalHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const config = {
    ...restOptions,
    headers: finalHeaders,
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, config);

    if (!res.ok) {
      let errorData = {
        code: 'HTTP_ERROR',
        message: `HTTP ${res.status}: ${res.statusText}`,
        statusCode: res.status,
      };

      try {
        const parsed = await res.json();
        if (parsed.message) errorData.message = parsed.message;
        if (parsed.code) errorData.code = parsed.code;
        if (parsed.details) errorData.details = parsed.details;
      } catch {
        const text = await res.text().catch(() => null);
        if (text) errorData.message = text;
      }

      throw new ApiError(res.status, errorData.message, errorData.code, errorData.details);
    }

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const json = await res.json();
      if (json && typeof json === 'object' && 'data' in json && 'success' in json) {
        return json.data;
      }
      return json;
    }

    return await res.text();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      0,
      error instanceof Error ? error.message : 'Unknown network error occurred',
      'NETWORK_ERROR'
    );
  }
}

// Low-level fetch client export
export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
  getBaseUrl: () => BASE_URL,
};

// ==========================================
// UNIFIED API / MOCK SWITCHING FUNCTIONS
// ==========================================

export async function getAuthorities(params) {
  if (isMockEnabled) {
    return mockApi.getAuthorities(params);
  }
  return api.get('/authorities', { params });
}

export async function createCase(data) {
  if (isMockEnabled) {
    return mockApi.createCase(data);
  }
  return api.post('/cases', data);
}

export async function getCase(id) {
  if (isMockEnabled) {
    return mockApi.getCase(id);
  }
  return api.get(`/cases/${id}`);
}

export async function updateCase(id, updates) {
  if (isMockEnabled) {
    return mockApi.updateCase(id, updates);
  }
  return api.patch(`/cases/${id}`, updates);
}

export async function listCases(params) {
  if (isMockEnabled) {
    return mockApi.listCases(params);
  }
  return api.get('/cases', { params });
}

export async function getDeadlines(params) {
  if (isMockEnabled) {
    return mockApi.getDeadlines(params);
  }
  return api.get('/deadlines', { params });
}

export async function createAppealDraft(data) {
  if (isMockEnabled) {
    return mockApi.createAppealDraft(data);
  }
  return api.post('/appeals', data);
}

/**
 * Retry-once-on-failure wrapper for transient network or 5xx failures
 */
export async function withRetry(fn, retries = 1, delayMs = 500) {
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

export async function draftRequest(concern) {
  const query = typeof concern === 'string' ? concern.trim() : (concern?.concern || concern?.title || '');
  if (!query) {
    throw new ApiError(400, 'Concern description must be a non-empty string', 'VALIDATION_ERROR');
  }

  return withRetry(async () => {
    // 1. Prioritize calling the live LLM microservice if available
    if (LLM_SERVICE_URL) {
      try {
        const res = await fetch(`${LLM_SERVICE_URL}/draft-request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ concern: query }),
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
      } catch (llmErr) {
        console.warn('[RTI Assist] Live LLM microservice unreachable for draft-request, checking fallback:', llmErr?.message);
      }
    }

    // 2. Fallback to mock implementation if mock is enabled
    if (isMockEnabled) {
      const mockResult = await mockApi.draftRequest(query);
      return {
        category: mockResult.category || 'Public Administration',
        draftText: typeof mockResult === 'string' ? mockResult : (mockResult.draftText || mockResult.sampleLetterDraft || ''),
        suggestedAuthorityType: mockResult.suggestedAuthorityType || (mockResult.recommendedAuthority?.level || 'central'),
      };
    }

    // 3. Fallback to standard backend URL
    try {
      return await api.post('/draft-request', { concern: query });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : (err?.message || 'Failed to generate RTI draft from backend AI service');
      const statusCode = err?.statusCode || 500;
      throw new ApiError(statusCode, `Backend AI Service Error: ${message}`, 'AI_DRAFT_FAILED', err);
    }
  }, 1, 500);
}

export async function draftAppeal(caseId, appealType = 'first_appeal', caseDetails = null) {
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
      } catch (llmErr) {
        console.warn('[RTI Assist] Live LLM microservice unreachable for draft-appeal, checking fallback:', llmErr?.message);
      }
    }

    // 2. Fallback to mock implementation if mock is enabled
    if (isMockEnabled) {
      const mockResult = await mockApi.draftAppeal(caseId, appealType, caseDetails);
      return {
        draftText: typeof mockResult === 'string' ? mockResult : (mockResult.draftText || mockResult.draftContent || ''),
      };
    }

    // 3. Fallback to standard backend URL
    try {
      return await api.post('/draft-appeal', {
        caseId,
        appealType: formattedAppealType,
        caseDetails: formattedCaseDetails,
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : (err?.message || 'Failed to generate appeal draft from backend AI service');
      const statusCode = err?.statusCode || 500;
      throw new ApiError(statusCode, `Backend AI Service Error: ${message}`, 'AI_APPEAL_DRAFT_FAILED', err);
    }
  }, 1, 500);
}

export async function recommendAuthority(draftText) {
  if (isMockEnabled) {
    return mockApi.recommendAuthority(draftText);
  }
  return api.post('/cases/recommend-authority', typeof draftText === 'string' ? { draftText } : draftText);
}


export async function classifyResponse(responseText, requestContext = null) {
  if (!responseText || typeof responseText !== 'string' || !responseText.trim()) {
    throw new ApiError(400, 'Response text is required and must be non-empty', 'VALIDATION_ERROR');
  }

  return withRetry(async () => {
    // 1. Prioritize calling the live LLM microservice if available
    if (LLM_SERVICE_URL) {
      try {
        const res = await fetch(`${LLM_SERVICE_URL}/classify-response`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responseText: responseText.trim(), requestContext }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (llmErr) {
        console.warn('[RTI Assist] Live LLM microservice unreachable for classify-response:', llmErr?.message);
      }
    }

    // 2. Fallback to mock implementation if mock is enabled
    if (isMockEnabled) {
      return await mockApi.classifyResponse(responseText, requestContext);
    }

    // 3. Fallback to standard backend URL
    try {
      return await api.post('/classify-response', { responseText: responseText.trim(), requestContext });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : (err?.message || 'Failed to classify government response');
      const statusCode = err?.statusCode || 500;
      throw new ApiError(statusCode, `Backend AI Service Error: ${message}`, 'AI_CLASSIFICATION_FAILED', err);
    }
  }, 1, 500);
}

export async function saveResponseClassification(caseId, classificationData) {
  if (isMockEnabled) {
    return mockApi.saveResponseClassification(caseId, classificationData);
  }
  return api.patch(`/cases/${caseId}`, {
    responseClassification: classificationData,
    lastResponseStatus: classificationData.status,
    pioResponseSummary: classificationData.reason,
    pioResponseDate: new Date().toISOString(),
    status: classificationData.status === 'DENIED' || classificationData.status === 'EVASIVE_VAGUE'
      ? 'pio_replied'
      : undefined,
  });
}

// Attach helpers directly on api object so api.draftRequest(...) and api.recommendAuthority(...) can be called
api.draftRequest = draftRequest;
api.recommendAuthority = recommendAuthority;
api.classifyResponse = classifyResponse;
api.saveResponseClassification = saveResponseClassification;
api.getAuthorities = getAuthorities;
api.createCase = createCase;
api.getCase = getCase;
api.updateCase = updateCase;
api.listCases = listCases;
api.getDeadlines = getDeadlines;
api.createAppealDraft = createAppealDraft;
api.draftAppeal = draftAppeal;


export const casesApi = {
  list: listCases,
  getById: getCase,
  create: createCase,
  update: (id, updates) =>
    isMockEnabled
      ? mockApi.getCase(id).then((c) => ({ ...c, ...updates }))
      : api.patch(`/cases/${id}`, updates),
  delete: (id) =>
    isMockEnabled
      ? Promise.resolve({ success: true })
      : api.delete(`/cases/${id}`),
  saveResponseClassification,
};

export const authoritiesApi = {
  list: getAuthorities,
  getById: (id) =>
    isMockEnabled
      ? mockApi.getAuthorities().then((list) => {
          const found = list.find((a) => a.id === id);
          if (!found) throw new Error(`Authority ${id} not found`);
          return found;
        })
      : api.get(`/authorities/${id}`),
};

export const deadlinesApi = {
  list: getDeadlines,
  markCompleted: (id) =>
    isMockEnabled
      ? Promise.resolve({ success: true })
      : api.patch(`/deadlines/${id}/complete`),
};

export const appealsApi = {
  getById: (id) =>
    isMockEnabled
      ? mockApi.getDeadlines().then(() => mockApi.createAppealDraft({ id }))
      : api.get(`/appeals/${id}`),
  create: createAppealDraft,
  generateFromCase: draftAppeal,
};

export async function sendOtp(email, name) {
  if (isMockEnabled) {
    return { success: true, message: 'Mock OTP sent', devOtp: '123456' };
  }
  return api.post('/auth/send-otp', { email, name });
}

export async function verifyOtp(email, otp, name) {
  if (isMockEnabled) {
    return {
      success: true,
      token: 'mock-jwt-token',
      user: { id: 'usr-mock', email, name: name || 'Citizen User', role: 'citizen', emailVerified: true },
    };
  }
  return api.post('/auth/verify-otp', { email, otp, name });
}

export async function setPassword(password, email) {
  if (isMockEnabled) {
    return { success: true, message: 'Password set successfully (mock)' };
  }
  return api.post('/auth/set-password', { password, email });
}

export async function checkEmail(email) {
  if (isMockEnabled) {
    return { exists: false, hasPassword: false };
  }
  return api.post('/auth/check-email', { email });
}

api.sendOtp = sendOtp;
api.verifyOtp = verifyOtp;
api.setPassword = setPassword;
api.checkEmail = checkEmail;

export const authApi = {
  sendOtp,
  verifyOtp,
  setPassword,
  checkEmail,
  login: (email, password) => api.post('/auth/login', { email, password }),
};


