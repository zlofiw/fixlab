import { Link } from 'react-router-dom'
import { SectionHeading } from '../components/SectionHeading.tsx'
import { useTickets } from '../context/useTickets.ts'
import { DEVICE_CATALOG } from '../data/catalog.ts'
import { formatHours } from '../lib/format.ts'
import { isTicketReady } from '../lib/repairEngine.ts'

const processSteps = [
  {
    title: '1. Прием и первичная проверка',
    text: 'Фиксируем проблему, состояние корпуса и комплектность, присваиваем номер заказа.',
  },
  {
    title: '2. Диагностика по чек-листу',
    text: 'Проводим аппаратные и программные тесты и считаем стоимость до начала ремонта.',
  },
  {
    title: '3. Согласование с клиентом',
    text: 'Подтверждаем цену, сроки и набор деталей. Без согласования ремонт не запускаем.',
  },
  {
    title: '4. Ремонт и контроль качества',
    text: 'После замены и пайки выполняем стресс-тест и финальную выдачу с гарантией.',
  },
]

const qualityItems = [
  'Фиксируем каждый этап в заявке, можно отследить статус онлайн.',
  'Используем SLA-модель: очередь, срочность и сложность влияют на срок.',
  'Гарантийные обращения учитываются в расчете стоимости автоматически.',
]

export function HomePage() {
  const { tickets } = useTickets()
  const activeTickets = tickets.filter((ticket) => !isTicketReady(ticket))
  const avgLeadHours =
    activeTickets.length > 0
      ? Math.round(
          activeTickets.reduce((sum, ticket) => sum + ticket.estimate.leadHours, 0) /
            activeTickets.length,
        )
      : 0

  return (
    <div className="space-y-14 pb-6">
      <section className="grid items-start gap-8 pt-6 md:grid-cols-[1.08fr_0.92fr] md:pt-10">
        <div className="animate-reveal">
          <p className="mb-5 inline-flex rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold tracking-wide text-cyan-900 shadow-sm">
            ЦИФРОВОЙ СЕРВИСНЫЙ ЦЕНТР
          </p>
          <h1 className="font-display max-w-2xl text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
            FixLab ремонтирует электронику с прозрачной логикой по срокам и цене.
          </h1>
          <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-slate-600 md:text-lg">
            Реалистичный сайт сервисного центра: прием заявок, оценка стоимости, расчет очереди и
            трекинг каждого заказа по номеру.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/request"
              className="inline-flex items-center rounded-2xl bg-linear-to-r from-cyan-700 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-800/30 transition-transform duration-300 hover:-translate-y-0.5"
            >
              Оформить заявку
            </Link>
            <Link
              to="/track"
              className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors duration-200 hover:border-cyan-200 hover:text-cyan-800"
            >
              Отследить ремонт
            </Link>
          </div>
        </div>

        <div className="animate-reveal-delay card-surface rounded-4xl p-6 md:p-7">
          <h2 className="font-display text-2xl font-bold text-slate-900">Операционная панель</h2>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Модель учитывает загрузку мастерской и срочность. Все данные ниже вычисляются на основе
            заявок из API.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/80 p-4">
              <p className="text-xs font-bold text-cyan-800">Активные заявки</p>
              <p className="mt-1 text-3xl font-bold text-cyan-900">{activeTickets.length}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
              <p className="text-xs font-bold text-amber-800">Средний срок по SLA</p>
              <p className="mt-1 text-3xl font-bold text-amber-900">
                {activeTickets.length > 0 ? formatHours(avgLeadHours) : 'нет'}
              </p>
            </div>
          </div>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold text-slate-500">Что уже реализовано в логике проекта</p>
            <ul className="mt-3 space-y-2 text-sm font-medium text-slate-700">
              {qualityItems.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="card-surface rounded-4xl p-6 md:p-10">
        <SectionHeading
          tag="ПРОЦЕСС"
          title="Как строится ремонт в сервисном центре"
          description="Этапы отражают стандартную работу мастерской и напрямую связаны со статусами в трекинге."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {processSteps.map((step) => (
            <article key={step.title} className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="font-display text-xl font-bold text-slate-900">{step.title}</h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading
          tag="НАПРАВЛЕНИЯ РЕМОНТА"
          title="Какие устройства обслуживает FixLab"
          description="Категории из каталога участвуют в расчете базовой диагностики, трудозатрат и риска по деталям."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {DEVICE_CATALOG.map((item) => (
            <article key={item.id} className="card-surface rounded-3xl p-5">
              <h3 className="font-display text-xl font-bold text-slate-900">{item.label}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{item.categoryNote}</p>
              <p className="mt-4 text-xs font-bold tracking-wide text-cyan-900">
                База трудозатрат: {formatHours(item.baseHours)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
