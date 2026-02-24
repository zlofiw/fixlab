import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center py-12">
      <div className="card-surface max-w-xl rounded-4xl p-8 text-center md:p-10">
        <p className="text-xs font-bold tracking-wide text-cyan-700">404</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-slate-900">Страница не найдена</h1>
        <p className="mt-3 text-sm font-medium text-slate-600">
          Проверьте ссылку или вернитесь на главную страницу FixLab.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-2xl bg-linear-to-r from-cyan-700 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-800/30"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  )
}
