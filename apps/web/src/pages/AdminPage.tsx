import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { SectionHeading } from '../components/SectionHeading.tsx'
import { StatusPill } from '../components/StatusPill.tsx'
import { useTickets } from '../context/useTickets.ts'
import { DEVICE_LABELS, ISSUE_LABELS, STAGE_LABELS, URGENCY_LABELS } from '../data/catalog.ts'
import { COMPONENT_CLOSEUP_MEDIA } from '../data/media.ts'
import { ticketsApi, type AdminSummaryPayload } from '../lib/api.ts'
import { formatDateTime, formatMoney } from '../lib/format.ts'
import { getTrackingSnapshot, TICKET_STAGE_ORDER } from '../lib/repairEngine.ts'
import type { ServiceTicket, TicketStage } from '../types/domain.ts'

type StageFilter = 'all' | TicketStage

type AdminUser = {
  id: string
  username: string
}

const DATA_SOURCE_LABELS = {
  api: 'сервер',
  local: 'нет соединения',
} as const

export function AdminPage() {
  const {
    tickets,
    loading,
    syncing,
    apiAvailable,
    dataSource,
    errorMessage,
    refreshTickets,
    updateTicketStage,
  } = useTickets()

  const [authLoading, setAuthLoading] = useState(true)
  const [authUser, setAuthUser] = useState<AdminUser | null>(null)
  const [authError, setAuthError] = useState('')
  const [loginUsername, setLoginUsername] = useState('admin')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginSubmitting, setLoginSubmitting] = useState(false)
  const [summary, setSummary] = useState<AdminSummaryPayload | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [stageFilter, setStageFilter] = useState<StageFilter>('all')
  const [selectedTicketId, setSelectedTicketId] = useState('')
  const [updatingStage, setUpdatingStage] = useState<TicketStage | null>(null)

  const entries = useMemo(
    () =>
      tickets.map((ticket) => ({
        ticket,
        snapshot: getTrackingSnapshot(ticket),
      })),
    [tickets],
  )

  const filtered = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase()

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
  }, [deferredSearch, entries, stageFilter])

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

  const localStats = useMemo(() => {
    const stageCounts: AdminSummaryPayload['stageCounts'] = {
      accepted: 0,
      diagnostics: 0,
      approval: 0,
      repair: 0,
      quality: 0,
      ready: 0,
    }

    let totalAmount = 0
    let express = 0

    for (const { ticket, snapshot } of entries) {
      stageCounts[snapshot.stage] += 1
      totalAmount += ticket.estimate.pricing.total
      if (ticket.request.urgency === 'express') {
        express += 1
      }
    }

    return {
      total: entries.length,
      active: entries.length - stageCounts.ready,
      ready: stageCounts.ready,
      express,
      totalAmount,
      stageCounts,
    }
  }, [entries])

  const stats = summary ?? localStats

  useEffect(() => {
    let cancelled = false

    async function checkSession() {
      try {
        const me = await ticketsApi.authMe()
        if (cancelled) {
          return
        }
        setAuthUser(me.user)
        setAuthError('')
      } catch {
        if (cancelled) {
          return
        }
        setAuthUser(null)
      } finally {
        if (!cancelled) {
          setAuthLoading(false)
        }
      }
    }

    void checkSession()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadSummary() {
      if (!authUser) {
        setSummary(null)
        return
      }

      setSummaryLoading(true)
      try {
        const payload = await ticketsApi.adminSummary()
        if (!cancelled) {
          setSummary(payload)
          setAuthError('')
        }
      } catch (error) {
        if (!cancelled) {
          setSummary(null)
          setAuthError(error instanceof Error ? error.message : 'Не удалось загрузить сводку администратора')
        }
      } finally {
        if (!cancelled) {
          setSummaryLoading(false)
        }
      }
    }

    void loadSummary()

    return () => {
      cancelled = true
    }
  }, [authUser, tickets])

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginSubmitting(true)
    try {
      const result = await ticketsApi.authLogin(loginUsername.trim(), loginPassword)
      setAuthUser(result.user)
      setAuthError('')
      setLoginPassword('')
      await refreshTickets()
    } catch (error) {
      setAuthUser(null)
      setAuthError(error instanceof Error ? error.message : 'Ошибка авторизации')
    } finally {
      setLoginSubmitting(false)
    }
  }

  async function logout() {
    try {
      await ticketsApi.authLogout()
    } catch {
      setAuthError('Не удалось корректно завершить сессию на сервере')
    }

    setAuthUser(null)
    setSummary(null)
  }

  async function applyStage(ticket: ServiceTicket, stage: TicketStage) {
    if (!authUser) {
      setAuthError('Сначала выполните вход в админ-панель')
      return
    }

    setUpdatingStage(stage)
    try {
      const result = await updateTicketStage(ticket.id, stage)
      if (!result) {
        setAuthError('Заявка не найдена')
        return
      }
      setAuthError('')
      await refreshTickets()
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Не удалось обновить этап')
    } finally {
      setUpdatingStage(null)
    }
  }

  if (authLoading) {
    return (
      <div className="space-y-8 pb-6 pt-4 md:pt-8">
        <section className="panel rounded-[1.8rem] p-6 md:p-8">
          <p className="text-sm font-semibold text-slate-600">Проверка сессии администратора...</p>
        </section>
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="space-y-10 pb-6 pt-4 md:space-y-12 md:pt-8">
        <section className="panel soft-ring overflow-hidden rounded-[1.8rem]">
          <div className="grid xl:grid-cols-[1.02fr_0.98fr]">
            <div className="p-6 md:p-8">
              <SectionHeading
                tag="Админ-панель"
                title="Авторизация администратора для управления очередью ремонта"
                description="Статусы ремонта и административная сводка доступны только после входа. Сессия сохраняется в базе данных и не теряется при перезапуске фронтенда."
              />
              <form onSubmit={submitLogin} className="mt-6 grid max-w-lg gap-4 rounded-3xl border border-white/70 bg-white/70 p-4 shadow-[0_16px_32px_rgba(15,23,42,0.06)] backdrop-blur-sm">
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Логин</span>
                  <input
                    value={loginUsername}
                    onChange={(event) => setLoginUsername(event.target.value)}
                    className="field-base rounded-2xl px-4 py-3 text-sm font-semibold"
                    placeholder="admin"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Пароль</span>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    className="field-base rounded-2xl px-4 py-3 text-sm font-semibold"
                    placeholder="Введите пароль администратора"
                  />
                </label>
                {authError ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {authError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={loginSubmitting}
                  className="rounded-2xl bg-[linear-gradient(135deg,#12263a,#15847a)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(18,38,58,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_38px_rgba(18,38,58,0.28)] disabled:opacity-60"
                >
                  {loginSubmitting ? 'Вход...' : 'Войти в админ-панель'}
                </button>
                <p className="text-xs font-semibold text-slate-500">
                  Логин по умолчанию: <span className="font-bold text-slate-700">admin</span>. Пароль задаётся через переменную окружения <code>FIXLAB_ADMIN_PASSWORD</code>, если не задан — <code>admin12345</code>.
                </p>
              </form>
            </div>
            <div className="relative border-t border-slate-200 xl:border-l xl:border-t-0">
              <img src={COMPONENT_CLOSEUP_MEDIA.url} alt={COMPONENT_CLOSEUP_MEDIA.alt} className="h-full min-h-[18rem] w-full object-cover" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 grid gap-2">
                <div className="rounded-2xl border border-white/20 bg-black/30 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm">
                  Защищённый вход по серверной сессии
                </div>
                <div className="rounded-2xl border border-white/20 bg-black/25 px-4 py-3 text-xs font-semibold text-white/85 backdrop-blur-sm">
                  После входа доступны сводка, фильтры очереди и управление этапами ремонта
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-6 pt-4 md:space-y-12 md:pt-8">
      <section className="panel soft-ring overflow-hidden rounded-[1.8rem]">
        <div className="grid xl:grid-cols-[1.04fr_0.96fr]">
          <div className="p-6 md:p-8">
            <SectionHeading
              tag="Админ-панель"
              title="Панель управления очередью, этапами ремонта и статусами заявок"
              description="Управляйте этапами ремонта, отслеживайте загрузку мастерской и синхронизируйте изменения через защищённую серверную сессию."
            />
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              <span
                className={
                  apiAvailable
                    ? 'rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800'
                    : 'rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800'
                }
              >
                {apiAvailable ? 'Сервер доступен' : 'Сервер недоступен'}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                Источник данных: {DATA_SOURCE_LABELS[dataSource]}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Админ: {authUser.username}</span>
              {syncing ? <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Синхронизация...</span> : null}
              {summaryLoading ? <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Обновление сводки...</span> : null}
            </div>
            {errorMessage ? (
              <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                {errorMessage}
              </p>
            ) : null}
            {authError ? (
              <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {authError}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void refreshTickets()}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_20px_rgba(15,23,42,0.08)]"
              >
                Обновить очередь
              </button>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_20px_rgba(15,23,42,0.08)]"
              >
                Выйти
              </button>
            </div>
          </div>
          <div className="relative border-t border-slate-200 xl:border-l xl:border-t-0">
            <img src={COMPONENT_CLOSEUP_MEDIA.url} alt={COMPONENT_CLOSEUP_MEDIA.alt} className="h-full min-h-[18rem] w-full object-cover" loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="metric-card rounded-3xl p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Всего</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-950">{stats.total}</p>
        </article>
        <article className="metric-card rounded-3xl p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Активные</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-950">{stats.active}</p>
        </article>
        <article className="metric-card rounded-3xl p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Готово</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-950">{stats.ready}</p>
        </article>
        <article className="metric-card rounded-3xl p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Экспресс</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-950">{stats.express}</p>
        </article>
        <article className="metric-card rounded-3xl p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Портфель</p>
          <p className="mt-2 font-display text-lg font-bold text-slate-950">{formatMoney(stats.totalAmount)}</p>
          <p className="mt-2 text-xs font-semibold text-slate-500">Серверная сводка: {summary ? 'да' : 'нет'}</p>
        </article>
      </section>

      <section className="panel rounded-[1.6rem] p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-slate-950">Распределение по этапам</h2>
          <p className="text-xs font-semibold text-slate-500">Обновляется из текущей очереди и серверной сводки</p>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {TICKET_STAGE_ORDER.map((stage) => (
            <div key={stage} className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{STAGE_LABELS[stage]}</p>
              <p className="mt-1 font-display text-2xl font-bold text-slate-950">{stats.stageCounts[stage]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="panel soft-ring rounded-[1.8rem] p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-950">Очередь заявок</h2>
              <p className="mt-1 text-sm font-medium text-slate-600">Поиск по клиенту, устройству, телефону или номеру заявки.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск по очереди"
              className="field-base rounded-2xl px-4 py-3 text-sm font-semibold"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStageFilter('all')}
                className={
                  stageFilter === 'all'
                    ? 'rounded-xl border border-cyan-200 bg-cyan-100 px-3 py-2 text-xs font-bold text-cyan-900 shadow-[0_8px_18px_rgba(34,211,238,0.14)]'
                    : 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50'
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
                      ? 'rounded-xl border border-cyan-200 bg-cyan-100 px-3 py-2 text-xs font-bold text-cyan-900 shadow-[0_8px_18px_rgba(34,211,238,0.14)]'
                      : 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50'
                  }
                >
                  {STAGE_LABELS[stage]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {loading ? (
              <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">Загрузка очереди...</p>
            ) : filtered.length > 0 ? (
              filtered.map(({ ticket, snapshot }) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={
                    ticket.id === selectedTicketId
                      ? 'w-full rounded-3xl border border-cyan-200 bg-[linear-gradient(180deg,rgba(236,254,255,0.95),rgba(236,254,255,0.7))] px-4 py-4 text-left shadow-[0_14px_28px_rgba(34,211,238,0.1)]'
                      : 'w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]'
                  }
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-950">{ticket.ticketNumber}</p>
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
                    <p>{URGENCY_LABELS[ticket.request.urgency]}</p>
                    <p>{formatDateTime(ticket.createdAt)}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">Заявки по текущим фильтрам не найдены.</p>
            )}
          </div>
        </article>

        <article className="panel soft-ring rounded-[1.8rem] p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-950">Рабочая область заявки</h2>
          {selectedTicket && selectedSnapshot ? (
            <div className="mt-5 space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_12px_26px_rgba(15,23,42,0.06)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Заявка</p>
                    <p className="mt-1 text-lg font-extrabold text-slate-950">{selectedTicket.ticketNumber}</p>
                  </div>
                  <StatusPill stage={selectedSnapshot.stage} label={selectedSnapshot.stageLabel} />
                </div>
                <div className="mt-4 grid gap-2 text-sm font-medium text-slate-700 sm:grid-cols-2">
                  <p>Клиент: {selectedTicket.request.customerName}</p>
                  <p>Телефон: {selectedTicket.request.phone}</p>
                  <p>
                    Устройство: {selectedTicket.request.brand} {selectedTicket.request.model}
                  </p>
                  <p>Тип: {DEVICE_LABELS[selectedTicket.request.deviceType]}</p>
                  <p>Неисправность: {ISSUE_LABELS[selectedTicket.request.issueType]}</p>
                  <p>Срочность: {URGENCY_LABELS[selectedTicket.request.urgency]}</p>
                  <p>План выдачи: {formatDateTime(selectedTicket.estimate.promiseDate)}</p>
                  <p>Сумма: {formatMoney(selectedTicket.estimate.pricing.total)}</p>
                </div>
                <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  {selectedTicket.request.issueDetails}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_12px_26px_rgba(15,23,42,0.06)]">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Смена этапа</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {TICKET_STAGE_ORDER.map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => void applyStage(selectedTicket, stage)}
                      disabled={updatingStage !== null}
                      className={
                        selectedSnapshot.stage === stage
                          ? 'rounded-2xl border border-cyan-200 bg-cyan-100 px-4 py-3 text-left text-sm font-bold text-cyan-900 shadow-[0_8px_18px_rgba(34,211,238,0.14)] disabled:opacity-70'
                          : 'rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-70'
                      }
                    >
                      {STAGE_LABELS[stage]}
                    </button>
                  ))}
                </div>
                {updatingStage ? <p className="mt-3 text-xs font-semibold text-slate-500">Обновление этапа...</p> : null}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_12px_26px_rgba(15,23,42,0.06)]">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Плановый таймлайн</p>
                <div className="mt-3 space-y-2">
                  {selectedTicket.timeline.map((step) => (
                    <div
                      key={step.stage}
                      className={
                        step.stage === selectedSnapshot.stage
                          ? 'rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 shadow-[0_8px_16px_rgba(34,211,238,0.08)]'
                          : 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'
                      }
                    >
                      <p className="text-sm font-bold text-slate-950">{step.label}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">{formatDateTime(step.plannedAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">
              Выберите заявку слева, чтобы посмотреть детали и изменить этап ремонта.
            </p>
          )}
        </article>
      </section>
    </div>
  )
}
