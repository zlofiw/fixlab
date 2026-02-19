import { Link } from 'react-router-dom'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-3">
      <span className="relative grid h-10 w-10 place-content-center rounded-2xl bg-linear-to-br from-cyan-600 to-amber-500 text-sm font-extrabold text-white shadow-lg shadow-cyan-700/20 transition-transform duration-300 group-hover:scale-105">
        FL
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-xl font-bold text-slate-900">FixLab</span>
          <span className="text-xs font-semibold tracking-wide text-cyan-800/80">
            сервисный центр электроники
          </span>
        </span>
      )}
    </Link>
  )
}
