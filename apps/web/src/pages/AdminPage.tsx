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
  const { tickets, updateTicketStage } = useTickets()
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<StageFilter>('all')
  const [selectedTicketId, setSelectedTicketId] = useState('')

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
      stageCounts,
    }
  }, [entries])

  function applyStage(ticket: ServiceTicket, stage: TicketStage) {
    updateTicketStage(ticket.id, stage)
  }

  return (
    <div className="space-y-8 pb-6 pt-6 md:space-y-10 md:pt-10">
      <section className="card-surface rounded-4xl p-6 md:p-10">
        <SectionHeading
          tag="ADMIN"
          title="Панель управления заявками"
          description="Просмотр очереди, фильтрация заказов и ручное управление этапами ремонта."
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="card-surface rounded-3xl p-5">
          <p className="text-xs font-bold tracking-wide text-slate-500">Всего</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900">{stats.total}</p>
        </article>
        <article className="card-surface rounded-3xl p-5">
          <p className="text-xs font-bold tracking-wide text-slate-500">Активные</p>
          <p className="mt-2 font-display text-3xl font-bold text-cyan-900">{stats.active}</p>
        </article>
        <article className="card-surface rounded-3xl p-5">
          <p className="text-xs font-bold tracking-wide text-slate-500">Готово</p>
          <p className="mt-2 font-display text-3xl font-bold text-emerald-900">{stats.ready}</p>
        </article>
        <article className="card-surface rounded-3xl p-5">
          <p className="text-xs font-bold tracking-wide text-slate-500">Экспресс</p>
          <p className="mt-2 font-display text-3xl font-bold text-amber-900">{stats.express}</p>
        </article>
        <article className="card-surface rounded-3xl p-5">
          <p className="text-xs font-bold tracking-wide text-slate-500">Портфель</p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900">
            {formatMoney(stats.totalAmount)}
          </p>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            Создано сегодня: {stats.todayCreated}
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="card-surface rounded-4xl p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">Очередь</h2>
          <div className="mt-4 grid gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск по номеру, клиенту, устройству"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-500"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStageFilter('all')}
                className={
                  stageFilter === 'all'
                    ? 'rounded-xl border border-cyan-200 bg-cyan-100 px-3 py-2 text-xs font-bold text-cyan-900'
                    : 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700'
                }
              >
                Все
              </button>
              {TICKET_STAGE_ORDER.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setStageFilter(stage)}
                  className={
                    stageFilter === stage
                      ? 'rounded-xl border border-cyan-200 bg-cyan-100 px-3 py-2 text-xs font-bold text-cyan-900'
                      : 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700'
                  }
                >
                  {STAGE_LABELS[stage]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filtered.length > 0 ? (
              filtered.map(({ ticket, snapshot }) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={
                    ticket.id === selectedTicketId
                      ? 'w-full rounded-3xl border border-cyan-200 bg-cyan-50 px-4 py-4 text-left'
                      : 'w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-left'
                  }
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{ticket.ticketNumber}</p>
                      <p className="text-xs font-medium text-slate-500">
                        {ticket.request.customerName} · {ticket.request.phone}
                      </p>
                    </div>
                    <StatusPill stage={snapshot.stage} label={snapshot.stageLabel} />
                  </div>
                  <div className="mt-3 grid gap-1 text-xs font-semibold text-slate-600 sm:grid-cols-2">
                    <p>
                      {ticket.request.brand} {ticket.request.model}
                    </p>
                    <p>{formatMoney(ticket.estimate.pricing.total)}</p>
                    <p>{ticket.request.urgency}</p>
                    <p>{formatDateTime(ticket.createdAt)}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">
                Заявки не найдены.
              </p>
            )}
          </div>
        </article>

        <article className="card-surface rounded-4xl p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">Управление</h2>
          {selectedTicket && selectedSnapshot ? (
            <div className="mt-4 space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-wide text-slate-500">Заказ</p>
                    <p className="mt-1 text-lg font-extrabold text-slate-900">
                      {selectedTicket.ticketNumber}
                    </p>
                  </div>
                  <StatusPill stage={selectedSnapshot.stage} label={selectedSnapshot.stageLabel} />
                </div>
                <div className="mt-4 grid gap-2 text-sm font-medium text-slate-700 sm:grid-cols-2">
                  <p>Клиент: {selectedTicket.request.customerName}</p>
                  <p>Телефон: {selectedTicket.request.phone}</p>
                  <p>
                    Устройство: {selectedTicket.request.brand} {selectedTicket.request.model}
                  </p>
                  <p>Тип: {selectedTicket.request.deviceType}</p>
                  <p>План выдачи: {formatDateTime(selectedTicket.estimate.promiseDate)}</p>
                  <p>Сумма: {formatMoney(selectedTicket.estimate.pricing.total)}</p>
                </div>
                {selectedTicket.request.issueDetails && (
                  <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                    {selectedTicket.request.issueDetails}
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold tracking-wide text-slate-500">Этап ремонта</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {TICKET_STAGE_ORDER.map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => applyStage(selectedTicket, stage)}
                      className={
                        selectedSnapshot.stage === stage
                          ? 'rounded-2xl border border-cyan-200 bg-cyan-100 px-4 py-3 text-left text-sm font-bold text-cyan-900'
                          : 'rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-bold text-slate-700'
                      }
                    >
                      {STAGE_LABELS[stage]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold tracking-wide text-slate-500">Плановый таймлайн</p>
                <div className="mt-3 space-y-2">
                  {selectedTicket.timeline.map((step) => (
                    <div
                      key={step.stage}
                      className={
                        step.stage === selectedSnapshot.stage
                          ? 'rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3'
                          : 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'
                      }
                    >
                      <p className="text-sm font-bold text-slate-900">{step.label}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {formatDateTime(step.plannedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTicket.notes.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-bold tracking-wide text-slate-500">Примечания</p>
                  <div className="mt-3 space-y-2">
                    {selectedTicket.notes.map((note) => (
                      <p
                        key={note}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                      >
                        {note}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">
              Выберите заявку слева.
            </p>
          )}
        </article>
      </section>
    </div>
  )
}
