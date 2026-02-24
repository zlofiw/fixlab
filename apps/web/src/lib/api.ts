import type { AdminSummary, ServiceRequestInput, ServiceTicket, TicketStage } from '../types/domain.ts'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  const text = await response.text()
  let payload: unknown = null

  if (text) {
    try {
      payload = JSON.parse(text) as unknown
    } catch {
      payload = {
        message: 'Сервер вернул некорректный ответ',
      }
    }
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : `Ошибка сервера (${response.status})`
    throw new Error(message)
  }

  return payload as T
}

export interface AdminAuthPayload {
  user: {
    id: string
    username: string
  }
  session: {
    expiresAt: string
    lastSeenAt?: string
  }
}

export interface AdminSummaryPayload {
  total: number
  active: number
  ready: number
  express: number
  totalAmount: number
  stageCounts: {
    accepted: number
    diagnostics: number
    approval: number
    repair: number
    quality: number
    ready: number
  }
}

export const ticketsApi = {
  list: () => requestJson<ServiceTicket[]>('/api/tickets'),
  create: (request: ServiceRequestInput) =>
    requestJson<ServiceTicket>('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
  updateStage: (ticketId: string, stage: TicketStage) =>
    requestJson<ServiceTicket>(`/api/tickets/${ticketId}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    }),
  lookup: (ticketNumber: string, accessCode: string) =>
    requestJson<ServiceTicket>(
      `/api/tickets/lookup?ticketNumber=${encodeURIComponent(ticketNumber)}&accessCode=${encodeURIComponent(accessCode)}`,
    ),
<<<<<<< HEAD
  adminSummary: () => requestJson<AdminSummaryPayload>('/api/admin/summary'),
=======
  adminSummary: () => requestJson<AdminSummary>('/api/admin/summary'),
>>>>>>> 4a6a20737d9270cb58508fd898656fc41197ed01
  health: () => requestJson('/api/health'),
  authMe: () => requestJson<AdminAuthPayload>('/api/auth/me'),
  authLogin: (username: string, password: string) =>
    requestJson<AdminAuthPayload>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  authLogout: () =>
    requestJson<{ ok: boolean }>('/api/auth/logout', {
      method: 'POST',
    }),
}
