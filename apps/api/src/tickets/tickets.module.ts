import { Module } from '@nestjs/common'
import { AdminController } from '../admin/admin.controller'
import { AuthModule } from '../auth/auth.module'
import { DatabaseModule } from '../database/database.module'
import { TicketsController } from './tickets.controller'
import { TicketsService } from './tickets.service'

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [TicketsController, AdminController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
