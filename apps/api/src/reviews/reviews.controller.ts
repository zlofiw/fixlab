import { Body, Controller, Get, Post } from '@nestjs/common'
import { ReviewsService } from './reviews.service'

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  list() {
    return this.reviewsService.list()
  }

  @Post()
  create(@Body() body: { customerName?: string; rating?: number; comment?: string }) {
    return this.reviewsService.create(body)
  }
}
