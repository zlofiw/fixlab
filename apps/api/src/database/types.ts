import type { ServiceTicket } from '../domain'

export interface AdminUserRecord {
  id: string
  username: string
  passwordHash: string
  createdAt: string
}

export interface AdminSessionRecord {
  id: string
  userId: string
  tokenHash: string
  createdAt: string
  expiresAt: string
  lastSeenAt: string
}

export interface AdminSummary {
  total: number
  active: number
  ready: number
  express: number
  totalAmount: number
  stageCounts: Record<ServiceTicket['timeline'][number]['stage'], number>
}
