import { Link } from 'react-router-dom'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-3">
      <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl border border-white/20 bg-[linear-gradient(145deg,#1b2f43,#0d8b88)] text-sm font-black text-white shadow-[0_12px_28px_rgba(8,20,35,0.32)] transition-transform duration-300 group-hover:-translate-y-0.5">
        <span className="absolute inset-x-1 top-1 h-4 rounded-full bg-white/20 blur-sm" />
        FL
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-xl font-bold tracking-tight text-slate-950">FixLab</span>
          <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Device Repair Studio
          </span>
        </span>
      )}
    </Link>
  )
}
