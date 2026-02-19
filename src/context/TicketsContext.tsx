import { useMemo, useState, type ReactNode } from 'react'
import { createTicket, isTicketReady, matchTicket } from '../lib/repairEngine.ts'
import { loadTickets, saveTickets } from '../lib/storage.ts'
import type { ServiceTicket } from '../types/domain.ts'
import { TicketsContext, type TicketsContextValue } from './ticketsContext.ts'

function buildDemoTickets(): ServiceTicket[] {
  const now = new Date()

  const first = createTicket(
    {
      customerName: 'Алихан Сейтов',
      phone: '+7 (701) 111-22-33',
      email: 'alikhan@sample.kz',
      deviceType: 'laptop',
      brand: 'Dell',
      model: 'Latitude 7420',
      issueType: 'overheat',
      issueDetails: 'Шумит кулер и резко падает производительность в играх.',
      urgency: 'priority',
      hasWarranty: false,
      repeatCustomer: true,
    },
    4,
    new Date(now.getTime() - 26 * 60 * 60 * 1000),
  )

  const second = createTicket(
    {
      customerName: 'Айгерим Нурланкызы',
      phone: '+7 (707) 444-55-66',
      email: 'aigerim@sample.kz',
      deviceType: 'smartphone',
      brand: 'Samsung',
      model: 'Galaxy S22',
      issueType: 'screen',
      issueDetails: 'После падения не работает сенсор в нижней части экрана.',
      urgency: 'standard',
      hasWarranty: true,
      repeatCustomer: false,
    },
    3,
    new Date(now.getTime() - 10 * 60 * 60 * 1000),
  )

  return [second, first]
}

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<ServiceTicket[]>(() => {
    const stored = loadTickets()
    if (stored.length > 0) {
      return stored
    }

    const seeded = buildDemoTickets()
    saveTickets(seeded)
    return seeded
  })

  const value = useMemo<TicketsContextValue>(
    () => ({
      tickets,
      createRequest: (request) => {
        const activeTicketsCount = tickets.filter((ticket) => !isTicketReady(ticket)).length
        const createdTicket = createTicket(request, activeTicketsCount)

        setTickets((prev) => {
          const next = [createdTicket, ...prev]
          saveTickets(next)
          return next
        })

        return createdTicket
      },
      findTicket: (ticketNumber, accessCode) =>
        tickets.find((ticket) => matchTicket(ticket, ticketNumber, accessCode)) ?? null,
    }),
    [tickets],
  )

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>
}
