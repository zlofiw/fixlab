import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import type { CreateTicketDto, UpdateTicketStageDto } from './types'
import { TicketsService } from './tickets.service'

@Controller('api/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  list(@Query('search') search?: string, @Query('stage') stage?: string) {
    return this.ticketsService.list(search, stage)
  }

  @Get('lookup')
  lookup(@Query('ticketNumber') ticketNumber?: string, @Query('accessCode') accessCode?: string) {
    return this.ticketsService.lookup(ticketNumber ?? '', accessCode ?? '')
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.ticketsService.getById(id)
  }

  @Post()
  create(@Body() body: CreateTicketDto) {
    return this.ticketsService.create(body)
  }

  @Patch(':id/stage')
  updateStage(@Param('id') id: string, @Body() body: UpdateTicketStageDto) {
    return this.ticketsService.updateStage(id, body?.stage)
  }
}
