import type { TicketStage } from '../types/domain.ts'

const STAGE_STYLES: Record<TicketStage, string> = {
  accepted: 'border-slate-200 bg-slate-100 text-slate-700',
  diagnostics: 'border-sky-200 bg-sky-100 text-sky-800',
  approval: 'border-amber-200 bg-amber-100 text-amber-800',
  repair: 'border-cyan-200 bg-cyan-100 text-cyan-800',
  quality: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  ready: 'border-emerald-300 bg-emerald-200 text-emerald-950',
}

export function StatusPill({ stage, label }: { stage: TicketStage; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${STAGE_STYLES[stage]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}
