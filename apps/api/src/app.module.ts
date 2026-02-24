import { Module } from '@nestjs/common'
import { AdminController } from './admin/admin.controller'
import { AppController } from './app.controller'
import { AuthController } from './auth/auth.controller'
import { AuthGuard } from './auth/auth.guard'
import { AuthService } from './auth/auth.service'
import { DbService } from './db.service'
import { ReviewsController } from './reviews/reviews.controller'
import { ReviewsService } from './reviews/reviews.service'
import { TicketsController } from './tickets/tickets.controller'
import { TicketsService } from './tickets/tickets.service'

@Module({
  controllers: [AppController, AuthController, ReviewsController, TicketsController, AdminController],
  providers: [DbService, AuthService, AuthGuard, ReviewsService, TicketsService],
})
export class AppModule {}
