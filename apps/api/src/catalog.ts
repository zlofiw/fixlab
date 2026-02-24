import type { TicketStage } from './domain'

export const STAGE_LABELS: Record<TicketStage, string> = {
  accepted: 'Заявка принята',
  diagnostics: 'Диагностика',
  approval: 'Согласование с клиентом',
  repair: 'Ремонт',
  quality: 'Контроль качества',
  ready: 'Готово к выдаче',
}
