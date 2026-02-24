import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { hashPassword, hashToken } from '../auth/crypto'
import type { AdminSessionRecord, AdminSummary, AdminUserRecord } from './types'
import type { ServiceTicket, TicketStage } from '../domain'
import { TICKET_STAGES } from '../domain'
import { getTrackingSnapshot } from '../repair-engine'

type DatabaseState = {
  users: AdminUserRecord[]
  sessions: AdminSessionRecord[]
  tickets: ServiceTicket[]
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function isLegacyDemoTicket(ticket: ServiceTicket): boolean {
  const request = ticket.request

  return (
    (request.phone === '+7 (707) 444-55-66' &&
      request.email === 'aigerim@sample.kz' &&
      request.brand === 'Samsung' &&
      request.model === 'Galaxy S22') ||
    (request.phone === '+7 (701) 111-22-33' &&
      request.email === 'alikhan@sample.kz' &&
      request.brand === 'Dell' &&
      request.model === 'Latitude 7420')
  )
}

@Injectable()
export class DatabaseService {
  private readonly dbPath: string
  private state: DatabaseState

  constructor() {
    this.dbPath =
      process.env.FIXLAB_DB_PATH?.trim() || resolve(process.cwd(), 'data', 'fixlab-db.json')

    mkdirSync(dirname(this.dbPath), { recursive: true })
    this.state = this.loadState()
    this.seedInitialData()
  }

  listTickets(search?: string, stage?: string): ServiceTicket[] {
    const query = search?.trim().toLowerCase() ?? ''

    return clone(this.state.tickets)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((ticket) => {
        const snapshot = getTrackingSnapshot(ticket)

        if (stage && stage !== 'all' && snapshot.stage !== stage) {
          return false
        }

        if (!query) {
          return true
        }

        const haystack = [
          ticket.ticketNumber,
          ticket.request.customerName,
          ticket.request.phone,
          ticket.request.brand,
          ticket.request.model,
        ]
          .join(' ')
          .toLowerCase()

        return haystack.includes(query)
      })
  }

  getTicketById(id: string): ServiceTicket | null {
    const ticket = this.state.tickets.find((item) => item.id === id)
    return ticket ? clone(ticket) : null
  }

  findTicketByAccess(ticketNumber: string, accessCode: string): ServiceTicket | null {
    const ticket = this.state.tickets.find(
      (item) => item.ticketNumber === ticketNumber && item.accessCode === accessCode,
    )
    return ticket ? clone(ticket) : null
  }

  createTicket(ticket: ServiceTicket): ServiceTicket {
    this.state.tickets = [clone(ticket), ...this.state.tickets]
    this.saveState()
    return clone(ticket)
  }

  updateTicketStage(id: string, stage: TicketStage): ServiceTicket | null {
    const index = this.state.tickets.findIndex((ticket) => ticket.id === id)
    if (index < 0) {
      return null
    }

    const current = this.state.tickets[index]
    this.state.tickets[index] = {
      ...current,
      currentStage: (TICKET_STAGES as readonly string[]).includes(stage) ? stage : current.currentStage,
    }
    this.saveState()
    return clone(this.state.tickets[index])
  }

  countOpenTickets(): number {
    return this.state.tickets.filter((ticket) => getTrackingSnapshot(ticket).stage !== 'ready').length
  }

  adminSummary(): AdminSummary {
    const tickets = this.listTickets()

    const stageCounts: AdminSummary['stageCounts'] = {
      accepted: 0,
      diagnostics: 0,
      approval: 0,
      repair: 0,
      quality: 0,
      ready: 0,
    }

    let totalAmount = 0
    let express = 0

    for (const ticket of tickets) {
      const snapshot = getTrackingSnapshot(ticket)
      stageCounts[snapshot.stage] += 1
      totalAmount += ticket.estimate.pricing.total
      if (ticket.request.urgency === 'express') {
        express += 1
      }
    }

    return {
      total: tickets.length,
      active: tickets.length - stageCounts.ready,
      ready: stageCounts.ready,
      express,
      totalAmount,
      stageCounts,
    }
  }

  getUserByUsername(username: string): AdminUserRecord | null {
    const user = this.state.users.find((item) => item.username === username)
    return user ? clone(user) : null
  }

  getUserById(id: string): AdminUserRecord | null {
    const user = this.state.users.find((item) => item.id === id)
    return user ? clone(user) : null
  }

  createSession(userId: string, rawToken: string, expiresAt: string): AdminSessionRecord {
    const now = new Date().toISOString()
    const session: AdminSessionRecord = {
      id: randomUUID(),
      userId,
      tokenHash: hashToken(rawToken),
      createdAt: now,
      expiresAt,
      lastSeenAt: now,
    }

    this.state.sessions = [session, ...this.state.sessions]
    this.saveState()
    return clone(session)
  }

  findSessionByToken(rawToken: string): AdminSessionRecord | null {
    const tokenHash = hashToken(rawToken)
    const session = this.state.sessions.find((item) => item.tokenHash === tokenHash)
    return session ? clone(session) : null
  }

  touchSession(sessionId: string): void {
    const index = this.state.sessions.findIndex((session) => session.id === sessionId)
    if (index < 0) {
      return
    }

    this.state.sessions[index] = {
      ...this.state.sessions[index],
      lastSeenAt: new Date().toISOString(),
    }
    this.saveState()
  }

  deleteSessionByToken(rawToken: string): void {
    const tokenHash = hashToken(rawToken)
    const next = this.state.sessions.filter((session) => session.tokenHash !== tokenHash)
    if (next.length !== this.state.sessions.length) {
      this.state.sessions = next
      this.saveState()
    }
  }

  deleteExpiredSessions(): void {
    const now = Date.now()
    const next = this.state.sessions.filter((session) => new Date(session.expiresAt).getTime() > now)
    if (next.length !== this.state.sessions.length) {
      this.state.sessions = next
      this.saveState()
    }
  }

  private loadState(): DatabaseState {
    if (!existsSync(this.dbPath)) {
      return {
        users: [],
        sessions: [],
        tickets: [],
      }
    }

    try {
      const raw = readFileSync(this.dbPath, 'utf8')
      const parsed = JSON.parse(raw) as Partial<DatabaseState>

      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        tickets: Array.isArray(parsed.tickets) ? parsed.tickets : [],
      }
    } catch {
      return {
        users: [],
        sessions: [],
        tickets: [],
      }
    }
  }

  private saveState(): void {
    writeFileSync(this.dbPath, JSON.stringify(this.state, null, 2), 'utf8')
  }

  private seedInitialData(): void {
    this.deleteExpiredSessions()
    this.removeLegacyDemoTickets()

    if (this.state.users.length === 0) {
      const id = randomUUID()
      const username = (process.env.FIXLAB_ADMIN_USERNAME || 'admin').trim()
      const password = process.env.FIXLAB_ADMIN_PASSWORD || 'admin12345'
      const createdAt = new Date().toISOString()

      this.state.users = [
        {
          id,
          username,
          passwordHash: hashPassword(password),
          createdAt,
        },
      ]
      this.saveState()
    }

  }

  private removeLegacyDemoTickets(): void {
    const nextTickets = this.state.tickets.filter((ticket) => !isLegacyDemoTicket(ticket))

    if (nextTickets.length !== this.state.tickets.length) {
      this.state.tickets = nextTickets
      this.saveState()
    }
  }
}
