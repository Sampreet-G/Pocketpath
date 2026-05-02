import { api } from './client';

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  register: (body) => api.post('/auth/register', body),
  login:    (body) => api.post('/auth/login', body),
  me:       ()     => api.get('/auth/me'),
};

// ── Dashboard ─────────────────────────────────────────────────
export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

// ── Transactions ──────────────────────────────────────────────
export const txApi = {
  list:   (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/transactions${qs ? '?' + qs : ''}`);
  },
  create: (body)  => api.post('/transactions', body),
  update: (id, body) => api.put(`/transactions/${id}`, body),
  delete: (id)    => api.delete(`/transactions/${id}`),
};

// ── Goals ─────────────────────────────────────────────────────
export const goalsApi = {
  list:   ()         => api.get('/goals'),
  create: (body)     => api.post('/goals', body),
  update: (id, body) => api.put(`/goals/${id}`, body),
  delete: (id)       => api.delete(`/goals/${id}`),
};

// ── Insights ──────────────────────────────────────────────────
export const insightsApi = {
  trend:      () => api.get('/insights/trend'),
  categories: () => api.get('/insights/categories'),
  budgets:    () => api.get('/insights/budgets'),
  setBudget:  (body) => api.post('/insights/budgets', body),
};

// ── Reflect ───────────────────────────────────────────────────
export const reflectApi = {
  list:   (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/reflect${qs ? '?' + qs : ''}`);
  },
  create: (body)     => api.post('/reflect', body),
  update: (id, body) => api.put(`/reflect/${id}`, body),
  delete: (id)       => api.delete(`/reflect/${id}`),
};

// ── Profile ───────────────────────────────────────────────────
export const profileApi = {
  get:            ()     => api.get('/profile'),
  update:         (body) => api.put('/profile', body),
  changePassword: (body) => api.put('/profile/password', body),
};