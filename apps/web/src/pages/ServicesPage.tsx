import { useMemo, useState } from 'react'
import { SectionHeading } from '../components/SectionHeading.tsx'
import { useTickets } from '../context/useTickets.ts'
import { DEVICE_CATALOG, ISSUE_CATALOG, URGENCY_POLICIES } from '../data/catalog.ts'
import { COMPONENT_CLOSEUP_MEDIA, DEVICE_MEDIA } from '../data/media.ts'
import { formatDateTime, formatHours, formatMoney } from '../lib/format.ts'
import { estimateRepair, isTicketReady } from '../lib/repairEngine.ts'
import type { DeviceType, IssueType, ServiceRequestInput, UrgencyType } from '../types/domain.ts'

const requestTemplateBase = {
  customerName: 'Клиент',
  phone: '+7 (700) 000-00-00',
  email: 'client@sample.kz',
  model: 'Модель',
  issueDetails: 'Предпросмотр расчета на странице услуг.',
  hasWarranty: false,
  repeatCustomer: false,
} as const

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
      ...requestTemplateBase,
      deviceType,
      issueType,
      urgency,
      brand,
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
    <div className="space-y-10 pb-6 pt-4 md:space-y-12 md:pt-8">
      <section className="panel overflow-hidden rounded-[1.8rem]">
        <div className="grid gap-0 xl:grid-cols-[1.06fr_0.94fr]">
          <div className="p-6 md:p-8">
            <SectionHeading
              tag="Калькулятор услуг"
              title="Стоимость и срок ремонта рассчитываются по той же модели, что и при оформлении заявки"
              description="Без условных маркетинговых цифр. Здесь работает та же расчетная модель, что на форме приема ремонта и в админ-планировании."
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {URGENCY_POLICIES.map((policy) => (
                <article key={policy.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{policy.label}</p>
                  <p className="mt-2 font-display text-2xl font-bold text-slate-950">x{policy.priceMultiplier.toFixed(2)}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Коэф. времени x{policy.timeMultiplier.toFixed(2)}</p>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{policy.details}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="relative min-h-[20rem] border-t border-slate-200 xl:border-l xl:border-t-0">
            <img src={COMPONENT_CLOSEUP_MEDIA.url} alt={COMPONENT_CLOSEUP_MEDIA.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-black/30 p-4 text-white backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">Компонентная логика</p>
              <p className="mt-2 text-sm font-medium leading-relaxed">
                Итоговая оценка формируется из базовой диагностики, работ, резерва комплектующих и выбранной срочности.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <article className="panel rounded-[1.8rem] p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-950 md:text-3xl">Категории ремонта</h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
            Категория устройства влияет на базовую диагностику, трудоемкость и риск по деталям в расчетной модели.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {DEVICE_CATALOG.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <img src={DEVICE_MEDIA[item.id].url} alt={DEVICE_MEDIA[item.id].alt} loading="lazy" decoding="async" className="h-36 w-full object-cover" />
                <div className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-slate-950">{item.label}</h3>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                      {formatHours(item.baseHours)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{item.categoryNote}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Диагностика от {formatMoney(item.baseDiagnosticFee)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="panel rounded-[1.8rem] p-6 md:p-8">
          <h2 className="font-display text-2xl font-bold text-slate-950 md:text-3xl">Живой расчет</h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
            Выберите параметры, чтобы увидеть ориентировочную цену и плановый срок до оформления заявки.
          </p>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Тип устройства</span>
              <select value={deviceType} onChange={(event) => setDeviceType(event.target.value as DeviceType)} className="field-base rounded-2xl px-4 py-3 text-sm font-semibold">
                {DEVICE_CATALOG.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Тип неисправности</span>
              <select value={issueType} onChange={(event) => setIssueType(event.target.value as IssueType)} className="field-base rounded-2xl px-4 py-3 text-sm font-semibold">
                {ISSUE_CATALOG.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Бренд</span>
              <input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Apple, Samsung, Dell" className="field-base rounded-2xl px-4 py-3 text-sm font-semibold" />
            </label>

            <div className="grid gap-2 sm:grid-cols-3">
              {URGENCY_POLICIES.map((policy) => (
                <button
                  key={policy.id}
                  type="button"
                  onClick={() => setUrgency(policy.id)}
                  className={
                    policy.id === urgency
                      ? 'rounded-2xl border border-cyan-200 bg-cyan-100 px-3 py-3 text-left text-sm font-bold text-cyan-900'
                      : 'rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left text-sm font-semibold text-slate-700'
                  }
                >
                  <span className="block">{policy.label}</span>
                  <span className="mt-1 block text-xs font-medium text-slate-500">x{policy.priceMultiplier.toFixed(2)}</span>
                </button>
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={warranty} onChange={(event) => setWarranty(event.target.checked)} className="h-4 w-4 accent-cyan-700" />
                Гарантийный случай
              </label>
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={repeat} onChange={(event) => setRepeat(event.target.checked)} className="h-4 w-4 accent-cyan-700" />
                Повторный клиент
              </label>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,245,249,0.85))] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Диапазон оценки</p>
            <p className="mt-2 font-display text-3xl font-bold text-slate-950">
              {formatMoney(estimate.pricing.minTotal)} - {formatMoney(estimate.pricing.maxTotal)}
            </p>
            <div className="mt-4 grid gap-2 text-sm font-medium text-slate-700">
              <p>Диагностика: {formatMoney(estimate.pricing.diagnosticFee)}</p>
              <p>Работа: {formatMoney(estimate.pricing.laborFee)}</p>
              <p>Резерв деталей: {formatMoney(estimate.pricing.partsReserve)}</p>
              <p>Срочность: {formatMoney(estimate.pricing.urgencyFee)}</p>
              <p>Скидка: -{formatMoney(estimate.pricing.discount)}</p>
            </div>
            <div className="mt-4 border-t border-slate-200 pt-4 text-sm font-semibold text-slate-700">
              <p>Ожидание в очереди: {formatHours(estimate.queueDelayHours)}</p>
              <p>Работы по ремонту: {formatHours(estimate.repairHours)}</p>
              <p>Общий срок: {formatHours(estimate.leadHours)}</p>
              <p className="text-slate-950">Плановая выдача: {formatDateTime(estimate.promiseDate)}</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}
