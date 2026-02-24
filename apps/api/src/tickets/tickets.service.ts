import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import { DEVICE_TYPES, ISSUE_TYPES, TICKET_STAGES, URGENCY_TYPES } from '../domain'
import type { ServiceRequestInput, TicketStage } from '../domain'
import { createTicket } from '../repair-engine'
import { matchTicket, sanitizeAccessCode, sanitizeTicketNumber } from '../repair-engine'

@Injectable()
export class TicketsService {
  constructor(private readonly databaseService: DatabaseService) {}

  list(search?: string, stage?: string) {
    return this.databaseService.listTickets(search, stage)
  }

  getById(id: string) {
    const ticket = this.databaseService.getTicketById(id)
    if (!ticket) {
      throw new NotFoundException('Заявка не найдена')
    }
    return ticket
  }

  lookup(ticketNumber: string, accessCode: string) {
    const normalizedTicketNumber = sanitizeTicketNumber(ticketNumber)
    const normalizedAccessCode = sanitizeAccessCode(accessCode)

    const ticket = this.databaseService.findTicketByAccess(normalizedTicketNumber, normalizedAccessCode)
    if (!ticket || !matchTicket(ticket, normalizedTicketNumber, normalizedAccessCode)) {
      throw new NotFoundException('Заявка не найдена')
    }
    return ticket
  }

  create(payload: ServiceRequestInput) {
    const request = this.normalizeRequest(payload)
    const openCount = this.databaseService.countOpenTickets()
    const created = createTicket(request, openCount)
    return this.databaseService.createTicket(created)
  }

  updateStage(id: string, stage: TicketStage) {
    if (!(TICKET_STAGES as readonly string[]).includes(stage)) {
      throw new BadRequestException('Некорректный этап ремонта')
    }

    const updated = this.databaseService.updateTicketStage(id, stage)
    if (!updated) {
      throw new NotFoundException('Заявка не найдена')
    }

    return updated
  }

  adminSummary() {
    return this.databaseService.adminSummary()
  }

  private normalizeRequest(payload: ServiceRequestInput): ServiceRequestInput {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Некорректные данные заявки')
    }

    const requiredStrings: Array<
      keyof Pick<ServiceRequestInput, 'customerName' | 'phone' | 'brand' | 'model' | 'issueDetails'>
    > = ['customerName', 'phone', 'brand', 'model', 'issueDetails']

    for (const key of requiredStrings) {
      if (typeof payload[key] !== 'string' || !payload[key].trim()) {
        throw new BadRequestException(`Поле ${key} обязательно`)
      }
    }

    if (!(DEVICE_TYPES as readonly string[]).includes(payload.deviceType)) {
      throw new BadRequestException('Некорректный тип устройства')
    }
    if (!(ISSUE_TYPES as readonly string[]).includes(payload.issueType)) {
      throw new BadRequestException('Некорректный тип неисправности')
    }
    if (!(URGENCY_TYPES as readonly string[]).includes(payload.urgency)) {
      throw new BadRequestException('Некорректная срочность')
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
