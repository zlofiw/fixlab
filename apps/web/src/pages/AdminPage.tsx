import { useEffect, useMemo, useState } from 'react'
import { SectionHeading } from '../components/SectionHeading.tsx'
import { StatusPill } from '../components/StatusPill.tsx'
import { useTickets } from '../context/useTickets.ts'
import { STAGE_LABELS } from '../data/catalog.ts'
import { formatDateTime, formatMoney } from '../lib/format.ts'
import { getTrackingSnapshot, TICKET_STAGE_ORDER } from '../lib/repairEngine.ts'
import type { ServiceTicket, TicketStage } from '../types/domain.ts'

type StageFilter = 'all' | TicketStage

export function AdminPage() {
  const {
    tickets,
    updateTicketStage,
    syncing,
    dataSource,
    errorMessage,
    refreshTickets,
    isAuthorized,
    login,
    logout,
  } = useTickets()
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<StageFilter>('all')
  const [selectedTicketId, setSelectedTicketId] = useState('')
  const [busyStage, setBusyStage] = useState<TicketStage | null>(null)
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const entries = useMemo(() => tickets.map((ticket) => ({ ticket, snapshot: getTrackingSnapshot(ticket) })), [tickets])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return entries.filter(({ ticket, snapshot }) => {
      if (stageFilter !== 'all' && snapshot.stage !== stageFilter) return false
      if (!query) return true
      return [ticket.ticketNumber, ticket.request.customerName, ticket.request.phone, ticket.request.brand, ticket.request.model]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [entries, search, stageFilter])

  useEffect(() => {
    if (filtered.length && !filtered.some(({ ticket }) => ticket.id === selectedTicketId)) {
      setSelectedTicketId(filtered[0].ticket.id)
    }
    if (!filtered.length) setSelectedTicketId('')
  }, [filtered, selectedTicketId])

  const selectedEntry = filtered.find(({ ticket }) => ticket.id === selectedTicketId) ?? null

  const stats = useMemo(() => {
    let totalAmount = 0
    let todayCreated = 0
    let express = 0
    const stageCounts: Record<TicketStage, number> = { accepted: 0, diagnostics: 0, approval: 0, repair: 0, quality: 0, ready: 0 }
    const today = new Date().toISOString().slice(0, 10)

    for (const { ticket, snapshot } of entries) {
      stageCounts[snapshot.stage] += 1
      totalAmount += ticket.estimate.pricing.total
      if (ticket.request.urgency === 'express') express += 1
      if (ticket.createdAt.slice(0, 10) === today) todayCreated += 1
    }

    return { total: entries.length, active: entries.length - stageCounts.ready, ready: stageCounts.ready, express, todayCreated, totalAmount }
  }, [entries])

  async function applyStage(ticket: ServiceTicket, stage: TicketStage) {
    setBusyStage(stage)
    try {
      await updateTicketStage(ticket.id, stage)
    } finally {
      setBusyStage(null)
    }
  }

  if (!isAuthorized) {
    return (
      <div className="space-y-6 pt-8">
        <section className="card-surface rounded-4xl p-6 md:p-10">
          <SectionHeading tag="ADMIN" title="Вход для администратора" description="Для доступа к управлению заявками авторизуйтесь." />
          <form
            onSubmit={(event) => {
              event.preventDefault()
              login(username, password).then(() => setAuthError('')).catch((e: Error) => setAuthError(e.message))
            }}
            className="mt-6 grid max-w-md gap-3"
          >
            <input value={username} onChange={(event) => setUsername(event.target.value)} className="field-base rounded-2xl px-4 py-3" placeholder="Логин" />
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="field-base rounded-2xl px-4 py-3" placeholder="Пароль" />
            <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">Войти</button>
            {authError ? <p className="text-sm text-rose-700">{authError}</p> : null}
          </form>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-6 pt-6 md:space-y-10 md:pt-10">
      <section className="card-surface rounded-4xl p-6 md:p-10">
        <SectionHeading tag="ADMIN" title="Панель управления заявками" description="Управление очередью и этапами ремонта." />
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">Источник: {dataSource}</span>
          {syncing ? <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-cyan-800">Синхронизация…</span> : null}
          {errorMessage ? <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800">{errorMessage}</span> : null}
          <button type="button" onClick={() => void refreshTickets()} className="chip-muted">Обновить</button>
          <button type="button" onClick={logout} className="chip-muted">Выйти</button>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="card-surface rounded-3xl p-5"><p className="text-xs text-slate-500">Всего</p><p className="mt-2 text-3xl font-bold">{stats.total}</p></article>
        <article className="card-surface rounded-3xl p-5"><p className="text-xs text-slate-500">Активные</p><p className="mt-2 text-3xl font-bold">{stats.active}</p></article>
        <article className="card-surface rounded-3xl p-5"><p className="text-xs text-slate-500">Готово</p><p className="mt-2 text-3xl font-bold">{stats.ready}</p></article>
        <article className="card-surface rounded-3xl p-5"><p className="text-xs text-slate-500">Экспресс</p><p className="mt-2 text-3xl font-bold">{stats.express}</p></article>
        <article className="card-surface rounded-3xl p-5"><p className="text-xs text-slate-500">Оборот</p><p className="mt-2 text-2xl font-bold">{formatMoney(stats.totalAmount)}</p><p className="mt-2 text-xs text-slate-500">Сегодня: {stats.todayCreated}</p></article>
      </section>
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="card-surface rounded-4xl p-6 md:p-8">
          <h2 className="text-2xl font-bold">Очередь</h2>
          <div className="mt-4 grid gap-3">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск" className="field-base rounded-2xl px-4 py-3 text-sm" />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setStageFilter('all')} className={stageFilter === 'all' ? 'chip-active' : 'chip-muted'}>Все</button>
              {TICKET_STAGE_ORDER.map((stage) => <button key={stage} type="button" onClick={() => setStageFilter(stage)} className={stageFilter === stage ? 'chip-active' : 'chip-muted'}>{STAGE_LABELS[stage]}</button>)}
            </div>
            {filtered.map(({ ticket, snapshot }) => (
              <button key={ticket.id} type="button" onClick={() => setSelectedTicketId(ticket.id)} className={ticket.id === selectedTicketId ? 'rounded-3xl border border-cyan-200 bg-cyan-50 p-4 text-left' : 'rounded-3xl border border-slate-200 bg-white p-4 text-left'}>
                <div className="flex items-center justify-between"><p className="font-bold">{ticket.ticketNumber}</p><StatusPill stage={snapshot.stage} label={snapshot.stageLabel} /></div>
                <p className="text-xs text-slate-600">{ticket.request.customerName} · {ticket.request.phone}</p>
              </button>
            ))}
          </div>
        </article>
        <article className="card-surface rounded-4xl p-6 md:p-8">
          <h2 className="text-2xl font-bold">Управление</h2>
          {selectedEntry ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm">{selectedEntry.ticket.request.brand} {selectedEntry.ticket.request.model} · {formatDateTime(selectedEntry.ticket.createdAt)}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {TICKET_STAGE_ORDER.map((stage) => (
                  <button key={stage} type="button" onClick={() => void applyStage(selectedEntry.ticket, stage)} disabled={busyStage !== null} className={selectedEntry.snapshot.stage === stage ? 'rounded-2xl border border-cyan-200 bg-cyan-100 px-4 py-3 text-left text-sm font-bold' : 'rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-bold'}>
                    {busyStage === stage ? 'Обновление…' : STAGE_LABELS[stage]}
                  </button>
                ))}
              </div>
            </div>
          ) : <p className="mt-4 text-sm text-slate-600">Выберите заявку слева.</p>}
        </article>
      </section>
    </div>
  )
}
