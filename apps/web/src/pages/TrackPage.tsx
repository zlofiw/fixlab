import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SectionHeading } from '../components/SectionHeading.tsx'
import { StatusPill } from '../components/StatusPill.tsx'
import { useTickets } from '../context/useTickets.ts'
import { WORKBENCH_MEDIA } from '../data/media.ts'
import { ticketsApi } from '../lib/api.ts'
import { formatDateTime, formatMoney, formatPercent } from '../lib/format.ts'
import { getTrackingSnapshot, sanitizeAccessCode, sanitizeTicketNumber } from '../lib/repairEngine.ts'
import type { ServiceTicket } from '../types/domain.ts'

export function TrackPage() {
  const { apiAvailable, dataSource, errorMessage } = useTickets()
  const [searchParams] = useSearchParams()
  const queryTicket = searchParams.get('ticket') ?? ''
  const queryCode = searchParams.get('code') ?? ''

  const [ticketNumber, setTicketNumber] = useState(queryTicket)
  const [accessCode, setAccessCode] = useState(queryCode)
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null)
  const [searchError, setSearchError] = useState('')
  const [searching, setSearching] = useState(false)

  async function lookupTicket(rawTicketNumber: string, rawAccessCode: string) {
    const normalizedTicketNumber = sanitizeTicketNumber(rawTicketNumber)
    const normalizedAccessCode = sanitizeAccessCode(rawAccessCode)

    if (!normalizedTicketNumber || !normalizedAccessCode) {
      setSelectedTicket(null)
      setSearchError('Введите номер заказа и код доступа.')
      return
    }

    setSearching(true)
    try {
      const ticket = await ticketsApi.lookup(normalizedTicketNumber, normalizedAccessCode)
      setSelectedTicket(ticket)
      setSearchError('')
    } catch (error) {
      setSelectedTicket(null)
      const message = error instanceof Error ? error.message : 'Не удалось выполнить поиск заявки.'
      setSearchError(message === 'Заявка не найдена' ? 'Заявка не найдена. Проверьте номер заказа и код доступа.' : message)
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    if (!queryTicket || !queryCode) {
      return
    }

    void lookupTicket(queryTicket, queryCode)
  }, [queryTicket, queryCode])

  function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void lookupTicket(ticketNumber, accessCode)
  }

  const snapshot = selectedTicket ? getTrackingSnapshot(selectedTicket) : null
  const currentStageIndex =
    selectedTicket && snapshot
      ? selectedTicket.timeline.findIndex((step) => step.stage === snapshot.stage)
      : -1

  return (
    <div className="space-y-10 pb-6 pt-4 md:space-y-12 md:pt-8">
      <section className="panel overflow-hidden rounded-[1.8rem]">
        <div className="grid xl:grid-cols-[1.03fr_0.97fr]">
          <div className="p-6 md:p-8">
            <SectionHeading
              tag="Трекинг ремонта"
              title="Проверьте статус ремонта по номеру заказа и коду доступа"
              description="Клиент может самостоятельно увидеть текущий этап, прогресс и плановую дату выдачи без звонка в сервисный центр."
            />
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              <span
                className={
                  apiAvailable
                    ? 'rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800'
                    : 'rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800'
                }
              >
                {apiAvailable ? 'Поиск на сервере доступен' : 'Сервер недоступен'}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                Источник: {dataSource === 'api' ? 'сервер' : 'нет соединения'}
              </span>
              {searching ? <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Поиск...</span> : null}
            </div>
            {errorMessage ? (
              <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                {errorMessage}
              </p>
            ) : null}
          </div>
          <div className="border-t border-slate-200 xl:border-l xl:border-t-0">
            <img src={WORKBENCH_MEDIA.url} alt={WORKBENCH_MEDIA.alt} loading="lazy" decoding="async" className="h-full min-h-[18rem] w-full object-cover" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <article className="panel rounded-[1.8rem] p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-950">Найти заявку</h2>
          <form onSubmit={submitHandler} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Номер заказа</span>
              <input value={ticketNumber} onChange={(event) => setTicketNumber(sanitizeTicketNumber(event.target.value))} placeholder="FXL-260224-1234" className="field-base rounded-2xl px-4 py-3 text-sm font-semibold" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Код доступа</span>
              <input value={accessCode} onChange={(event) => setAccessCode(sanitizeAccessCode(event.target.value))} placeholder="4-6 цифр" className="field-base rounded-2xl px-4 py-3 text-sm font-semibold" />
            </label>
            <button type="submit" disabled={searching} className="sm:col-span-2 rounded-2xl bg-[linear-gradient(135deg,#12263a,#15847a)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(18,38,58,0.22)] disabled:cursor-not-allowed disabled:opacity-60">
              {searching ? 'Идёт поиск...' : 'Показать статус'}
            </button>
          </form>

          {searchError ? <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{searchError}</p> : null}

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4">
            <h3 className="font-display text-lg font-bold text-slate-950">Где взять данные для проверки</h3>
            <div className="mt-3 space-y-2 text-sm font-medium text-slate-600">
              <p>Номер заказа и код доступа выдаются сразу после оформления заявки.</p>
              <p>Если вы оформили заявку на сайте, эти данные отображаются на странице оформления после отправки формы.</p>
              <p>Если данные утеряны, обратитесь в сервис с номером телефона клиента.</p>
            </div>
          </div>
        </article>

        <article className="panel rounded-[1.8rem] p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-950">Текущий статус ремонта</h2>
          {selectedTicket && snapshot ? (
            <div className="mt-5 space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Заказ</p>
                    <p className="mt-1 text-sm font-extrabold text-slate-950">{selectedTicket.ticketNumber} / код {selectedTicket.accessCode}</p>
                  </div>
                  <StatusPill stage={snapshot.stage} label={snapshot.stageLabel} />
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-[linear-gradient(90deg,#12263a,#10b981)]" style={{ width: `${Math.max(4, Math.round(snapshot.progress * 100))}%` }} />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Готовность {formatPercent(snapshot.progress)} · Плановая выдача {formatDateTime(snapshot.etaDate)}
                </p>
              </div>

              <div className="grid gap-2">
                {selectedTicket.timeline.map((step, index) => {
                  const done = index <= currentStageIndex
                  return (
                    <div key={step.stage} className={done ? 'rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3' : 'rounded-2xl border border-slate-200 bg-white px-4 py-3'}>
                      <p className="text-sm font-bold text-slate-950">{step.label}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">Плановое время: {formatDateTime(step.plannedAt)}</p>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Финансовая оценка</p>
                <div className="mt-3 grid gap-2 text-sm font-medium text-slate-700">
                  <p>Диагностика: {formatMoney(selectedTicket.estimate.pricing.diagnosticFee)}</p>
                  <p>Работа: {formatMoney(selectedTicket.estimate.pricing.laborFee)}</p>
                  <p>Детали: {formatMoney(selectedTicket.estimate.pricing.partsReserve)}</p>
                  <p>Срочность: {formatMoney(selectedTicket.estimate.pricing.urgencyFee)}</p>
                  <p>Скидка: -{formatMoney(selectedTicket.estimate.pricing.discount)}</p>
                  <p className="font-bold text-slate-950">Итого: {formatMoney(selectedTicket.estimate.pricing.total)}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">
              Введите номер и код доступа, чтобы получить актуальный статус заявки с сервера.
            </p>
          )}
        </article>
      </div>
    </div>
  )
}
