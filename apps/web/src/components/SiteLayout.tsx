import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTickets } from '../context/useTickets.ts'
import { BrandMark } from './BrandMark.tsx'

const links = [
  { to: '/', label: 'Overview' },
  { to: '/services', label: 'Services' },
  { to: '/request', label: 'Book Repair' },
  { to: '/track', label: 'Track' },
  { to: '/admin', label: 'Admin' },
]

function navLinkClass(isActive: boolean): string {
  return isActive
    ? 'rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(15,23,42,0.18)]'
    : 'rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-white/70 hover:text-slate-950'
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
        <div className="mx-auto flex max-w-7xl flex-col gap-3 rounded-3xl border border-white/70 bg-white/70 p-3 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
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
                {apiAvailable ? 'API Online' : 'Local Cache'}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                Source: {dataSource}
              </span>
              {syncing ? (
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  Syncing...
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 lg:hidden"
              aria-expanded={open}
              aria-label="Toggle navigation"
            >
              Menu
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
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300"
              >
                Check Status
              </NavLink>
              <NavLink
                to="/request"
                className="rounded-xl bg-[linear-gradient(135deg,#12263a,#15847a)] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(18,38,58,0.22)]"
              >
                New Ticket
              </NavLink>
            </div>
          </div>

          {open ? (
            <div className="grid gap-2 border-t border-slate-200/80 pt-3 lg:hidden">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={
                    apiAvailable
                      ? 'inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-800'
                      : 'inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-amber-800'
                  }
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {apiAvailable ? 'API Online' : 'Local Cache'}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {dataSource}
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

      <footer className="border-t border-slate-200/80 bg-white/70 px-4 py-10 backdrop-blur md:px-6">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
          <BrandMark compact />
          <p className="text-sm font-medium leading-relaxed text-slate-600">
            FixLab is a repair-center simulation with operational logic for queueing, pricing ranges, SLA planning and order tracking. The UI is designed as a production-style front desk plus admin workflow.
          </p>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Web + Nest API Monorepo
          </div>
        </div>
      </footer>
    </div>
  )
}
