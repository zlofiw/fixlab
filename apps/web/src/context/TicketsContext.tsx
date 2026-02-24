import { startTransition, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ticketsApi } from '../lib/api.ts'
import { matchTicket } from '../lib/repairEngine.ts'
import type { ServiceTicket, TicketStage } from '../types/domain.ts'
import { TicketsContext, type DataSource, type TicketsContextValue } from './ticketsContext.ts'

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<ServiceTicket[]>([])
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
        setTickets(remoteTickets)
      })
      setApiAvailable(true)
      setDataSource('api')
      setErrorMessage(null)
    } catch {
      setApiAvailable(false)
      setDataSource('local')
      setErrorMessage('Сервер недоступен. Загрузка очереди временно невозможна.')
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
        try {
          const created = await ticketsApi.create(request)
          setTickets((prev) => [created, ...prev])
          setApiAvailable(true)
          setDataSource('api')
          setErrorMessage(null)
          return created
        } catch (error) {
          setApiAvailable(false)
          setDataSource('local')
          setErrorMessage('Не удалось создать заявку. Проверьте соединение с сервером и попробуйте снова.')
          throw error
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
        setTickets((prev) => prev.map((ticket) => (ticket.id === ticketId ? optimistic : ticket)))

        try {
          const updated = await ticketsApi.updateStage(ticketId, stage)
          setTickets((prev) => prev.map((ticket) => (ticket.id === ticketId ? updated : ticket)))
          setApiAvailable(true)
          setDataSource('api')
          setErrorMessage(null)
          return updated
        } catch (error) {
          setTickets((prev) => prev.map((ticket) => (ticket.id === ticketId ? current : ticket)))
          setErrorMessage('Не удалось обновить этап ремонта на сервере.')
          throw error
        }
      },
    }),
    [tickets, loading, syncing, apiAvailable, dataSource, errorMessage, refreshTickets],
  )

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>
}
