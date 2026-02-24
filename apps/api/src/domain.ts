export const DEVICE_TYPES = [
  'smartphone',
  'laptop',
  'tablet',
  'console',
  'tv',
  'audio',
] as const

export const ISSUE_TYPES = [
  'screen',
  'battery',
  'charging',
  'water',
  'overheat',
  'software',
  'motherboard',
] as const

export const URGENCY_TYPES = ['standard', 'priority', 'express'] as const

export const TICKET_STAGES = [
  'accepted',
  'diagnostics',
  'approval',
  'repair',
  'quality',
  'ready',
] as const

export type DeviceType = (typeof DEVICE_TYPES)[number]
export type IssueType = (typeof ISSUE_TYPES)[number]
export type UrgencyType = (typeof URGENCY_TYPES)[number]
export type TicketStage = (typeof TICKET_STAGES)[number]

export interface ServiceRequestInput {
  customerName: string
  phone: string
  email: string
  deviceType: DeviceType
  brand: string
  model: string
  issueType: IssueType
  issueDetails: string
  urgency: UrgencyType
  hasWarranty: boolean
  repeatCustomer: boolean
}

export interface PricingBreakdown {
  diagnosticFee: number
  laborFee: number
  partsReserve: number
  urgencyFee: number
  discount: number
  total: number
  minTotal: number
  maxTotal: number
}

export interface RepairEstimate {
  pricing: PricingBreakdown
  queueDelayHours: number
  repairHours: number
  leadHours: number
  promiseDate: string
}

export interface TimelineStep {
  stage: TicketStage
  label: string
  plannedAt: string
}

export interface ServiceTicket {
  id: string
  ticketNumber: string
  accessCode: string
  createdAt: string
  currentStage?: TicketStage
  request: ServiceRequestInput
  estimate: RepairEstimate
  timeline: TimelineStep[]
  notes: string[]
}

export interface TrackingSnapshot {
  stage: TicketStage
  stageLabel: string
  progress: number
  etaDate: string
}
