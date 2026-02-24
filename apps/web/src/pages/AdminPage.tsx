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
  const { tickets, updateTicketStage, syncing, dataSource, errorMessage, refreshTickets } = useTickets()
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<StageFilter>('all')
  const [selectedTicketId, setSelectedTicketId] = useState('')
  const [busyStage, setBusyStage] = useState<TicketStage | null>(null)

  const entries = useMemo(
    () =>
      tickets.map((ticket) => ({
        ticket,
        snapshot: getTrackingSnapshot(ticket),
      })),
    [tickets],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return entries.filter(({ ticket, snapshot }) => {
      if (stageFilter !== 'all' && snapshot.stage !== stageFilter) {
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
  }, [entries, search, stageFilter])

  useEffect(() => {
    if (filtered.length === 0) {
      if (selectedTicketId) {
        setSelectedTicketId('')
      }
      return
    }

    if (!filtered.some(({ ticket }) => ticket.id === selectedTicketId)) {
      setSelectedTicketId(filtered[0].ticket.id)
    }
  }, [filtered, selectedTicketId])

  const selectedEntry = filtered.find(({ ticket }) => ticket.id === selectedTicketId) ?? null
  const selectedTicket = selectedEntry?.ticket ?? null
  const selectedSnapshot = selectedEntry?.snapshot ?? null

  const stats = useMemo(() => {
    const stageCounts: Record<TicketStage, number> = {
      accepted: 0,
      diagnostics: 0,
      approval: 0,
      repair: 0,
      quality: 0,
      ready: 0,
    }

    let totalAmount = 0
    let todayCreated = 0
    let express = 0
    const today = new Date().toISOString().slice(0, 10)

    for (const { ticket, snapshot } of entries) {
      stageCounts[snapshot.stage] += 1
      totalAmount += ticket.estimate.pricing.total
      if (ticket.request.urgency === 'express') {
        express += 1
      }
      if (ticket.createdAt.slice(0, 10) === today) {
        todayCreated += 1
      }
    }

    return {
      total: entries.length,
      ready: stageCounts.ready,
      active: entries.length - stageCounts.ready,
      express,
      todayCreated,
      totalAmount,
    }
  }, [entries])

  async function applyStage(ticket: ServiceTicket, stage: TicketStage) {
    setBusyStage(stage)
    try {
      await updateTicketStage(ticket.id, stage)
    } finally {
      setBusyStage(null)
    }
  }

  return (
    <div className="space-y-8 pb-6 pt-6 md:space-y-10 md:pt-10">
      <section className="card-surface rounded-4xl p-6 md:p-10">
        <SectionHeading
          tag="ADMIN"
          title="Панель управления заявками"
          description="Просмотр очереди, фильтрация заказов и ручное управление этапами ремонта."
        />
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">
            Источник: {dataSource}
          </span>
          {syncing ? (
            <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-cyan-800">Синхронизация…</span>
          ) : null}
          {errorMessage ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800">{errorMessage}</span>
          ) : null}
          <button
            type="button"
            onClick={() => void refreshTickets()}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 transition hover:border-cyan-300 hover:text-cyan-800"
          >
            Обновить данные
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="card-surface rounded-3xl p-5"><p className="text-xs font-bold tracking-wide text-slate-500">Всего</p><p className="mt-2 font-display text-3xl font-bold text-slate-900">{stats.total}</p></article>
        <article className="card-surface rounded-3xl p-5"><p className="text-xs font-bold tracking-wide text-slate-500">Активные</p><p className="mt-2 font-display text-3xl font-bold text-cyan-900">{stats.active}</p></article>
        <article className="card-surface rounded-3xl p-5"><p className="text-xs font-bold tracking-wide text-slate-500">Готово</p><p className="mt-2 font-display text-3xl font-bold text-emerald-900">{stats.ready}</p></article>
        <article className="card-surface rounded-3xl p-5"><p className="text-xs font-bold tracking-wide text-slate-500">Экспресс</p><p className="mt-2 font-display text-3xl font-bold text-amber-900">{stats.express}</p></article>
        <article className="card-surface rounded-3xl p-5">
          <p className="text-xs font-bold tracking-wide text-slate-500">Портфель</p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900">{formatMoney(stats.totalAmount)}</p>
          <p className="mt-2 text-xs font-semibold text-slate-500">Создано сегодня: {stats.todayCreated}</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="card-surface rounded-4xl p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">Очередь</h2>
          <div className="mt-4 grid gap-3">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск по номеру, клиенту, устройству" className="field-base rounded-2xl px-4 py-3 text-sm font-semibold" />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setStageFilter('all')} className={stageFilter === 'all' ? 'chip-active' : 'chip-muted'}>Все ({entries.length})</button>
              {TICKET_STAGE_ORDER.map((stage) => (
                <button key={stage} type="button" onClick={() => setStageFilter(stage)} className={stageFilter === stage ? 'chip-active' : 'chip-muted'}>
                  {STAGE_LABELS[stage]}
                </button>
              ))}
            </div>

            {filtered.length > 0 ? (
              filtered.map(({ ticket, snapshot }) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={
                    ticket.id === selectedTicketId
                      ? 'rounded-3xl border border-cyan-200 bg-cyan-50 px-4 py-4 text-left'
                      : 'rounded-3xl border border-slate-200 bg-white px-4 py-4 text-left'
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{ticket.ticketNumber}</p>
                      <p className="text-xs font-medium text-slate-500">{ticket.request.customerName} · {ticket.request.phone}</p>
                    </div>
                    <StatusPill stage={snapshot.stage} label={snapshot.stageLabel} />
                  </div>
                  <div className="mt-3 grid gap-1 text-xs font-semibold text-slate-600 sm:grid-cols-2">
                    <p>{ticket.request.brand} {ticket.request.model}</p>
                    <p>{formatMoney(ticket.estimate.pricing.total)}</p>
                    <p>{ticket.request.urgency}</p>
                    <p>{formatDateTime(ticket.createdAt)}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">Заявки не найдены.</p>
            )}
          </div>
        </article>

        <article className="card-surface rounded-4xl p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">Управление</h2>
          {selectedTicket && selectedSnapshot ? (
            <div className="mt-4 space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="text-xs font-bold tracking-wide text-slate-500">Заказ</p><p className="mt-1 text-lg font-extrabold text-slate-900">{selectedTicket.ticketNumber}</p></div>
                  <StatusPill stage={selectedSnapshot.stage} label={selectedSnapshot.stageLabel} />
                </div>
                <div className="mt-4 grid gap-2 text-sm font-medium text-slate-700 sm:grid-cols-2">
                  <p>Клиент: {selectedTicket.request.customerName}</p><p>Телефон: {selectedTicket.request.phone}</p><p>Устройство: {selectedTicket.request.brand} {selectedTicket.request.model}</p><p>Тип: {selectedTicket.request.deviceType}</p><p>План выдачи: {formatDateTime(selectedTicket.estimate.promiseDate)}</p><p>Сумма: {formatMoney(selectedTicket.estimate.pricing.total)}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold tracking-wide text-slate-500">Этап ремонта</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {TICKET_STAGE_ORDER.map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => void applyStage(selectedTicket, stage)}
                      disabled={busyStage !== null}
                      className={
                        selectedSnapshot.stage === stage
                          ? 'rounded-2xl border border-cyan-200 bg-cyan-100 px-4 py-3 text-left text-sm font-bold text-cyan-900'
                          : 'rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-bold text-slate-700'
                      }
                    >
                      {busyStage === stage ? 'Обновление…' : STAGE_LABELS[stage]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">Выберите заявку слева.</p>
          )}
        </article>
      </section>
    </div>
  )
}
