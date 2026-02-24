import type { TicketStage } from './domain'

export const STAGE_LABELS: Record<TicketStage, string> = {
  accepted: 'Accepted',
  diagnostics: 'Diagnostics',
  approval: 'Customer Approval',
  repair: 'Repair',
  quality: 'Quality Check',
  ready: 'Ready for Pickup',
}
