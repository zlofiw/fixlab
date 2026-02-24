import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SectionHeading } from '../components/SectionHeading.tsx'
import { StatusPill } from '../components/StatusPill.tsx'
import { useTickets } from '../context/useTickets.ts'
import { formatDateTime, formatMoney } from '../lib/format.ts'
import {
  getTrackingSnapshot,
  sanitizeAccessCode,
  sanitizeTicketNumber,
} from '../lib/repairEngine.ts'
import type { ServiceTicket } from '../types/domain.ts'

export function TrackPage() {
  const { tickets, findTicket } = useTickets()
  const [searchParams] = useSearchParams()
  const initialTicketNumber = searchParams.get('ticket') ?? ''
  const initialAccessCode = searchParams.get('code') ?? ''
  const [ticketNumber, setTicketNumber] = useState(initialTicketNumber)
  const [accessCode, setAccessCode] = useState(initialAccessCode)
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(() =>
    initialTicketNumber && initialAccessCode
      ? findTicket(initialTicketNumber, initialAccessCode)
      : null,
  )
  const [error, setError] = useState('')

  function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = findTicket(ticketNumber, accessCode)

    if (!found) {
      setSelectedTicket(null)
      setError('Заявка не найдена. Проверьте номер и код доступа.')
      return
    }

    setSelectedTicket(found)
    setError('')
  }

  const snapshot = selectedTicket ? getTrackingSnapshot(selectedTicket) : null
  const currentStageIndex =
    selectedTicket && snapshot
      ? selectedTicket.timeline.findIndex((step) => step.stage === snapshot.stage)
      : -1

  return (
    <div className="space-y-8 pb-6 pt-6 md:space-y-10 md:pt-10">
      <section className="card-surface rounded-4xl p-6 md:p-10">
        <SectionHeading
          tag="ТРЕКИНГ РЕМОНТА"
          title="Проверка статуса заявки по номеру и коду доступа"
          description="Данные берутся из локального хранилища проекта. Для демо доступны заявки ниже в блоке «Последние»."
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <article className="card-surface rounded-4xl p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">Найти заявку</h2>
          <form onSubmit={submitHandler} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-xs font-bold text-slate-500">Номер заказа</span>
              <input
                value={ticketNumber}
                onChange={(event) => setTicketNumber(sanitizeTicketNumber(event.target.value))}
                placeholder="FXL-260219-1234"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-500"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-bold text-slate-500">Код доступа</span>
              <input
                value={accessCode}
                onChange={(event) => setAccessCode(sanitizeAccessCode(event.target.value))}
                placeholder="4-6 цифр"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-500"
              />
            </label>
            <button
              type="submit"
              className="sm:col-span-2 inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-cyan-700 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-800/30 transition-transform duration-300 hover:-translate-y-0.5"
            >
              Показать статус
            </button>
          </form>
          {error && (
            <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </p>
          )}

          <div className="mt-6">
            <h3 className="font-display text-xl font-bold text-slate-900">Последние заявки в этом браузере</h3>
            <div className="mt-3 grid gap-3">
              {tickets.slice(0, 4).map((ticket) => {
                const itemSnapshot = getTrackingSnapshot(ticket)
                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => {
                      setTicketNumber(ticket.ticketNumber)
                      setAccessCode(ticket.accessCode)
                      setSelectedTicket(ticket)
                      setError('')
                    }}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-cyan-200"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">{ticket.ticketNumber}</p>
                      <p className="text-xs font-medium text-slate-500">
                        {ticket.request.brand} {ticket.request.model}
                      </p>
                    </div>
                    <StatusPill stage={itemSnapshot.stage} label={itemSnapshot.stageLabel} />
                  </button>
                )
              })}
            </div>
          </div>
        </article>

        <article className="card-surface rounded-4xl p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">Текущее состояние</h2>
          {selectedTicket && snapshot ? (
            <div className="mt-4 space-y-5">
              <div className="rounded-3xl border border-cyan-200 bg-linear-to-br from-cyan-50 to-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <StatusPill stage={snapshot.stage} label={snapshot.stageLabel} />
                  <p className="text-xs font-bold text-slate-500">
                    Заказ: {selectedTicket.ticketNumber} / код {selectedTicket.accessCode}
                  </p>
                </div>
                <div className="mt-4 h-2 rounded-full bg-cyan-100">
                  <div
                    className="h-2 rounded-full bg-linear-to-r from-cyan-700 to-emerald-500"
                    style={{ width: `${Math.max(4, Math.round(snapshot.progress * 100))}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Готовность: {Math.round(snapshot.progress * 100)}% · План выдачи:{' '}
                  {formatDateTime(snapshot.etaDate)}
                </p>
              </div>

              <div className="space-y-2">
                {selectedTicket.timeline.map((step, index) => {
                  const done = index <= currentStageIndex

                  return (
                    <div
                      key={step.stage}
                      className={
                        done
                          ? 'rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3'
                          : 'rounded-2xl border border-slate-200 bg-white px-4 py-3'
                      }
                    >
                      <p className="text-sm font-bold text-slate-900">{step.label}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Плановое время: {formatDateTime(step.plannedAt)}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold text-slate-500">Финансовая модель заявки</p>
                <div className="mt-3 grid gap-2 text-sm font-medium text-slate-700">
                  <p>Диагностика: {formatMoney(selectedTicket.estimate.pricing.diagnosticFee)}</p>
                  <p>Работа: {formatMoney(selectedTicket.estimate.pricing.laborFee)}</p>
                  <p>Детали: {formatMoney(selectedTicket.estimate.pricing.partsReserve)}</p>
                  <p>Срочность: {formatMoney(selectedTicket.estimate.pricing.urgencyFee)}</p>
                  <p>Скидка: -{formatMoney(selectedTicket.estimate.pricing.discount)}</p>
                  <p className="font-bold text-slate-900">
                    Итог: {formatMoney(selectedTicket.estimate.pricing.total)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">
              Выберите заявку из списка или введите номер заказа вручную.
            </p>
          )}
        </article>
      </div>
    </div>
  )
}
