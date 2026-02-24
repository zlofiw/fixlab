import { BadRequestException, Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { DbService } from '../db.service'

interface ReviewRow {
  id: string
  customer_name: string
  rating: number
  comment: string
  created_at: string
}

@Injectable()
export class ReviewsService {
  constructor(private readonly dbService: DbService) {}

  list() {
    const db = this.dbService.connection()
    const stmt = db.prepare(`SELECT id, customer_name, rating, comment, created_at FROM reviews ORDER BY created_at DESC LIMIT 100`)
    return stmt.all() as unknown as ReviewRow[]
  }

  create(payload: { customerName?: string; rating?: number; comment?: string }) {
    const customerName = payload.customerName?.trim() ?? ''
    const comment = payload.comment?.trim() ?? ''
    const rating = Number(payload.rating ?? 0)

    if (!customerName || comment.length < 10 || rating < 1 || rating > 5) {
      throw new BadRequestException('Проверьте корректность отзыва')
    }

    const id = randomUUID()
    const createdAt = new Date().toISOString()
    const db = this.dbService.connection()
    const stmt = db.prepare(`INSERT INTO reviews (id, customer_name, rating, comment, created_at) VALUES (?, ?, ?, ?, ?)`)
    stmt.run(id, customerName, rating, comment, createdAt)

    return {
      id,
      customer_name: customerName,
      rating,
      comment,
      created_at: createdAt,
    }
  }
}
