import { createContext } from 'react'
import type { ServiceRequestInput, ServiceTicket, TicketStage } from '../types/domain.ts'

export type DataSource = 'api'

export interface TicketsContextValue {
  tickets: ServiceTicket[]
  loading: boolean
  syncing: boolean
  apiAvailable: boolean
  dataSource: DataSource
  errorMessage: string | null
  isAuthorized: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshTickets: () => Promise<void>
  createRequest: (request: ServiceRequestInput) => Promise<ServiceTicket>
  findTicket: (ticketNumber: string, accessCode: string) => Promise<ServiceTicket | null>
  updateTicketStage: (ticketId: string, stage: TicketStage) => Promise<ServiceTicket | null>
}

export const TicketsContext = createContext<TicketsContextValue | undefined>(undefined)
