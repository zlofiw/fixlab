import {
  DEVICE_CATALOG,
  ISSUE_CATALOG,
  STAGE_LABELS,
  URGENCY_POLICIES,
} from '../data/catalog.ts'
import type {
  DeviceCatalogItem,
  IssueCatalogItem,
  RepairEstimate,
  ServiceRequestInput,
  ServiceTicket,
  TicketStage,
  TrackingSnapshot,
  UrgencyPolicy,
  UrgencyType,
} from '../types/domain.ts'

const BRAND_MULTIPLIERS: Record<string, number> = {
  apple: 1.3,
  samsung: 1.1,
  xiaomi: 1.02,
  huawei: 1.08,
  honor: 1.04,
  asus: 1.05,
  lenovo: 1.04,
  dell: 1.09,
  hp: 1.07,
  acer: 1.03,
  sony: 1.08,
}

const STAGE_ORDER: TicketStage[] = [
  'accepted',
  'diagnostics',
  'approval',
  'repair',
  'quality',
  'ready',
]

const STAGE_FRACTIONS: number[] = [0, 0.12, 0.3, 0.76, 0.9, 1]

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function isKnownStage(stage: string): stage is TicketStage {
  return STAGE_ORDER.includes(stage as TicketStage)
}

function roundToStep(value: number, step = 100): number {
  return Math.round(value / step) * step
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

function resolveDevice(deviceType: ServiceRequestInput['deviceType']): DeviceCatalogItem {
  return DEVICE_CATALOG.find((item) => item.id === deviceType) ?? DEVICE_CATALOG[0]
}

function resolveIssue(issueType: ServiceRequestInput['issueType']): IssueCatalogItem {
  return ISSUE_CATALOG.find((item) => item.id === issueType) ?? ISSUE_CATALOG[0]
}

function resolveUrgency(urgencyType: UrgencyType): UrgencyPolicy {
  return URGENCY_POLICIES.find((item) => item.id === urgencyType) ?? URGENCY_POLICIES[0]
}

function resolveBrandMultiplier(brandRaw: string): number {
  const normalized = brandRaw.trim().toLowerCase()
  if (!normalized) {
    return 1
  }

  return BRAND_MULTIPLIERS[normalized] ?? 1.03
}

function calculateQueueDelayHours(
  openTicketsCount: number,
  urgency: UrgencyPolicy,
  complexity: number,
): number {
  const backlog = Math.max(0, openTicketsCount - 2)
  const baseDelay = 6 + Math.ceil(backlog / 3) * 10 + Math.ceil(complexity)

  if (urgency.id === 'express') {
    return Math.max(2, Math.min(6, Math.ceil(baseDelay * 0.3)))
  }

  if (urgency.id === 'priority') {
    return Math.max(4, Math.ceil(baseDelay * 0.55))
  }

  return baseDelay
}

function buildTimeline(createdAt: Date, leadHours: number): ServiceTicket['timeline'] {
  return STAGE_ORDER.map((stage, index) => ({
    stage,
    label: STAGE_LABELS[stage],
    plannedAt: addHours(createdAt, Math.ceil(leadHours * STAGE_FRACTIONS[index])).toISOString(),
  }))
}

function buildEstimate(
  request: ServiceRequestInput,
  openTicketsCount: number,
  now: Date,
): RepairEstimate {
  const device = resolveDevice(request.deviceType)
  const issue = resolveIssue(request.issueType)
  const urgency = resolveUrgency(request.urgency)
  const brandMultiplier = resolveBrandMultiplier(request.brand)

  const diagnosticFee = roundToStep(device.baseDiagnosticFee)
  const laborFee = roundToStep(device.baseLaborRate * issue.complexity * brandMultiplier)
  const partsReserve = roundToStep(
    issue.partsReserve * device.partsRiskFactor * (0.85 + issue.complexity / 8),
  )
  const urgencyFee = roundToStep((laborFee + partsReserve) * (urgency.priceMultiplier - 1))

  const subTotal = diagnosticFee + laborFee + partsReserve + urgencyFee
  let discount = 0

  if (request.hasWarranty) {
    discount += roundToStep((diagnosticFee + laborFee) * 0.24)
  }

  if (request.repeatCustomer) {
    discount += roundToStep((laborFee + partsReserve) * 0.07)
  }

  discount = Math.min(discount, roundToStep(subTotal * 0.36))

  const total = Math.max(8000, roundToStep(subTotal - discount))
  const minTotal = roundToStep(total * 0.9)
  const maxTotal = roundToStep(total * 1.16)

  const repairHours = Math.ceil(
    (device.baseHours + issue.extraHours + issue.complexity * 2) * urgency.timeMultiplier,
  )
  const queueDelayHours = calculateQueueDelayHours(openTicketsCount, urgency, issue.complexity)
  const leadHours = repairHours + queueDelayHours
  const promiseDate = addHours(now, leadHours).toISOString()

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
    promiseDate,
  }
}

export function estimateRepair(
  request: ServiceRequestInput,
  openTicketsCount: number,
  now = new Date(),
): RepairEstimate {
  return buildEstimate(request, openTicketsCount, now)
}

function generateTicketNumber(date: Date): string {
  const serial = Math.floor(Math.random() * 9000) + 1000
  const year = date.getFullYear().toString().slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `FXL-${year}${month}${day}-${serial}`
}

function generateAccessCode(phoneRaw: string): string {
  const digits = phoneRaw.replace(/\D/g, '')
  const fallback = String(Math.floor(Math.random() * 9000) + 1000)
  const code = digits.slice(-4)
  return (code || fallback).padStart(4, '0')
}

export function sanitizeTicketNumber(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9-]/g, '')
}

export function sanitizeAccessCode(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 6)
}

export function createTicket(
  request: ServiceRequestInput,
  openTicketsCount: number,
  now = new Date(),
): ServiceTicket {
  const estimate = buildEstimate(request, openTicketsCount, now)
  const timeline = buildTimeline(now, estimate.leadHours)
  const notes: string[] = []

  if (request.hasWarranty) {
    notes.push('Warranty coverage is verified after diagnostics and document check.')
  }
  if (request.urgency === 'express') {
    notes.push('Express lane enabled: diagnostics starts outside the standard queue.')
  }
  if (request.issueType === 'water') {
    notes.push('Liquid damage jobs can change after internal teardown and corrosion inspection.')
  }

  return {
    id: crypto.randomUUID(),
    ticketNumber: generateTicketNumber(now),
    accessCode: generateAccessCode(request.phone),
    createdAt: now.toISOString(),
    request,
    estimate,
    timeline,
    notes,
  }
}

export function getTrackingSnapshot(
  ticket: ServiceTicket,
  now = new Date(),
): TrackingSnapshot {
  if (ticket.currentStage && isKnownStage(ticket.currentStage)) {
    const currentStage = ticket.currentStage

    return {
      stage: currentStage,
      stageLabel: STAGE_LABELS[currentStage],
      progress: STAGE_ORDER.indexOf(currentStage) / (STAGE_ORDER.length - 1),
      etaDate: ticket.timeline[ticket.timeline.length - 1].plannedAt,
    }
  }

  const createdAt = new Date(ticket.createdAt).getTime()
  const readyAt = new Date(ticket.timeline[ticket.timeline.length - 1].plannedAt).getTime()
  const nowMs = now.getTime()
  const total = Math.max(1, readyAt - createdAt)
  const elapsed = clamp(nowMs - createdAt, 0, total)
  const progress = elapsed / total

  let currentStage = ticket.timeline[0]
  for (const step of ticket.timeline) {
    if (nowMs >= new Date(step.plannedAt).getTime()) {
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

export function isTicketReady(ticket: ServiceTicket, now = new Date()): boolean {
  return getTrackingSnapshot(ticket, now).stage === 'ready'
}

export function matchTicket(
  ticket: ServiceTicket,
  ticketNumber: string,
  accessCode: string,
): boolean {
  return (
    ticket.ticketNumber === sanitizeTicketNumber(ticketNumber) &&
    ticket.accessCode === sanitizeAccessCode(accessCode)
  )
}

export const TICKET_STAGE_ORDER = STAGE_ORDER
