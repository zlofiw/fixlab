import { Link } from 'react-router-dom'
import { SectionHeading } from '../components/SectionHeading.tsx'
import { StatusPill } from '../components/StatusPill.tsx'
import { useTickets } from '../context/useTickets.ts'
import { DEVICE_CATALOG } from '../data/catalog.ts'
import {
  COMPONENT_CLOSEUP_MEDIA,
  DEVICE_MEDIA,
  GALLERY_MEDIA,
  HERO_MEDIA,
  PHONE_PARTS_MEDIA,
  TECHNICIAN_MEDIA,
  WORKBENCH_MEDIA,
} from '../data/media.ts'
import { formatHours, formatMoney } from '../lib/format.ts'
import { getTrackingSnapshot, isTicketReady } from '../lib/repairEngine.ts'

const workflow = [
  {
    title: 'Прием устройства',
    text: 'Фиксируем состояние устройства, комплектность, проблему и срочность, затем выдаём номер заказа и код доступа.',
  },
  {
    title: 'Диагностика и оценка',
    text: 'Мастер подтверждает неисправность, уточняет диапазон стоимости и проверяет условия гарантии или скидки.',
  },
  {
    title: 'Согласование и ремонт',
    text: 'Работы начинаются после согласования. Этапы и плановая дата выдачи обновляются в трекинге автоматически.',
  },
  {
    title: 'Контроль качества и выдача',
    text: 'Проводим финальную проверку, нагрузочный тест и переводим заявку в статус готовности к выдаче.',
  },
]

export function HomePage() {
  const { tickets, loading, apiAvailable, dataSource } = useTickets()

  const activeTickets = tickets.filter((ticket) => !isTicketReady(ticket))
  const readyTickets = tickets.filter((ticket) => isTicketReady(ticket))
  const avgLeadHours =
    activeTickets.length > 0
      ? Math.round(activeTickets.reduce((sum, ticket) => sum + ticket.estimate.leadHours, 0) / activeTickets.length)
      : 0
  const estimatedPipeline = activeTickets.reduce((sum, ticket) => sum + ticket.estimate.pricing.total, 0)
  const expressShare =
    activeTickets.length > 0
      ? activeTickets.filter((ticket) => ticket.request.urgency === 'express').length / activeTickets.length
      : 0
  const recentTickets = tickets.slice(0, 4)

  return (
    <div className="space-y-14 pb-6 pt-4 md:space-y-16 md:pt-8">
      <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
        <div className="fade-up space-y-6">
          <div className="panel rounded-[1.8rem] p-6 md:p-8">
            <p className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
              Цифровая стойка приема
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-6xl">
              Сервисный центр с понятной логикой ремонта, сроков и статусов для клиента и мастера.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-600 md:text-lg">
              FixLab объединяет прием заявок, расчет диапазона стоимости, учет загрузки очереди, трекинг ремонта и административное управление этапами в одном интерфейсе.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/request"
                className="rounded-2xl bg-[linear-gradient(135deg,#12263a,#15847a)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(18,38,58,0.22)]"
              >
                Оформить заявку
              </Link>
              <Link
                to="/track"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300"
              >
                Отследить ремонт
              </Link>
              <Link
                to="/admin"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300"
              >
                Админ-панель
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
              <span
                className={
                  apiAvailable
                    ? 'inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-800'
                    : 'inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800'
                }
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {apiAvailable ? 'Сервер подключен' : 'Сервер недоступен'}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                Источник: {dataSource === 'api' ? 'сервер' : 'нет соединения'}
              </span>
              {loading ? <span className="rounded-full border border-slate-200 bg-white px-3 py-1">Загрузка очереди...</span> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="metric-card rounded-3xl p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Активные заявки</p>
              <p className="mt-2 font-display text-3xl font-bold text-slate-950">{activeTickets.length}</p>
            </article>
            <article className="metric-card rounded-3xl p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Средний срок</p>
              <p className="mt-2 font-display text-3xl font-bold text-slate-950">
                {activeTickets.length > 0 ? formatHours(avgLeadHours) : '0 ч'}
              </p>
            </article>
            <article className="metric-card rounded-3xl p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Портфель очереди</p>
              <p className="mt-2 font-display text-xl font-bold text-slate-950">{formatMoney(estimatedPipeline)}</p>
            </article>
            <article className="metric-card rounded-3xl p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Доля экспресс</p>
              <p className="mt-2 font-display text-3xl font-bold text-slate-950">{Math.round(expressShare * 100)}%</p>
            </article>
          </div>
        </div>

        <div className="fade-up-delay grid gap-4 sm:grid-cols-2">
          <div className="panel media-frame float-slow relative row-span-2 overflow-hidden rounded-[1.8rem]">
            <img src={HERO_MEDIA.url} alt={HERO_MEDIA.alt} loading="eager" decoding="async" className="h-full min-h-[20rem] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 bg-black/25 p-4 text-white backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">Мастерская</p>
              <p className="mt-2 text-sm font-medium leading-relaxed">
                Реалистичная визуальная среда сервиса: рабочие столы, инструмент, диагностика и компонентный ремонт.
              </p>
            </div>
          </div>

          <div className="panel media-frame float-slower overflow-hidden rounded-[1.4rem]">
            <img src={PHONE_PARTS_MEDIA.url} alt={PHONE_PARTS_MEDIA.alt} loading="lazy" decoding="async" className="h-56 w-full object-cover" />
          </div>
          <div className="panel media-frame overflow-hidden rounded-[1.4rem]">
            <img src={COMPONENT_CLOSEUP_MEDIA.url} alt={COMPONENT_CLOSEUP_MEDIA.alt} loading="lazy" decoding="async" className="h-56 w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="panel rounded-[1.8rem] p-6 md:p-8">
        <SectionHeading
          tag="Направления ремонта"
          title="Категории устройств с единой расчетной моделью стоимости и сроков"
          description="Категория устройства влияет на базовую диагностику, трудозатраты и резерв по комплектующим. Эти параметры используются в калькуляторе и при создании заявки."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {DEVICE_CATALOG.map((item) => (
            <article key={item.id} className="surface-highlight overflow-hidden rounded-3xl p-4 soft-ring">
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={DEVICE_MEDIA[item.id].url}
                  alt={DEVICE_MEDIA[item.id].alt}
                  loading="lazy"
                  decoding="async"
                  className="h-40 w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-bold text-slate-950">{item.label}</h3>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
                    от {formatMoney(item.baseDiagnosticFee)}
                  </span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-600">{item.categoryNote}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Базовая трудоемкость {formatHours(item.baseHours)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="panel rounded-[1.8rem] p-6 md:p-8">
          <SectionHeading
            tag="Процесс"
            title="Этапы ремонта понятны клиенту и совпадают с логикой админ-панели"
            description="Одинаковые статусы используются в трекинге и в рабочем интерфейсе администратора, поэтому коммуникация с клиентом остается прозрачной."
          />
          <div className="mt-6 grid gap-3">
            {workflow.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-200 bg-white/85 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Шаг {index + 1}</p>
                <h3 className="mt-2 font-display text-lg font-bold text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel rounded-[1.8rem] p-6 md:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-white/60">
              <img src={WORKBENCH_MEDIA.url} alt={WORKBENCH_MEDIA.alt} loading="lazy" decoding="async" className="h-48 w-full object-cover" />
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/60">
              <img src={TECHNICIAN_MEDIA.url} alt={TECHNICIAN_MEDIA.alt} loading="lazy" decoding="async" className="h-48 w-full object-cover" />
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white/85 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Последние заявки</p>
            <div className="mt-4 space-y-3">
              {recentTickets.length > 0 ? (
                recentTickets.map((ticket) => {
                  const snapshot = getTrackingSnapshot(ticket)
                  return (
                    <div key={ticket.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{ticket.ticketNumber}</p>
                        <p className="text-xs font-medium text-slate-500">
                          {ticket.request.brand} {ticket.request.model} · {formatMoney(ticket.estimate.pricing.total)}
                        </p>
                      </div>
                      <StatusPill stage={snapshot.stage} label={snapshot.stageLabel} />
                    </div>
                  )
                })
              ) : (
                <p className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-600">
                  Пока заявок нет. Создайте первую заявку на ремонт.
                </p>
              )}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Готово к выдаче</p>
                <p className="mt-1 font-display text-2xl font-bold text-slate-950">{readyTickets.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Онлайн трекинг</p>
                <p className="mt-1 font-display text-2xl font-bold text-slate-950">100%</p>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="panel rounded-[1.8rem] p-6 md:p-8">
        <SectionHeading
          tag="Галерея мастерской"
          title="Фотографии комплектующих и рабочего процесса для живого интерфейса"
          description="Изображения загружаются по оптимизированным URL и лениво, чтобы интерфейс выглядел насыщенно и оставался быстрым."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {GALLERY_MEDIA.map((asset) => (
            <figure key={asset.sourceUrl} className="overflow-hidden rounded-3xl border border-slate-200 bg-white soft-ring">
              <img src={asset.url} alt={asset.alt} loading="lazy" decoding="async" className="h-52 w-full object-cover" />
              <figcaption className="px-4 py-3 text-xs font-semibold text-slate-500">{asset.credit}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  )
}
