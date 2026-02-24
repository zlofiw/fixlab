import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { SectionHeading } from '../components/SectionHeading.tsx'
import { useTickets } from '../context/useTickets.ts'
import { DEVICE_CATALOG, ISSUE_CATALOG, URGENCY_POLICIES } from '../data/catalog.ts'
import { PHONE_REPAIR_MEDIA, WORKBENCH_MEDIA } from '../data/media.ts'
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

function phoneDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function isKazakhstanPhone(value: string): boolean {
  const digits = phoneDigits(value)
  if (digits.length === 10) {
    return true
  }
  if (digits.length === 11) {
    return digits.startsWith('7') || digits.startsWith('8')
  }
  return false
}

export function NewRequestPage() {
  const { tickets, createRequest, apiAvailable, dataSource } = useTickets()
  const [form, setForm] = useState<ServiceRequestInput>(defaultForm)
  const [createdTicket, setCreatedTicket] = useState<ServiceTicket | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const activeTicketsCount = tickets.filter((ticket) => !isTicketReady(ticket)).length
  const preview = useMemo(() => estimateRepair(form, activeTicketsCount), [activeTicketsCount, form])

  async function submitHandler(event: FormEvent<HTMLFormElement>) {
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

<<<<<<< HEAD
    setCreatedTicket(null)
    setSubmitting(true)
    try {
      const ticket = await createRequest({
        ...form,
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        issueDetails: form.issueDetails.trim(),
      })
      setCreatedTicket(ticket)
      setError('')
      setForm(defaultForm)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Не удалось создать заявку. Попробуйте снова.')
    } finally {
      setSubmitting(false)
    }
=======
    const ticket = await createRequest({
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
>>>>>>> 4a6a20737d9270cb58508fd898656fc41197ed01
  }

  return (
    <div className="space-y-10 pb-6 pt-4 md:space-y-12 md:pt-8">
      <section className="panel overflow-hidden rounded-[1.8rem]">
        <div className="grid xl:grid-cols-[1.02fr_0.98fr]">
          <div className="p-6 md:p-8">
            <SectionHeading
              tag="Новая заявка"
              title="Оформление ремонта с автоматическим расчетом срока и стоимости"
              description="Система сразу формирует номер заказа, код доступа, диапазон стоимости и плановую дату готовности."
            />
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              <span
                className={
                  apiAvailable
                    ? 'rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800'
                    : 'rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800'
                }
              >
                {apiAvailable ? 'Сохранение на сервере' : 'Сохранение временно недоступно'}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                Источник: {dataSource === 'api' ? 'сервер' : 'нет соединения'}
              </span>
            </div>
          </div>
          <div className="border-t border-slate-200 xl:border-l xl:border-t-0">
            <div className="grid h-full gap-0 sm:grid-cols-2 xl:grid-cols-1">
              <img src={PHONE_REPAIR_MEDIA.url} alt={PHONE_REPAIR_MEDIA.alt} className="h-48 w-full object-cover sm:h-full" loading="lazy" decoding="async" />
              <img src={WORKBENCH_MEDIA.url} alt={WORKBENCH_MEDIA.alt} className="h-48 w-full object-cover sm:h-full" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={submitHandler} className="panel rounded-[1.8rem] p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Имя клиента</span>
              <input value={form.customerName} onChange={(event) => setForm((prev) => ({ ...prev, customerName: event.target.value }))} placeholder="Иван Иванов" className="field-base rounded-2xl px-4 py-3 text-sm font-semibold" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Телефон</span>
              <input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder="+7 (7__) ___-__-__" className="field-base rounded-2xl px-4 py-3 text-sm font-semibold" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Эл. почта (необязательно)</span>
              <input type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="name@mail.kz" className="field-base rounded-2xl px-4 py-3 text-sm font-semibold" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Тип устройства</span>
              <select value={form.deviceType} onChange={(event) => setForm((prev) => ({ ...prev, deviceType: event.target.value as ServiceRequestInput['deviceType'] }))} className="field-base rounded-2xl px-4 py-3 text-sm font-semibold">
                {DEVICE_CATALOG.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Бренд</span>
              <input value={form.brand} onChange={(event) => setForm((prev) => ({ ...prev, brand: event.target.value }))} placeholder="Apple / Samsung / Dell" className="field-base rounded-2xl px-4 py-3 text-sm font-semibold" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Модель</span>
              <input value={form.model} onChange={(event) => setForm((prev) => ({ ...prev, model: event.target.value }))} placeholder="iPhone 13 / ThinkPad T14" className="field-base rounded-2xl px-4 py-3 text-sm font-semibold" />
            </label>
            <label className="grid gap-1.5 md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Тип неисправности</span>
              <select value={form.issueType} onChange={(event) => setForm((prev) => ({ ...prev, issueType: event.target.value as ServiceRequestInput['issueType'] }))} className="field-base rounded-2xl px-4 py-3 text-sm font-semibold">
                {ISSUE_CATALOG.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Описание проблемы</span>
              <textarea rows={4} value={form.issueDetails} onChange={(event) => setForm((prev) => ({ ...prev, issueDetails: event.target.value }))} placeholder="Что произошло, когда появилась проблема и как ведет себя устройство сейчас." className="field-base rounded-2xl px-4 py-3 text-sm font-semibold" />
            </label>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {URGENCY_POLICIES.map((policy) => (
              <button
                key={policy.id}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, urgency: policy.id }))}
                className={policy.id === form.urgency ? 'rounded-2xl border border-cyan-200 bg-cyan-100 px-4 py-3 text-left' : 'rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left'}
              >
                <p className="text-sm font-bold text-slate-950">{policy.label}</p>
                <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">{policy.details}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={form.hasWarranty} onChange={(event) => setForm((prev) => ({ ...prev, hasWarranty: event.target.checked }))} className="h-4 w-4 accent-cyan-700" />
              Устройство на гарантии
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={form.repeatCustomer} onChange={(event) => setForm((prev) => ({ ...prev, repeatCustomer: event.target.checked }))} className="h-4 w-4 accent-cyan-700" />
              Повторный клиент
            </label>
          </div>

          {error ? <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}

          <button type="submit" disabled={submitting} className="mt-6 inline-flex items-center rounded-2xl bg-[linear-gradient(135deg,#12263a,#15847a)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(18,38,58,0.22)] disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Создание заявки...' : 'Создать заявку'}
          </button>
        </form>

        <aside className="space-y-6">
          <article className="panel rounded-[1.8rem] p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold text-slate-950">Предварительная оценка</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
              Превью пересчитывается по тем же правилам, которые используются при создании реальной заявки.
            </p>
            <p className="mt-5 font-display text-3xl font-bold text-slate-950">
              {formatMoney(preview.pricing.minTotal)} - {formatMoney(preview.pricing.maxTotal)}
            </p>
            <div className="mt-4 grid gap-2 text-sm font-medium text-slate-700">
              <p>Диагностика: {formatMoney(preview.pricing.diagnosticFee)}</p>
              <p>Работа: {formatMoney(preview.pricing.laborFee)}</p>
              <p>Детали: {formatMoney(preview.pricing.partsReserve)}</p>
              <p>Срочность: {formatMoney(preview.pricing.urgencyFee)}</p>
              <p>Скидка: -{formatMoney(preview.pricing.discount)}</p>
            </div>
            <div className="mt-4 border-t border-slate-200 pt-4 text-sm font-semibold text-slate-700">
              <p>Ожидание очереди: {formatHours(preview.queueDelayHours)}</p>
              <p>Работы по устройству: {formatHours(preview.repairHours)}</p>
              <p className="text-slate-950">Плановая выдача: {formatDateTime(preview.promiseDate)}</p>
            </div>
          </article>

          <article className="panel rounded-[1.8rem] p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold text-slate-950">После создания заявки</h2>
            {createdTicket ? (
              <div className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
                <p>Номер заказа: <span className="font-extrabold text-slate-950">{createdTicket.ticketNumber}</span></p>
                <p>Код доступа: <span className="font-extrabold text-slate-950">{createdTicket.accessCode}</span></p>
                <p>Плановая выдача: {formatDateTime(createdTicket.estimate.promiseDate)}</p>
                <Link to={`/track?ticket=${encodeURIComponent(createdTicket.ticketNumber)}&code=${encodeURIComponent(createdTicket.accessCode)}`} className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300">
                  Открыть трекинг
                </Link>
              </div>
            ) : (
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
                Номер заказа и код доступа появятся здесь сразу после отправки формы.
              </p>
            )}
          </article>
        </aside>
      </div>
    </div>
  )
}
