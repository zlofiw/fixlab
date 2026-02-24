import { Controller, Get } from '@nestjs/common'
import { TicketsService } from '../tickets/tickets.service'

@Controller('api/admin')
export class AdminController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('summary')
  summary() {
    return this.ticketsService.adminSummary()
  }
}
