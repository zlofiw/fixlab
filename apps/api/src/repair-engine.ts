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
  smartphone: { diagnostic: 4000, labor: 9000, hours: 6 },
  laptop: { diagnostic: 6000, labor: 13000, hours: 10 },
  tablet: { diagnostic: 5000, labor: 10500, hours: 8 },
  console: { diagnostic: 6500, labor: 14500, hours: 11 },
  tv: { diagnostic: 8000, labor: 16000, hours: 13 },
  audio: { diagnostic: 3500, labor: 8000, hours: 5 },
}

const ISSUE_FACTORS: Record<ServiceRequestInput['issueType'], { complexity: number; parts: number; extraHours: number }> = {
  screen: { complexity: 2, parts: 22000, extraHours: 3 },
  battery: { complexity: 1.4, parts: 12000, extraHours: 2 },
  charging: { complexity: 1.9, parts: 15000, extraHours: 3 },
  water: { complexity: 2.8, parts: 28000, extraHours: 5 },
  overheat: { complexity: 2.2, parts: 18000, extraHours: 4 },
  software: { complexity: 1.3, parts: 5000, extraHours: 2 },
  motherboard: { complexity: 3.3, parts: 36000, extraHours: 7 },
}

const URGENCY_FACTORS: Record<ServiceRequestInput['urgency'], { price: number; time: number }> = {
  standard: { price: 1, time: 1 },
  priority: { price: 1.1, time: 0.78 },
  express: { price: 1.18, time: 0.62 },
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
    notes.push('Гарантийный случай подтверждается после проверки документов.')
  }
  if (request.urgency === 'express') {
    notes.push('Для заказа включен экспресс-режим обслуживания.')
  }
  if (request.issueType === 'water') {
    notes.push('При вскрытии после влаги стоимость может быть уточнена.')
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
