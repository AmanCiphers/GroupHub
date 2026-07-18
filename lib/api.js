const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"

const ACCESS_TOKEN_KEY = "grouphub_access_token"
const USER_KEY = "grouphub_user"

export function getAccessToken() {
  if (typeof window === "undefined") return ""
  return window.localStorage.getItem(ACCESS_TOKEN_KEY) || ""
}

export function setAuthSession({ accessToken, user }) {
  if (typeof window === "undefined") return

  if (accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  }

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
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
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
  return payload.data.accessToken
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const token = getAccessToken()

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json")
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const request = {
    ...options,
    headers,
    credentials: "include",
  }

  let response = await fetch(`${API_BASE_URL}${path}`, request)

  if (response.status === 401 && token && options.retryOnUnauthorized !== false) {
    try {
      const nextToken = await refreshAccessToken()
      headers.set("Authorization", `Bearer ${nextToken}`)
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
