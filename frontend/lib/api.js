const API_URL = process.env.NEXT_API_URL;

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

async function request(
  path,
  { method = 'GET', body, formData, csrfToken, signal } = {},
) {
  const headers = {}

  if (body !== undefined && !formData) {
    headers['Content-Type'] = 'application/json'
  }

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    signal,
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
  updateProfile: (payload, csrfToken) =>
    request('/api/auth/profile', { method: 'PATCH', body: payload, csrfToken }),
  changePassword: (payload, csrfToken) =>
    request('/api/auth/password', { method: 'PATCH', body: payload, csrfToken }),
  uploadResume: (file, csrfToken) => {
    const formData = new FormData()
    formData.append('resume', file)
    return request('/api/auth/resume', {
      method: 'POST',
      formData,
      csrfToken,
    })
  },
  deleteResume: (csrfToken) =>
    request('/api/auth/resume', { method: 'DELETE', csrfToken }),
  downloadResume: async () => {
    const res = await fetch(`${API_URL}/api/auth/resume`, {
      credentials: 'include',
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || `Request failed (${res.status})`)
    }
    return res.blob()
  },
  getDashboard: (signal) => request('/api/dashboard', { signal }),
  createProject: (payload, csrfToken) =>
    request('/api/projects', { method: 'POST', body: payload, csrfToken }),
  listProjects: (params, signal) =>
    request(`/api/projects${toQueryString(params)}`, { signal }),
  getProject: (id, signal) => request(`/api/projects/${id}`, { signal }),
  applyToRole: (projectId, roleId, payload, csrfToken) => {
    const formData = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      if (value instanceof File) {
        formData.append(key, value)
      } else if (typeof value === "boolean") {
        formData.append(key, value ? "true" : "false")
      } else if (value !== "") {
        formData.append(key, value)
      }
    })
    return request(`/api/projects/${projectId}/roles/${roleId}/applications`, {
      method: "POST",
      formData,
      csrfToken,
    })
  },
  downloadApplicationResume: async (projectId, applicationId) => {
    const res = await fetch(
      `${API_URL}/api/projects/${projectId}/applications/${applicationId}/resume`,
      { credentials: "include" }
    )
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || `Request failed (${res.status})`)
    }
    return res.blob()
  },
  rewriteDescription: (payload, csrfToken) =>
    request('/api/ai/rewrite-description', { method: 'POST', body: payload, csrfToken }),
  recommendSkills: (payload, csrfToken) =>
    request('/api/ai/recommend-skills', { method: 'POST', body: payload, csrfToken }),
}
