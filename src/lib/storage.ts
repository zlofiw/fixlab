import type { ServiceTicket } from '../types/domain.ts'

const STORAGE_KEY = 'fixlab.tickets.v2'

function isTicketLike(value: unknown): value is ServiceTicket {
  if (!value || typeof value !== 'object') {
    return false
  }

  const ticket = value as Partial<ServiceTicket>
  return (
    typeof ticket.id === 'string' &&
    typeof ticket.ticketNumber === 'string' &&
    typeof ticket.accessCode === 'string' &&
    typeof ticket.createdAt === 'string' &&
    typeof ticket.request === 'object' &&
    typeof ticket.estimate === 'object' &&
    Array.isArray(ticket.timeline)
  )
}

export function loadTickets(): ServiceTicket[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isTicketLike)
  } catch {
    return []
  }
}

export function saveTickets(tickets: ServiceTicket[]): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets))
}
