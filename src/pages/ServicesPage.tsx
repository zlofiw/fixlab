import { useMemo, useState } from 'react'
import { SectionHeading } from '../components/SectionHeading.tsx'
import { useTickets } from '../context/useTickets.ts'
import { DEVICE_CATALOG, ISSUE_CATALOG, URGENCY_POLICIES } from '../data/catalog.ts'
import { formatDateTime, formatHours, formatMoney } from '../lib/format.ts'
import { estimateRepair, isTicketReady } from '../lib/repairEngine.ts'
import type { DeviceType, IssueType, ServiceRequestInput, UrgencyType } from '../types/domain.ts'

export function ServicesPage() {
  const { tickets } = useTickets()
  const activeTicketsCount = tickets.filter((ticket) => !isTicketReady(ticket)).length

  const [deviceType, setDeviceType] = useState<DeviceType>('smartphone')
  const [issueType, setIssueType] = useState<IssueType>('screen')
  const [urgency, setUrgency] = useState<UrgencyType>('standard')
  const [brand, setBrand] = useState('Samsung')
  const [warranty, setWarranty] = useState(false)
  const [repeat, setRepeat] = useState(false)

  const requestTemplate = useMemo<ServiceRequestInput>(
    () => ({
      customerName: 'Клиент',
      phone: '+7 (700) 000-00-00',
      email: 'client@sample.kz',
      deviceType,
      brand,
      model: 'Модель',
      issueType,
      issueDetails: 'Предпросмотр расчета на странице услуг.',
      urgency,
      hasWarranty: warranty,
      repeatCustomer: repeat,
    }),
    [brand, deviceType, issueType, repeat, urgency, warranty],
  )

  const estimate = useMemo(
    () => estimateRepair(requestTemplate, activeTicketsCount),
    [activeTicketsCount, requestTemplate],
  )

  return (
    <div className="space-y-10 pb-6 pt-6 md:space-y-12 md:pt-10">
      <section className="card-surface rounded-4xl p-6 md:p-10">
        <SectionHeading
          tag="УСЛУГИ И ЦЕНЫ"
          title="Прозрачная калькуляция ремонта для каждой категории техники"
          description="Стоимость формируется из диагностики, трудозатрат, резерва деталей и параметров срочности. Все суммы на сайте указаны в тенге."
        />

        <div className="mt-8 grid gap-4 xl:grid-cols-3">
          {URGENCY_POLICIES.map((policy) => (
            <article
              key={policy.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5"
            >
              <p className="text-xs font-bold tracking-wide text-cyan-800">{policy.label}</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-slate-900">
                x{policy.priceMultiplier.toFixed(2)}
              </h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{policy.details}</p>
              <p className="mt-4 text-xs font-semibold text-slate-500">
                Коэффициент времени: x{policy.timeMultiplier.toFixed(2)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="card-surface rounded-4xl p-6 md:p-8">
          <h2 className="font-display text-3xl font-bold text-slate-900">Каталог направлений</h2>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Базовые параметры категории участвуют в формуле итоговой стоимости и SLA.
          </p>

          <div className="mt-6 space-y-3">
            {DEVICE_CATALOG.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-900/5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-bold text-slate-900">{item.label}</h3>
                  <p className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800">
                    Диагностика от {formatMoney(item.baseDiagnosticFee)}
                  </p>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-600">{item.categoryNote}</p>
                <p className="mt-3 text-xs font-bold tracking-wide text-slate-500">
                  Базовая трудоемкость: {formatHours(item.baseHours)}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="card-surface rounded-4xl p-6 md:p-8">
          <h2 className="font-display text-3xl font-bold text-slate-900">Калькулятор ремонта</h2>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Превью использует ту же формулу, что и страница создания заявки.
          </p>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-xs font-bold text-slate-500">Тип устройства</span>
              <select
                value={deviceType}
                onChange={(event) => setDeviceType(event.target.value as DeviceType)}
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
              <span className="text-xs font-bold text-slate-500">Характер неисправности</span>
              <select
                value={issueType}
                onChange={(event) => setIssueType(event.target.value as IssueType)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-cyan-500"
              >
                {ISSUE_CATALOG.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-bold text-slate-500">Бренд</span>
              <input
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                placeholder="Например, Apple, Samsung, Dell"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-500"
              />
            </label>

            <div className="grid gap-2 sm:grid-cols-3">
              {URGENCY_POLICIES.map((policy) => (
                <button
                  key={policy.id}
                  type="button"
                  onClick={() => setUrgency(policy.id)}
                  className={
                    policy.id === urgency
                      ? 'rounded-2xl border border-cyan-200 bg-cyan-100 px-3 py-2 text-sm font-bold text-cyan-900'
                      : 'rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:border-cyan-100'
                  }
                >
                  {policy.label}
                </button>
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={warranty}
                  onChange={(event) => setWarranty(event.target.checked)}
                  className="h-4 w-4 accent-cyan-700"
                />
                Гарантийный случай
              </label>
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={repeat}
                  onChange={(event) => setRepeat(event.target.checked)}
                  className="h-4 w-4 accent-cyan-700"
                />
                Повторный клиент
              </label>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-cyan-200 bg-linear-to-br from-cyan-50 to-white p-5">
            <p className="text-xs font-bold tracking-wide text-cyan-800">Оценка по текущим параметрам</p>
            <p className="mt-2 font-display text-3xl font-bold text-cyan-950">
              {formatMoney(estimate.pricing.minTotal)} - {formatMoney(estimate.pricing.maxTotal)}
            </p>
            <div className="mt-4 grid gap-2 text-sm font-medium text-slate-700">
              <p>Диагностика: {formatMoney(estimate.pricing.diagnosticFee)}</p>
              <p>Работа мастера: {formatMoney(estimate.pricing.laborFee)}</p>
              <p>Резерв под детали: {formatMoney(estimate.pricing.partsReserve)}</p>
              <p>Надбавка за срочность: {formatMoney(estimate.pricing.urgencyFee)}</p>
              <p>Скидки и гарантия: -{formatMoney(estimate.pricing.discount)}</p>
            </div>
            <div className="mt-4 border-t border-cyan-200 pt-4 text-sm font-semibold text-slate-700">
              <p>Очередь: {formatHours(estimate.queueDelayHours)}</p>
              <p>Ремонт: {formatHours(estimate.repairHours)}</p>
              <p className="text-cyan-900">Прогноз готовности: {formatDateTime(estimate.promiseDate)}</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}
