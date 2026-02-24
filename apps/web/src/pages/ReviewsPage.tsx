import { useEffect, useState } from 'react'
import { SectionHeading } from '../components/SectionHeading.tsx'
import { formatDateTime } from '../lib/format.ts'
import { reviewsApi } from '../lib/api.ts'
import type { Review } from '../types/domain.ts'

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [customerName, setCustomerName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  useEffect(() => {
    reviewsApi.list().then(setReviews).catch(() => setReviews([]))
  }, [])

  return (
    <div className="space-y-8 pb-6 pt-6 md:pt-10">
      <section className="card-surface rounded-4xl p-6 md:p-10">
        <SectionHeading tag="ОТЗЫВЫ" title="Отзывы клиентов FixLab" description="Оставьте отзыв после обслуживания и посмотрите оценки других клиентов." />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="card-surface rounded-4xl p-6">
          <h2 className="text-xl font-bold">Новый отзыв</h2>
          <form className="mt-4 grid gap-3" onSubmit={(event) => {
            event.preventDefault()
            reviewsApi.create({ customerName, rating, comment }).then((created) => {
              setReviews((prev) => [created, ...prev])
              setCustomerName('')
              setRating(5)
              setComment('')
            })
          }}>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="field-base rounded-2xl px-4 py-3" placeholder="Ваше имя" />
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="field-base rounded-2xl px-4 py-3">
              {[5,4,3,2,1].map((item) => <option key={item} value={item}>{item} из 5</option>)}
            </select>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="field-base min-h-28 rounded-2xl px-4 py-3" placeholder="Комментарий (минимум 10 символов)" />
            <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">Отправить отзыв</button>
          </form>
        </article>

        <article className="card-surface rounded-4xl p-6">
          <h2 className="text-xl font-bold">Лента отзывов</h2>
          <div className="mt-4 space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between"><p className="font-semibold">{review.customer_name}</p><p className="text-amber-600">★ {review.rating}</p></div>
                <p className="mt-2 text-sm text-slate-700">{review.comment}</p>
                <p className="mt-2 text-xs text-slate-500">{formatDateTime(review.created_at)}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
