export type DeviceType =
  | 'smartphone'
  | 'laptop'
  | 'tablet'
  | 'console'
  | 'tv'
  | 'audio'

export type IssueType =
  | 'screen'
  | 'battery'
  | 'charging'
  | 'water'
  | 'overheat'
  | 'software'
  | 'motherboard'

export type UrgencyType = 'standard' | 'priority' | 'express'

export type TicketStage =
  | 'accepted'
  | 'diagnostics'
  | 'approval'
  | 'repair'
  | 'quality'
  | 'ready'

export interface DeviceCatalogItem {
  id: DeviceType
  label: string
  categoryNote: string
  baseDiagnosticFee: number
  baseLaborRate: number
  baseHours: number
  partsRiskFactor: number
}

export interface IssueCatalogItem {
  id: IssueType
  label: string
  complexity: number
  extraHours: number
  partsReserve: number
}

export interface UrgencyPolicy {
  id: UrgencyType
  label: string
  details: string
  priceMultiplier: number
  timeMultiplier: number
}

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

export interface AdminSummary {
  total: number
  active: number
  ready: number
  express: number
  totalAmount: number
  stageCounts: Record<TicketStage, number>
}


export interface Review {
  id: string
  customer_name: string
  rating: number
  comment: string
  created_at: string
}
