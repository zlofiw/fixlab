import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { SectionHeading } from '../components/SectionHeading.tsx'
import { useTickets } from '../context/useTickets.ts'
import { DEVICE_CATALOG, ISSUE_CATALOG, URGENCY_POLICIES } from '../data/catalog.ts'
import { formatDateTime, formatHours, formatMoney } from '../lib/format.ts'
import { estimateRepair, isTicketReady } from '../lib/repairEngine.ts'
import type { ServiceRequestInput, ServiceTicket } from '../types/domain.ts'

const defaultForm: ServiceRequestInput = {
  customerName: '',
  phone: '',
  email: '',
  deviceType: 'smartphone',
  brand: '',
  model: '',
  issueType: 'screen',
  issueDetails: '',
  urgency: 'standard',
  hasWarranty: false,
  repeatCustomer: false,
}

function extractPhoneDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function isKazakhstanPhone(value: string): boolean {
  const digits = extractPhoneDigits(value)
  if (digits.length === 10) {
    return true
  }

  if (digits.length === 11) {
    return digits.startsWith('7') || digits.startsWith('8')
  }

  return false
}

export function NewRequestPage() {
  const { tickets, createRequest } = useTickets()
  const [form, setForm] = useState<ServiceRequestInput>(defaultForm)
  const [createdTicket, setCreatedTicket] = useState<ServiceTicket | null>(null)
  const [error, setError] = useState('')

  const activeTicketsCount = tickets.filter((ticket) => !isTicketReady(ticket)).length
  const preview = useMemo(() => estimateRepair(form, activeTicketsCount), [activeTicketsCount, form])

  function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.customerName.trim()) {
      setError('Укажите имя клиента.')
      return
    }
    if (!isKazakhstanPhone(form.phone)) {
      setError('Введите корректный номер Казахстана (+7 ...).')
      return
    }
    if (!form.brand.trim() || !form.model.trim()) {
      setError('Заполните бренд и модель устройства.')
      return
    }
    if (form.issueDetails.trim().length < 12) {
      setError('Опишите проблему подробнее (не менее 12 символов).')
      return
    }

    const ticket = createRequest({
      ...form,
      customerName: form.customerName.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      issueDetails: form.issueDetails.trim(),
      email: form.email.trim(),
    })

    setCreatedTicket(ticket)
    setError('')
    setForm(defaultForm)
  }

  return (
    <div className="space-y-8 pb-6 pt-6 md:space-y-10 md:pt-10">
      <section className="card-surface rounded-4xl p-6 md:p-10">
        <SectionHeading
          tag="НОВАЯ ЗАЯВКА"
          title="Оформление ремонта с автоматическим расчетом SLA"
          description="После отправки система генерирует номер заказа, код доступа и прогноз готовности."
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <form onSubmit={submitHandler} className="card-surface rounded-4xl p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-xs font-bold text-slate-500">Имя клиента</span>
              <input
                value={form.customerName}
                onChange={(event) => setForm((prev) => ({ ...prev, customerName: event.target.value }))}
                placeholder="Иван Иванов"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-500"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-bold text-slate-500">Телефон</span>
              <input
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="+7 (7__) ___-__-__"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-500"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-bold text-slate-500">E-mail (опционально)</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="name@mail.kz"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-500"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-bold text-slate-500">Тип устройства</span>
              <select
                value={form.deviceType}
                onChange={(event) => setForm((prev) => ({ ...prev, deviceType: event.target.value as ServiceRequestInput['deviceType'] }))}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-cyan-500"
              >
                {DEVICE_CATALOG.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-bold text-slate-500">Бренд</span>
              <input
                value={form.brand}
                onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))}
                placeholder="Apple / Samsung / Dell"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-500"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-bold text-slate-500">Модель</span>
              <input
                value={form.model}
                onChange={(event) => setForm((prev) => ({ ...prev, model: event.target.value }))}
                placeholder="iPhone 13 / ThinkPad T14"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-500"
              />
            </label>
            <label className="grid gap-1.5 md:col-span-2">
              <span className="text-xs font-bold text-slate-500">Неисправность</span>
              <select
                value={form.issueType}
                onChange={(event) => setForm((prev) => ({ ...prev, issueType: event.target.value as ServiceRequestInput['issueType'] }))}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-cyan-500"
              >
                {ISSUE_CATALOG.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 md:col-span-2">
              <span className="text-xs font-bold text-slate-500">Описание проблемы</span>
              <textarea
                rows={4}
                value={form.issueDetails}
                onChange={(event) => setForm((prev) => ({ ...prev, issueDetails: event.target.value }))}
                placeholder="Что произошло, после чего возникла проблема, какие симптомы..."
                className="resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-500"
              />
            </label>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {URGENCY_POLICIES.map((policy) => (
              <button
                key={policy.id}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, urgency: policy.id }))}
                className={
                  policy.id === form.urgency
                    ? 'rounded-2xl border border-cyan-200 bg-cyan-100 px-4 py-3 text-left'
                    : 'rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left'
                }
              >
                <p className="text-sm font-bold text-slate-900">{policy.label}</p>
                <p className="mt-1 text-xs font-medium text-slate-600">{policy.details}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.hasWarranty}
                onChange={(event) => setForm((prev) => ({ ...prev, hasWarranty: event.target.checked }))}
                className="h-4 w-4 accent-cyan-700"
              />
              Устройство на гарантии
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.repeatCustomer}
                onChange={(event) => setForm((prev) => ({ ...prev, repeatCustomer: event.target.checked }))}
                className="h-4 w-4 accent-cyan-700"
              />
              Уже ремонтировались у нас
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 inline-flex items-center rounded-2xl bg-linear-to-r from-cyan-700 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-800/30 transition-transform duration-300 hover:-translate-y-0.5"
          >
            Создать заявку
          </button>
        </form>

        <aside className="space-y-6">
          <article className="card-surface rounded-4xl p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold text-slate-900">Предварительная оценка</h2>
            <p className="mt-2 text-sm font-medium text-slate-600">
              Для текущих полей формы рассчитываются диапазон цены и срок.
            </p>
            <p className="mt-5 font-display text-3xl font-bold text-cyan-900">
              {formatMoney(preview.pricing.minTotal)} - {formatMoney(preview.pricing.maxTotal)}
            </p>
            <div className="mt-4 grid gap-2 text-sm font-medium text-slate-700">
              <p>Диагностика: {formatMoney(preview.pricing.diagnosticFee)}</p>
              <p>Работа мастера: {formatMoney(preview.pricing.laborFee)}</p>
              <p>Детали и компоненты: {formatMoney(preview.pricing.partsReserve)}</p>
              <p>Срочность: {formatMoney(preview.pricing.urgencyFee)}</p>
              <p>Скидки: -{formatMoney(preview.pricing.discount)}</p>
            </div>
            <div className="mt-4 border-t border-slate-200 pt-4 text-sm font-semibold text-slate-700">
              <p>Ожидание очереди: {formatHours(preview.queueDelayHours)}</p>
              <p>Работа по устройству: {formatHours(preview.repairHours)}</p>
              <p className="text-cyan-900">Плановая готовность: {formatDateTime(preview.promiseDate)}</p>
            </div>
          </article>

          <article className="card-surface rounded-4xl p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold text-slate-900">После создания заявки</h2>
            {createdTicket ? (
              <div className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
                <p>
                  Номер заказа: <span className="font-extrabold text-slate-900">{createdTicket.ticketNumber}</span>
                </p>
                <p>
                  Код доступа: <span className="font-extrabold text-slate-900">{createdTicket.accessCode}</span>
                </p>
                <p>Прогноз выдачи: {formatDateTime(createdTicket.estimate.promiseDate)}</p>
                <Link
                  to={`/track?ticket=${encodeURIComponent(createdTicket.ticketNumber)}&code=${encodeURIComponent(createdTicket.accessCode)}`}
                  className="mt-1 inline-flex rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white"
                >
                  Перейти к трекингу
                </Link>
              </div>
            ) : (
              <p className="mt-3 text-sm font-medium text-slate-600">
                Номер и код появятся здесь сразу после отправки формы.
              </p>
            )}
          </article>
        </aside>
      </div>
    </div>
  )
}
