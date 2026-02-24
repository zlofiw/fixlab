import { Module } from '@nestjs/common'
import { AdminController } from '../admin/admin.controller'
import { TicketsController } from './tickets.controller'
import { TicketsService } from './tickets.service'

@Module({
  controllers: [TicketsController, AdminController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
