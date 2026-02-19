import { createContext } from 'react'
import type { ServiceRequestInput, ServiceTicket } from '../types/domain.ts'

export interface TicketsContextValue {
  tickets: ServiceTicket[]
  createRequest: (request: ServiceRequestInput) => ServiceTicket
  findTicket: (ticketNumber: string, accessCode: string) => ServiceTicket | null
}

export const TicketsContext = createContext<TicketsContextValue | undefined>(undefined)
