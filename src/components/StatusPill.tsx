import type { TicketStage } from '../types/domain.ts'

const STAGE_STYLES: Record<TicketStage, string> = {
  accepted: 'bg-slate-100 text-slate-700',
  diagnostics: 'bg-sky-100 text-sky-800',
  approval: 'bg-amber-100 text-amber-800',
  repair: 'bg-cyan-100 text-cyan-800',
  quality: 'bg-emerald-100 text-emerald-800',
  ready: 'bg-emerald-200 text-emerald-900',
}

export function StatusPill({ stage, label }: { stage: TicketStage; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide ${STAGE_STYLES[stage]}`}
    >
      {label}
    </span>
  )
}
