import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { DEVICE_TYPES, ISSUE_TYPES, TICKET_STAGES, URGENCY_TYPES } from '../domain'
import type { ServiceRequestInput, ServiceTicket, TicketStage } from '../domain'
import { createTicket, getTrackingSnapshot, isTicketReady, matchTicket, seedDemoTickets } from '../repair-engine'

@Injectable()
export class TicketsService {
  private tickets: ServiceTicket[] = seedDemoTickets()

  list(search?: string, stage?: string) {
    const query = search?.trim().toLowerCase() ?? ''

    return this.tickets.filter((ticket) => {
      const snapshot = getTrackingSnapshot(ticket)

      if (stage && stage !== 'all' && snapshot.stage !== stage) {
        return false
      }

      if (!query) {
        return true
      }

      const haystack = [
        ticket.ticketNumber,
        ticket.request.customerName,
        ticket.request.phone,
        ticket.request.brand,
        ticket.request.model,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }

  getById(id: string) {
    const ticket = this.tickets.find((item) => item.id === id)
    if (!ticket) {
      throw new NotFoundException('Ticket not found')
    }
    return ticket
  }

  lookup(ticketNumber: string, accessCode: string) {
    const ticket = this.tickets.find((item) => matchTicket(item, ticketNumber, accessCode))
    if (!ticket) {
      throw new NotFoundException('Ticket not found')
    }
    return ticket
  }

  create(payload: ServiceRequestInput) {
    const request = this.normalizeRequest(payload)
    const openCount = this.tickets.filter((ticket) => !isTicketReady(ticket)).length
    const created = createTicket(request, openCount)
    this.tickets = [created, ...this.tickets]
    return created
  }

  updateStage(id: string, stage: TicketStage) {
    if (!(TICKET_STAGES as readonly string[]).includes(stage)) {
      throw new BadRequestException('Invalid stage')
    }

    const index = this.tickets.findIndex((ticket) => ticket.id === id)
    if (index < 0) {
      throw new NotFoundException('Ticket not found')
    }

    const next = { ...this.tickets[index], currentStage: stage }
    this.tickets = this.tickets.map((ticket, itemIndex) => (itemIndex === index ? next : ticket))
    return next
  }

  adminSummary() {
    const stageCounts: Record<TicketStage, number> = {
      accepted: 0,
      diagnostics: 0,
      approval: 0,
      repair: 0,
      quality: 0,
      ready: 0,
    }

    let totalAmount = 0
    let express = 0

    for (const ticket of this.tickets) {
      const snapshot = getTrackingSnapshot(ticket)
      stageCounts[snapshot.stage] += 1
      totalAmount += ticket.estimate.pricing.total
      if (ticket.request.urgency === 'express') {
        express += 1
      }
    }

    return {
      total: this.tickets.length,
      active: this.tickets.length - stageCounts.ready,
      ready: stageCounts.ready,
      express,
      totalAmount,
      stageCounts,
    }
  }

  private normalizeRequest(payload: ServiceRequestInput): ServiceRequestInput {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Invalid payload')
    }

    const requiredStrings: Array<keyof Pick<ServiceRequestInput, 'customerName' | 'phone' | 'brand' | 'model' | 'issueDetails'>> = [
      'customerName',
      'phone',
      'brand',
      'model',
      'issueDetails',
    ]

    for (const key of requiredStrings) {
      if (typeof payload[key] !== 'string' || !payload[key].trim()) {
        throw new BadRequestException(`Field ${key} is required`)
      }
    }

    if (!(DEVICE_TYPES as readonly string[]).includes(payload.deviceType)) {
      throw new BadRequestException('Invalid deviceType')
    }
    if (!(ISSUE_TYPES as readonly string[]).includes(payload.issueType)) {
      throw new BadRequestException('Invalid issueType')
    }
    if (!(URGENCY_TYPES as readonly string[]).includes(payload.urgency)) {
      throw new BadRequestException('Invalid urgency')
    }

    return {
      ...payload,
      customerName: payload.customerName.trim(),
      phone: payload.phone.trim(),
      email: payload.email?.trim() ?? '',
      brand: payload.brand.trim(),
      model: payload.model.trim(),
      issueDetails: payload.issueDetails.trim(),
      hasWarranty: Boolean(payload.hasWarranty),
      repeatCustomer: Boolean(payload.repeatCustomer),
    }
  }
}
