import { useContext } from 'react'
import { TicketsContext, type TicketsContextValue } from './ticketsContext.ts'

export function useTickets(): TicketsContextValue {
  const context = useContext(TicketsContext)
  if (!context) {
    throw new Error('useTickets must be used inside TicketsProvider')
  }
  return context
}
