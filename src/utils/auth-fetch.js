/**
 * Wrapper around fetch that automatically includes the Authorization header
 * with the Bearer token from localStorage for authenticated API calls.
 */
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem('auth_token')
  const headers = {
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(url, {
    ...options,
    headers,
  })
}
