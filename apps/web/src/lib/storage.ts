const AUTH_TOKEN_KEY = 'fixlab.auth.token'

export function loadAuthToken(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY) ?? ''
}

export function saveAuthToken(token: string): void {
  if (typeof window === 'undefined') {
    return
  }

  if (!token) {
    window.localStorage.removeItem(AUTH_TOKEN_KEY)
    return
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
}
