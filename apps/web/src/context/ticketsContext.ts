import { createContext } from 'react'
import type { ServiceRequestInput, ServiceTicket, TicketStage } from '../types/domain.ts'

export type DataSource = 'api' | 'local'

export interface TicketsContextValue {
  tickets: ServiceTicket[]
  loading: boolean
  syncing: boolean
  apiAvailable: boolean
  dataSource: DataSource
  errorMessage: string | null
  refreshTickets: () => Promise<void>
  createRequest: (request: ServiceRequestInput) => Promise<ServiceTicket>
  findTicket: (ticketNumber: string, accessCode: string) => ServiceTicket | null
  updateTicketStage: (ticketId: string, stage: TicketStage) => Promise<ServiceTicket | null>
}

export const TicketsContext = createContext<TicketsContextValue | undefined>(undefined)
