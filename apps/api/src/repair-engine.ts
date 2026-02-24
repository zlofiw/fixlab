import { randomUUID } from 'node:crypto'
import { STAGE_LABELS } from './catalog'
import type {
  RepairEstimate,
  ServiceRequestInput,
  ServiceTicket,
  TicketStage,
  TrackingSnapshot,
} from './domain'
import { TICKET_STAGES } from './domain'

const DEVICE_BASE: Record<ServiceRequestInput['deviceType'], { diagnostic: number; labor: number; hours: number }> = {
  smartphone: { diagnostic: 6000, labor: 14000, hours: 8 },
  laptop: { diagnostic: 9000, labor: 22000, hours: 14 },
  tablet: { diagnostic: 7500, labor: 17000, hours: 10 },
  console: { diagnostic: 9500, labor: 24000, hours: 16 },
  tv: { diagnostic: 12000, labor: 28000, hours: 20 },
  audio: { diagnostic: 5000, labor: 12000, hours: 7 },
}

const ISSUE_FACTORS: Record<ServiceRequestInput['issueType'], { complexity: number; parts: number; extraHours: number }> = {
  screen: { complexity: 2.2, parts: 38000, extraHours: 4 },
  battery: { complexity: 1.6, parts: 21000, extraHours: 2 },
  charging: { complexity: 2.1, parts: 24000, extraHours: 3 },
  water: { complexity: 3.2, parts: 46000, extraHours: 6 },
  overheat: { complexity: 2.5, parts: 30000, extraHours: 5 },
  software: { complexity: 1.4, parts: 9000, extraHours: 2 },
  motherboard: { complexity: 3.6, parts: 62000, extraHours: 9 },
}

const URGENCY_FACTORS: Record<ServiceRequestInput['urgency'], { price: number; time: number }> = {
  standard: { price: 1, time: 1 },
  priority: { price: 1.14, time: 0.72 },
  express: { price: 1.25, time: 0.55 },
}

const STAGE_FRACTIONS = [0, 0.12, 0.3, 0.76, 0.9, 1] as const

function roundToStep(value: number, step = 100): number {
  return Math.round(value / step) * step
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function isTicketStage(value: string): value is TicketStage {
  return (TICKET_STAGES as readonly string[]).includes(value)
}

function generateTicketNumber(now: Date): string {
  const serial = Math.floor(Math.random() * 9000) + 1000
  const year = now.getFullYear().toString().slice(-2)
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `FXL-${year}${month}${day}-${serial}`
}

function generateAccessCode(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const code = digits.slice(-4) || String(Math.floor(Math.random() * 9000) + 1000)
  return code.padStart(4, '0')
}

export function sanitizeTicketNumber(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
}

export function sanitizeAccessCode(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6)
}

export function estimateRepair(
  request: ServiceRequestInput,
  openTicketsCount: number,
  now = new Date(),
): RepairEstimate {
  const device = DEVICE_BASE[request.deviceType]
  const issue = ISSUE_FACTORS[request.issueType]
  const urgency = URGENCY_FACTORS[request.urgency]
  const brandMultiplier = request.brand.trim() ? 1.05 : 1

  const diagnosticFee = roundToStep(device.diagnostic)
  const laborFee = roundToStep(device.labor * issue.complexity * brandMultiplier)
  const partsReserve = roundToStep(issue.parts)
  const urgencyFee = roundToStep((laborFee + partsReserve) * (urgency.price - 1))

  let discount = 0
  if (request.hasWarranty) {
    discount += roundToStep((diagnosticFee + laborFee) * 0.24)
  }
  if (request.repeatCustomer) {
    discount += roundToStep((laborFee + partsReserve) * 0.07)
  }

  const baseTotal = diagnosticFee + laborFee + partsReserve + urgencyFee
  discount = Math.min(discount, roundToStep(baseTotal * 0.35))
  const total = Math.max(8000, roundToStep(baseTotal - discount))
  const minTotal = roundToStep(total * 0.9)
  const maxTotal = roundToStep(total * 1.15)

  const queueDelayHours = Math.max(
    request.urgency === 'express' ? 2 : request.urgency === 'priority' ? 4 : 6,
    Math.ceil(openTicketsCount / 2) * (request.urgency === 'express' ? 1 : 4),
  )
  const repairHours = Math.ceil((device.hours + issue.extraHours + issue.complexity * 2) * urgency.time)
  const leadHours = queueDelayHours + repairHours

  return {
    pricing: {
      diagnosticFee,
      laborFee,
      partsReserve,
      urgencyFee,
      discount,
      total,
      minTotal,
      maxTotal,
    },
    queueDelayHours,
    repairHours,
    leadHours,
    promiseDate: addHours(now, leadHours).toISOString(),
  }
}

function buildTimeline(createdAt: Date, leadHours: number): ServiceTicket['timeline'] {
  return TICKET_STAGES.map((stage, index) => ({
    stage,
    label: STAGE_LABELS[stage],
    plannedAt: addHours(createdAt, Math.ceil(leadHours * STAGE_FRACTIONS[index])).toISOString(),
  }))
}

function buildNotes(request: ServiceRequestInput): string[] {
  const notes: string[] = []
  if (request.hasWarranty) {
    notes.push('Warranty coverage is validated after document check.')
  }
  if (request.urgency === 'express') {
    notes.push('Express lane is enabled for this order.')
  }
  if (request.issueType === 'water') {
    notes.push('Water damage cost may change after teardown.')
  }
  return notes
}

export function createTicket(
  request: ServiceRequestInput,
  openTicketsCount: number,
  now = new Date(),
): ServiceTicket {
  const estimate = estimateRepair(request, openTicketsCount, now)
  const timeline = buildTimeline(now, estimate.leadHours)

  return {
    id: randomUUID(),
    ticketNumber: generateTicketNumber(now),
    accessCode: generateAccessCode(request.phone),
    createdAt: now.toISOString(),
    request,
    estimate,
    timeline,
    notes: buildNotes(request),
  }
}

export function getTrackingSnapshot(ticket: ServiceTicket, now = new Date()): TrackingSnapshot {
  if (ticket.currentStage && isTicketStage(ticket.currentStage)) {
    const stage = ticket.currentStage
    return {
      stage,
      stageLabel: STAGE_LABELS[stage],
      progress: TICKET_STAGES.indexOf(stage) / (TICKET_STAGES.length - 1),
      etaDate: ticket.timeline[ticket.timeline.length - 1].plannedAt,
    }
  }

  const createdAt = new Date(ticket.createdAt).getTime()
  const readyAt = new Date(ticket.timeline[ticket.timeline.length - 1].plannedAt).getTime()
  const total = Math.max(1, readyAt - createdAt)
  const elapsed = clamp(now.getTime() - createdAt, 0, total)
  const progress = elapsed / total

  let currentStage = ticket.timeline[0]
  for (const step of ticket.timeline) {
    if (now.getTime() >= new Date(step.plannedAt).getTime()) {
      currentStage = step
    }
  }

  return {
    stage: currentStage.stage,
    stageLabel: currentStage.label,
    progress,
    etaDate: ticket.timeline[ticket.timeline.length - 1].plannedAt,
  }
}

export function isTicketReady(ticket: ServiceTicket): boolean {
  return getTrackingSnapshot(ticket).stage === 'ready'
}

export function matchTicket(ticket: ServiceTicket, ticketNumber: string, accessCode: string): boolean {
  return (
    ticket.ticketNumber === sanitizeTicketNumber(ticketNumber) &&
    ticket.accessCode === sanitizeAccessCode(accessCode)
  )
}

export function seedDemoTickets(): ServiceTicket[] {
  const now = new Date()
  const first = createTicket(
    {
      customerName: 'Aigerim Nurlankyzy',
      phone: '+7 (707) 444-55-66',
      email: 'aigerim@example.kz',
      deviceType: 'smartphone',
      brand: 'Samsung',
      model: 'Galaxy S22',
      issueType: 'screen',
      issueDetails: 'Touch input does not work after a drop.',
      urgency: 'standard',
      hasWarranty: true,
      repeatCustomer: false,
    },
    2,
    new Date(now.getTime() - 12 * 60 * 60 * 1000),
  )
  const second = createTicket(
    {
      customerName: 'Alikhan Seitov',
      phone: '+7 (701) 111-22-33',
      email: 'alikhan@example.kz',
      deviceType: 'laptop',
      brand: 'Dell',
      model: 'Latitude 7420',
      issueType: 'overheat',
      issueDetails: 'Fan noise and throttling under load.',
      urgency: 'priority',
      hasWarranty: false,
      repeatCustomer: true,
    },
    4,
    new Date(now.getTime() - 30 * 60 * 60 * 1000),
  )

  return [first, second]
}
