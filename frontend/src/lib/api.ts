const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const isRemote = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const envUrl: string | undefined = import.meta.env.VITE_API_URL;
    if (isRemote) {
      if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
        return '/api/v1';
      }
    }
    if (envUrl && envUrl.startsWith('http')) {
      return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl.replace(/\/$/, '')}/api/v1`;
    }
  }
  return '/api/v1';
};

const API_BASE = getApiBase();

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'API Error' }));
      throw new Error(err.detail || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`API call failed to ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (credentials: { identifier?: string; email?: string; password?: string; role?: string }) =>
    fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  demoLogin: (role: string) => fetchApi('/auth/demo-login', { method: 'POST', body: JSON.stringify({ role }) }),
  getCurrentUser: (role: string) => fetchApi(`/auth/me?role=${role}`),

  // Officials Workflow (Police / Registration / Assisted Entry)
  registerVictim: (payload: any) => fetchApi('/officials/register-victim', { method: 'POST', body: JSON.stringify(payload) }),
  submitAssistedCheckin: (payload: any) => fetchApi('/officials/assisted-checkin', { method: 'POST', body: JSON.stringify(payload) }),
  getOfficialCases: () => fetchApi('/officials/cases'),

  // Checkins
  submitCheckin: (payload: any) => fetchApi('/checkins', { method: 'POST', body: JSON.stringify(payload) }),
  getVictimCheckins: (victimId: string) => fetchApi(`/checkins/${victimId}`),
  getVictimTrend: (victimId: string) => fetchApi(`/checkins/${victimId}/trend`),

  // Chat
  createChatSession: (victimId: string) => fetchApi('/chat/session', { method: 'POST', body: JSON.stringify({ victim_id: victimId }) }),
  sendChatMessage: (sessionId: string, victimId: string, messageText: string) =>
    fetchApi('/chat/message', { method: 'POST', body: JSON.stringify({ session_id: sessionId, victim_id: victimId, message_text: messageText }) }),

  // NLP & Risk
  analyzeText: (text: string) => fetchApi('/nlp/analyze', { method: 'POST', body: JSON.stringify({ text }) }),
  getLatestRisk: (victimId: string) => fetchApi(`/risk/${victimId}/latest`),
  getRiskHistory: (victimId: string) => fetchApi(`/risk/${victimId}/history`),

  // Alerts & Interventions
  getAlerts: (status?: string) => fetchApi(`/alerts${status ? `?status=${status}` : ''}`),
  acknowledgeAlert: (alertId: string) => fetchApi(`/alerts/${alertId}/acknowledge`, { method: 'POST' }),
  resolveAlert: (alertId: string) => fetchApi(`/alerts/${alertId}/resolve`, { method: 'POST' }),
  createIntervention: (payload: any) => fetchApi('/interventions', { method: 'POST', body: JSON.stringify(payload) }),
  getVictimInterventions: (victimId: string) => fetchApi(`/interventions/${victimId}`),
  getAllInterventions: () => fetchApi('/interventions'),

  // Threats & Cases
  reportThreat: (payload: any) => fetchApi('/threats', { method: 'POST', body: JSON.stringify(payload) }),
  getVictimThreats: (victimId: string) => fetchApi(`/threats/${victimId}`),
  getAllThreats: () => fetchApi('/threats'),
  getCases: () => fetchApi('/cases'),

  // Dashboard & ML
  getPoliceDashboard: () => fetchApi('/dashboard/police'),
  getCounsellorDashboard: () => fetchApi('/dashboard/counsellor'),
  getProtectionDashboard: () => fetchApi('/dashboard/protection'),
  getDistrictDashboard: () => fetchApi('/dashboard/district'),
  getAdminDashboard: () => fetchApi('/dashboard/admin'),
  getMLMetrics: () => fetchApi('/ml/metrics'),
  get: (endpoint: string) => fetchApi(endpoint),
  post: (endpoint: string, body?: any) => fetchApi(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
};
