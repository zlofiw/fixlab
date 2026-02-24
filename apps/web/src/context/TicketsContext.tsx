import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi, setApiToken, ticketsApi } from '../lib/api.ts'
import { loadAuthToken, saveAuthToken } from '../lib/storage.ts'
import type { ServiceTicket, TicketStage } from '../types/domain.ts'
import { TicketsContext, type TicketsContextValue } from './ticketsContext.ts'

export function TicketsProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<ServiceTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [apiAvailable, setApiAvailable] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const refreshTickets = useCallback(async () => {
    setSyncing(true)
    try {
      const remoteTickets = await ticketsApi.list()
      setTickets(remoteTickets)
      setApiAvailable(true)
      setErrorMessage(null)
    } catch {
      setApiAvailable(false)
      setErrorMessage('Не удалось получить данные с сервера.')
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }, [])

  useEffect(() => {
    const token = loadAuthToken()
    if (token) {
      setApiToken(token)
      authApi.me().then(() => setIsAuthorized(true)).catch(() => saveAuthToken(''))
    }

    void refreshTickets()
  }, [refreshTickets])

  const value = useMemo<TicketsContextValue>(
    () => ({
      tickets,
      loading,
      syncing,
      apiAvailable,
      dataSource: 'api',
      errorMessage,
      isAuthorized,
      login: async (username: string, password: string) => {
        const response = await authApi.login(username, password)
        saveAuthToken(response.token)
        setApiToken(response.token)
        setIsAuthorized(true)
      },
      logout: () => {
        saveAuthToken('')
        setApiToken('')
        setIsAuthorized(false)
      },
      refreshTickets,
      createRequest: async (request) => {
        const created = await ticketsApi.create(request)
        setTickets((prev) => [created, ...prev])
        return created
      },
      findTicket: async (ticketNumber, accessCode) => {
        try {
          return await ticketsApi.lookup(ticketNumber, accessCode)
        } catch {
          return null
        }
      },
      updateTicketStage: async (ticketId: string, stage: TicketStage) => {
        const updated = await ticketsApi.updateStage(ticketId, stage)
        setTickets((prev) => prev.map((ticket) => (ticket.id === ticketId ? updated : ticket)))
        return updated
      },
    }),
    [tickets, loading, syncing, apiAvailable, errorMessage, isAuthorized, refreshTickets],
  )

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>
}
