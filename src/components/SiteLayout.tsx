import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { BrandMark } from './BrandMark.tsx'

const links = [
  { to: '/', label: 'Главная' },
  { to: '/services', label: 'Услуги и цены' },
  { to: '/request', label: 'Оформить заявку' },
  { to: '/track', label: 'Отследить ремонт' },
]

function linkClass(isActive: boolean): string {
  return isActive
    ? 'rounded-xl bg-white px-3 py-2 text-sm font-bold text-cyan-900 shadow-sm shadow-cyan-900/10'
    : 'rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-cyan-50 hover:text-cyan-900'
}

export function SiteLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-float absolute -top-28 left-8 h-64 w-64 rounded-full bg-cyan-300/35 blur-3xl" />
        <div className="animate-float-delay absolute right-0 top-72 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <header className="sticky top-3 z-90 px-4">
        <div className="glass-nav mx-auto mt-3 max-w-7xl rounded-3xl px-4 py-3 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <BrandMark />

            <nav className="hidden items-center gap-1 md:flex">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className={({ isActive }) => linkClass(isActive)}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => setOpen((state) => !state)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 md:hidden"
              aria-expanded={open}
              aria-label="Открыть меню"
            >
              Меню
            </button>
          </div>

          {open && (
            <nav className="mt-3 grid gap-2 border-t border-slate-200/80 pt-3 md:hidden">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => linkClass(isActive)}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto mt-6 max-w-7xl px-4 pb-20 md:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/80 bg-white/60 px-4 py-8 backdrop-blur-sm md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <BrandMark compact />
          <p className="max-w-2xl font-medium">
            Учебный проект сервисного центра электроники. Логика расчета сроков и стоимости реализована
            как демонстрационная модель для практики.
          </p>
        </div>
      </footer>
    </div>
  )
}
