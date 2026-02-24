import { startTransition, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ticketsApi } from '../lib/api.ts'
import { createTicket, isTicketReady, matchTicket } from '../lib/repairEngine.ts'
import { loadTickets, saveTickets } from '../lib/storage.ts'
import type { ServiceTicket, TicketStage } from '../types/domain.ts'
import { TicketsContext, type DataSource, type TicketsContextValue } from './ticketsContext.ts'

function buildDemoTickets(): ServiceTicket[] {
  const now = new Date()

  const first = createTicket(
    {
      customerName: 'Alikhan Seitov',
      phone: '+7 (701) 111-22-33',
      email: 'alikhan@sample.kz',
      deviceType: 'laptop',
      brand: 'Dell',
      model: 'Latitude 7420',
      issueType: 'overheat',
      issueDetails: 'Fan noise spikes and performance drops under load after 10 minutes.',
      urgency: 'priority',
      hasWarranty: false,
      repeatCustomer: true,
    },
    4,
    new Date(now.getTime() - 26 * 60 * 60 * 1000),
  )

  const second = createTicket(
    {
      customerName: 'Aigerim Nurlankyzy',
      phone: '+7 (707) 444-55-66',
      email: 'aigerim@sample.kz',
      deviceType: 'smartphone',
      brand: 'Samsung',
      model: 'Galaxy S22',
      issueType: 'screen',
      issueDetails: 'Touch does not respond in the lower part of the display after a drop.',
      urgency: 'standard',
      hasWarranty: true,
      repeatCustomer: false,
    },
    3,
    new Date(now.getTime() - 10 * 60 * 60 * 1000),
  )

  return [second, first]
}

function getSeededTickets(): ServiceTicket[] {
  const stored = loadTickets()
  if (stored.length > 0) {
    return stored
  }

  const seeded = buildDemoTickets()
  saveTickets(seeded)
  return seeded
}

function persistTickets(next: ServiceTicket[]) {
  saveTickets(next)
  return next
}

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<ServiceTicket[]>(() => getSeededTickets())
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [apiAvailable, setApiAvailable] = useState(false)
  const [dataSource, setDataSource] = useState<DataSource>('local')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const refreshTickets = useCallback(async () => {
    setSyncing(true)
    try {
      const remoteTickets = await ticketsApi.list()
      startTransition(() => {
        setTickets(() => persistTickets(remoteTickets))
      })
      setApiAvailable(true)
      setDataSource('api')
      setErrorMessage(null)
    } catch {
      setApiAvailable(false)
      setDataSource('local')
      setErrorMessage('API is unavailable. Local queue data is active.')
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }, [])

  useEffect(() => {
    void refreshTickets()
  }, [refreshTickets])

  const value = useMemo<TicketsContextValue>(
    () => ({
      tickets,
      loading,
      syncing,
      apiAvailable,
      dataSource,
      errorMessage,
      refreshTickets,
      createRequest: async (request) => {
        const activeTicketsCount = tickets.filter((ticket) => !isTicketReady(ticket)).length

        try {
          const created = await ticketsApi.create(request)
          setTickets((prev) => persistTickets([created, ...prev]))
          setApiAvailable(true)
          setDataSource('api')
          setErrorMessage(null)
          return created
        } catch {
          const localTicket = createTicket(request, activeTicketsCount)
          setTickets((prev) => persistTickets([localTicket, ...prev]))
          setApiAvailable(false)
          setDataSource('local')
          setErrorMessage('Request saved locally because the API is unavailable.')
          return localTicket
        }
      },
      findTicket: (ticketNumber, accessCode) =>
        tickets.find((ticket) => matchTicket(ticket, ticketNumber, accessCode)) ?? null,
      updateTicketStage: async (ticketId: string, stage: TicketStage) => {
        const current = tickets.find((ticket) => ticket.id === ticketId)
        if (!current) {
          return null
        }

        const optimistic: ServiceTicket = { ...current, currentStage: stage }
        setTickets((prev) => persistTickets(prev.map((ticket) => (ticket.id === ticketId ? optimistic : ticket))))

        try {
          const updated = await ticketsApi.updateStage(ticketId, stage)
          setTickets((prev) => persistTickets(prev.map((ticket) => (ticket.id === ticketId ? updated : ticket))))
          setApiAvailable(true)
          setDataSource('api')
          setErrorMessage(null)
          return updated
        } catch {
          setApiAvailable(false)
          setDataSource('local')
          setErrorMessage('Stage changed locally. API sync failed.')
          return optimistic
        }
      },
    }),
    [tickets, loading, syncing, apiAvailable, dataSource, errorMessage, refreshTickets],
  )

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>
}
