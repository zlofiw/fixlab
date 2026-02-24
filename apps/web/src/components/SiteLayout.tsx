import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTickets } from '../context/useTickets.ts'
import { BrandMark } from './BrandMark.tsx'

const links = [
  { to: '/', label: 'Главная' },
  { to: '/services', label: 'Услуги и цены' },
  { to: '/request', label: 'Оформить заявку' },
  { to: '/track', label: 'Отследить ремонт' },
  { to: '/admin', label: 'Админ-панель' },
]

function navLinkClass(isActive: boolean): string {
  return isActive
    ? 'rounded-xl border border-slate-900 bg-slate-950 px-3 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)]'
    : 'rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-white/80 hover:bg-white/80 hover:text-slate-950 hover:shadow-[0_8px_18px_rgba(15,23,42,0.08)]'
}

export function SiteLayout() {
  const [open, setOpen] = useState(false)
  const { apiAvailable, dataSource, syncing } = useTickets()

  return (
    <div className="relative min-h-screen overflow-x-clip text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(255,174,86,0.2),transparent_35%),radial-gradient(circle_at_88%_10%,rgba(25,151,181,0.18),transparent_40%),linear-gradient(180deg,#f6f7fb_0%,#eef3f6_46%,#f8fbff_100%)]" />
        <div className="dot-grid absolute inset-0 opacity-60" />
      </div>

      <header className="sticky top-0 z-50 px-4 pt-4 md:px-6">
        <div className="glass-line soft-ring mx-auto flex max-w-7xl flex-col gap-3 rounded-3xl p-3 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <BrandMark />
            <div className="hidden items-center gap-2 lg:flex">
              <span
                className={
                  apiAvailable
                    ? 'inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-800'
                    : 'inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-amber-800'
                }
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {apiAvailable ? 'Сервер онлайн' : 'Сервер недоступен'}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                Источник: {dataSource === 'api' ? 'сервер' : 'нет соединения'}
              </span>
              {syncing ? (
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  Синхронизация...
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/80 bg-white/85 px-3 text-sm font-semibold text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.06)] lg:hidden"
              aria-expanded={open}
              aria-label="Открыть меню"
            >
              Меню
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 max-lg:hidden">
            <nav className="flex flex-wrap items-center gap-1">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className={({ isActive }) => navLinkClass(isActive)}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <NavLink
                to="/track"
                className="rounded-xl border border-slate-200 bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_20px_rgba(15,23,42,0.08)]"
              >
                Статус заявки
              </NavLink>
              <NavLink
                to="/request"
                className="rounded-xl bg-[linear-gradient(135deg,#12263a,#15847a)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(18,38,58,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(18,38,58,0.26)]"
              >
                Новая заявка
              </NavLink>
            </div>
          </div>

          {open ? (
            <div className="grid gap-2 rounded-2xl border border-white/70 bg-white/55 p-2 lg:hidden">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={
                    apiAvailable
                      ? 'inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-800'
                      : 'inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-amber-800'
                  }
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {apiAvailable ? 'Сервер онлайн' : 'Сервер недоступен'}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  Источник: {dataSource === 'api' ? 'сервер' : 'нет соединения'}
                </span>
              </div>
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => navLinkClass(isActive)}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto mt-6 max-w-7xl px-4 pb-20 md:px-6">
        <Outlet />
      </main>

      <footer className="px-4 pb-10 md:px-6">
        <div className="glass-line soft-ring mx-auto grid max-w-7xl gap-6 rounded-[1.6rem] px-5 py-6 md:grid-cols-[auto_1fr_auto] md:items-center md:px-6">
          <BrandMark compact />
          <p className="text-sm font-medium leading-relaxed text-slate-600">
            FixLab — учебный, но реалистичный сервисный сайт: прием заявок, расчет диапазона стоимости, срока обслуживания по очереди, трекинг ремонта и управление этапами через сервер.
          </p>
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Монопроект: сайт и сервер
          </div>
        </div>
      </footer>
    </div>
  )
}
