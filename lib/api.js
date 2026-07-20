const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"

const USER_KEY = "grouphub_user"

export function getAccessToken() {
  return ""
}

export function setAuthSession({ user }) {
  if (typeof window === "undefined") return

  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

export function getStoredUser() {
  if (typeof window === "undefined") return null

  const value = window.localStorage.getItem(USER_KEY)
  if (!value) return null

  try {
    return JSON.parse(value)
  } catch (_error) {
    return null
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(USER_KEY)
}

async function parseResponse(response) {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const details = Array.isArray(payload?.details)
      ? payload.details
          .map((detail) => {
            const field = detail.path?.replace(/^body\./, "")
            return field ? `${field}: ${detail.message}` : detail.message
          })
          .join("; ")
      : ""
    const error = new Error(details || payload?.message || "Request failed")
    error.status = response.status
    error.details = payload?.details
    throw error
  }

  return payload
}

async function refreshAccessToken() {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })

  const payload = await parseResponse(response)
  setAuthSession(payload.data)
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {})

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json")
  }

  const request = {
    ...options,
    headers,
    credentials: "include",
  }

  let response = await fetch(`${API_BASE_URL}${path}`, request)

  if (response.status === 401 && options.retryOnUnauthorized !== false) {
    try {
      await refreshAccessToken()
      response = await fetch(`${API_BASE_URL}${path}`, request)
    } catch (_error) {
      clearAuthSession()
    }
  }

  return parseResponse(response)
}

export function toQueryString(params) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      query.set(key, value)
    }
  })

  const value = query.toString()
  return value ? `?${value}` : ""
}
