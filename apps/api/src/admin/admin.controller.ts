import { Controller, Get, UseGuards } from '@nestjs/common'
import { SessionAuthGuard } from '../auth/session-auth.guard'
import { TicketsService } from '../tickets/tickets.service'

@Controller('api/admin')
@UseGuards(SessionAuthGuard)
export class AdminController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('summary')
  summary() {
    return this.ticketsService.adminSummary()
  }
}
