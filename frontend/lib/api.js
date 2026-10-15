const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8762'

function toQueryString(params) {
  if (!params) return ''
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value)
    }
  })
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

async function request(path, { method = 'GET', body, csrfToken } = {}) {
  const headers = {}

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`)
  }

  return data
}

export const api = {
  register: (payload) =>
    request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) =>
    request('/api/auth/login', { method: 'POST', body: payload }),
  logout: (csrfToken) =>
    request('/api/auth/logout', { method: 'POST', csrfToken }),
  getMe: () => request('/api/auth/getMe'),
  createProject: (payload, csrfToken) =>
    request('/api/projects', { method: 'POST', body: payload, csrfToken }),
  listProjects: (params) => request(`/api/projects${toQueryString(params)}`),
  getProject: (id) => request(`/api/projects/${id}`),
  rewriteDescription: (payload, csrfToken) =>
    request('/api/ai/rewrite-description', { method: 'POST', body: payload, csrfToken }),
  recommendSkills: (payload, csrfToken) =>
    request('/api/ai/recommend-skills', { method: 'POST', body: payload, csrfToken }),
}
