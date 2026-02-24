import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../auth/auth.guard'
import { TicketsService } from '../tickets/tickets.service'

@Controller('api/admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('summary')
  summary() {
    return this.ticketsService.adminSummary()
  }
}
