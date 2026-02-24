import type { ServiceRequestInput, ServiceTicket, TicketStage } from '../types/domain.ts'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function buildUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  const text = await response.text()
  const payload = text ? (JSON.parse(text) as unknown) : null

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : `HTTP ${response.status}`
    throw new Error(message)
  }

  return payload as T
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
  adminSummary: () => requestJson('/api/admin/summary'),
  health: () => requestJson('/api/health'),
}
