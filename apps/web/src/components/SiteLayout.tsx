import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTickets } from '../context/useTickets.ts'
import { BrandMark } from './BrandMark.tsx'

const links = [
  { to: '/', label: 'Главная' },
  { to: '/services', label: 'Услуги' },
  { to: '/request', label: 'Новая заявка' },
  { to: '/track', label: 'Проверка статуса' },
  { to: '/reviews', label: 'Отзывы' },
  { to: '/admin', label: 'Админка' },
]

function navLinkClass(isActive: boolean): string {
  return isActive
    ? 'rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white'
    : 'rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white/70 hover:text-slate-950'
}

export function SiteLayout() {
  const [open, setOpen] = useState(false)
  const { apiAvailable, dataSource, syncing } = useTickets()

  return (
    <div className="relative min-h-screen overflow-x-clip text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f6f7fb_0%,#eef3f6_46%,#f8fbff_100%)]" />
      </div>

      <header className="sticky top-0 z-50 px-4 pt-4 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 rounded-3xl border border-white/70 bg-white/80 p-3 shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <BrandMark />
            <div className="hidden items-center gap-2 lg:flex">
              <span className={apiAvailable ? 'inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800' : 'inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800'}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {apiAvailable ? 'Сервер онлайн' : 'Сервер недоступен'}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">Источник: {dataSource}</span>
              {syncing ? <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">Синхронизация...</span> : null}
            </div>
            <button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 lg:hidden" aria-expanded={open} aria-label="Переключить меню">Меню</button>
          </div>

          <div className="flex items-center justify-between gap-2 max-lg:hidden">
            <nav className="flex flex-wrap items-center gap-1">
              {links.map((link) => <NavLink key={link.to} to={link.to} className={({ isActive }) => navLinkClass(isActive)}>{link.label}</NavLink>)}
            </nav>
          </div>

          {open ? (
            <div className="grid gap-2 border-t border-slate-200/80 pt-3 lg:hidden">
              {links.map((link) => <NavLink key={link.to} to={link.to} className={({ isActive }) => navLinkClass(isActive)} onClick={() => setOpen(false)}>{link.label}</NavLink>)}
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto mt-6 max-w-7xl px-4 pb-20 md:px-6"><Outlet /></main>

      <footer className="border-t border-slate-200/80 bg-white/70 px-4 py-10 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
          <BrandMark compact />
          <p className="text-sm font-medium leading-relaxed text-slate-600">FixLab — сервисный центр: заявки, трекинг ремонта, администрирование и отзывы клиентов.</p>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Web + API</div>
        </div>
      </footer>
    </div>
  )
}
